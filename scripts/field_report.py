#!/usr/bin/env python3
"""Measure always-on agent context across a sample of public repositories.

Discovery, sampling, measurement and the summary live in one file so the
numbers in docs/field-report.md can be re-derived instead of trusted. Standard
library only, plus the `git` and `agentdiet` binaries.

    export GITHUB_TOKEN=...
    python3 scripts/field_report.py --limit 80 --seed 7

Replication is not bit-for-bit: GitHub code search returns a different slice of
its index over time, and stars and repository sizes move. The method and the
shape of the distribution are what reproduce.
"""

import argparse
import json
import os
import random
import shutil
import statistics
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request

API = "https://api.github.com"
QUERIES = ("filename:AGENTS.md", "filename:CLAUDE.md")
PAGES = 3


def gh(url, token):
    req = urllib.request.Request(
        url,
        headers={
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github+json",
            "User-Agent": "agentdiet-field-report",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        print(f"  {url} -> {e.code}", file=sys.stderr)
        return {}
    except urllib.error.URLError as e:
        print(f"  {url} -> {e.reason}", file=sys.stderr)
        return {}


def discover(token):
    """Repositories with AGENTS.md or CLAUDE.md at the repository root."""
    found = {}
    for q in QUERIES:
        for page in range(1, PAGES + 1):
            data = gh(f"{API}/search/code?q={q}&per_page=100&page={page}", token)
            items = data.get("items", [])
            if not items:
                break
            for it in items:
                repo = it["repository"]["full_name"]
                entry = found.setdefault(repo, {"root_files": set(), "files": 0})
                if "/" not in it["path"]:
                    entry["root_files"].add(it["path"])
                entry["files"] += 1
            print(f"  {q} page {page}: {len(items)} files", file=sys.stderr)
            time.sleep(7)  # code search allows 30 requests a minute authenticated
    return {k: {"root_files": sorted(v["root_files"]), "files": v["files"]}
            for k, v in found.items() if v["root_files"]}


def metadata(repos, token):
    meta = {}
    for repo in sorted(repos):
        d = gh(f"{API}/repos/{repo}", token)
        if not d.get("size"):
            continue
        meta[repo] = {
            "size_kb": d["size"],
            "stars": d["stargazers_count"],
            "archived": d.get("archived", False),
            "fork": d.get("fork", False),
            "root_files": repos[repo]["root_files"],
        }
    return meta


def measure(repo, agentdiet):
    work = tempfile.mkdtemp(prefix="field-report-")
    dest = os.path.join(work, "repo")
    try:
        clone = subprocess.run(
            ["git", "clone", "--depth", "1", "--single-branch", "-q",
             f"https://github.com/{repo}.git", dest],
            capture_output=True, text=True, timeout=300,
        )
        if clone.returncode != 0:
            return {"repo": repo, "error": "clone"}
        # exit 1 means the report was produced and a budget was exceeded
        run = subprocess.run([agentdiet, dest, "--json"], capture_output=True, text=True, timeout=180)
        if run.returncode not in (0, 1) or not run.stdout.strip():
            return {"repo": repo, "error": "audit"}
        report = json.loads(run.stdout)
        report["repo"] = repo
        return report
    finally:
        shutil.rmtree(work, ignore_errors=True)


def percentile(sorted_values, p):
    if not sorted_values:
        return 0
    idx = min(len(sorted_values) - 1, int(round((len(sorted_values) - 1) * p)))
    return sorted_values[idx]


def summarize(rows):
    ok = [r for r in rows if "error" not in r]
    if not ok:
        print("nothing measured")
        return
    tokens = sorted(r["alwaysOnTokens"] for r in ok)
    total = sum(tokens)

    print(f"\nrepositories measured: {len(ok)}  (failed: {len(rows) - len(ok)})")
    print(f"always-on tokens  min {tokens[0]:,}  p25 {percentile(tokens, .25):,}  "
          f"median {percentile(tokens, .5):,}  p75 {percentile(tokens, .75):,}  "
          f"p90 {percentile(tokens, .9):,}  max {tokens[-1]:,}")
    print(f"mean {int(statistics.mean(tokens)):,}  total {total:,}")

    grades = {}
    for r in ok:
        grades[r["grade"]] = grades.get(r["grade"], 0) + 1
    print("grades:", dict(sorted(grades.items())))

    for budget in (1500, 4000, 8000, 16000, 32000):
        n = sum(1 for t in tokens if t > budget)
        print(f"  over {budget:6,} tokens: {n:2}/{len(ok)} ({n / len(ok) * 100:.0f}%)")

    for kind in ("duplicate", "near-duplicate", "oversize", "scope"):
        repos = sum(1 for r in ok if any(f.get("kind") == kind for f in r.get("findings", [])))
        toks = sum(f.get("tokens", 0) for r in ok for f in r.get("findings", [])
                   if f.get("kind") == kind)
        print(f"{kind:15} {repos:2}/{len(ok)} repositories, {toks:,} tokens")

    dup = sum(f.get("tokens", 0) for r in ok for f in r.get("findings", [])
              if f.get("kind") == "duplicate")
    if total:
        print(f"duplicated share of always-on: {dup:,}/{total:,} = {dup / total * 100:.1f}%")

    print("\ncost per 1,000 sessions at $3.00 per 1M input tokens:")
    for label, value in (("median", percentile(tokens, .5)), ("p90", percentile(tokens, .9)),
                         ("max", tokens[-1])):
        print(f"  {label:6} ${value * 0.003:,.2f}")


def main():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--limit", type=int, default=80, help="repositories to measure")
    p.add_argument("--seed", type=int, default=7, help="sampling seed")
    p.add_argument("--max-size-kb", type=int, default=25000)
    p.add_argument("--agentdiet", default="agentdiet")
    p.add_argument("--out", default="field-report.jsonl")
    args = p.parse_args()

    token = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")
    if not token:
        sys.exit("set GITHUB_TOKEN")

    print("discovering repositories", file=sys.stderr)
    repos = discover(token)
    print(f"  {len(repos)} repositories with a root AGENTS.md or CLAUDE.md", file=sys.stderr)

    print("reading metadata", file=sys.stderr)
    meta = metadata(repos, token)
    eligible = sorted(k for k, v in meta.items()
                      if not v["archived"] and not v["fork"] and 100 <= v["size_kb"] <= args.max_size_kb)
    print(f"  {len(eligible)} eligible", file=sys.stderr)

    sample = random.Random(args.seed).sample(eligible, min(args.limit, len(eligible)))
    print(f"  sampling {len(sample)} with seed {args.seed}", file=sys.stderr)

    rows = []
    with open(args.out, "w") as out:
        for i, repo in enumerate(sample, 1):
            row = measure(repo, args.agentdiet)
            row["stars"] = meta[repo]["stars"]
            row["size_kb"] = meta[repo]["size_kb"]
            rows.append(row)
            out.write(json.dumps(row) + "\n")
            out.flush()
            status = row.get("error") or f"{row['alwaysOnTokens']:,} tokens, grade {row['grade']}"
            print(f"  [{i:2}/{len(sample)}] {repo}: {status}", file=sys.stderr)

    summarize(rows)
    print(f"\nraw rows: {os.path.abspath(args.out)}")


if __name__ == "__main__":
    main()

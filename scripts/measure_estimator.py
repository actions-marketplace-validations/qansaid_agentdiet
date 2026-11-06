#!/usr/bin/env python3
"""Measure agentdiet's token estimate against a real tokenizer.

Development tooling, not a dependency of the binary. Requires tiktoken:

    pip install tiktoken
    python scripts/measure_estimator.py path/to/repo [path/to/repo ...]

Prints mean/median error, MAE and the share of files within +/-15%, plus the
worst offenders so a regression is obvious. `docs/estimator.md` records the
corpus this was last run on; update its table when the divisors change.
"""

import json
import os
import shutil
import statistics
import subprocess
import sys

try:
    import tiktoken
except ImportError:
    sys.exit("tiktoken is required: pip install tiktoken")


def binary() -> str:
    for candidate in ("agentdiet", "./agentdiet", os.path.join("bin", "agentdiet")):
        path = shutil.which(candidate) if "/" not in candidate else candidate
        if path and os.path.exists(path) and os.access(path, os.X_OK):
            return path
    sys.exit("agentdiet not found on PATH or at ./agentdiet — run `make build` first")


def main(argv: list[str]) -> int:
    repos = argv[1:] or ["."]
    enc = tiktoken.get_encoding("cl100k_base")
    rows = []

    for repo in repos:
        proc = subprocess.run([binary(), repo, "--json"], capture_output=True, text=True)
        if proc.returncode not in (0, 1):
            print(f"skip {repo}: {proc.stderr.strip()[:120]}", file=sys.stderr)
            continue
        for f in json.loads(proc.stdout)["files"]:
            path = os.path.join(repo, f["path"])
            try:
                text = open(path, encoding="utf-8", errors="replace").read()
            except OSError:
                continue
            exact = len(enc.encode(text))
            if exact < 50:
                continue
            rows.append((f["path"], f["tokens"], exact))

    if not rows:
        sys.exit("no files measured")

    errs = [(est - exact) / exact * 100 for _, est, exact in rows]
    deciles = statistics.quantiles(errs, n=10)

    print(f"files:        {len(rows)}")
    print(f"mean error:   {statistics.mean(errs):+.1f}%")
    print(f"median error: {statistics.median(errs):+.1f}%")
    print(f"MAE:          {statistics.mean(abs(e) for e in errs):.1f}%")
    print(f"p10 / p90:    {deciles[0]:+.1f}% / {deciles[-1]:+.1f}%")
    print(f"within +/-15%: {sum(1 for e in errs if abs(e) <= 15)}/{len(errs)}")

    print("\nworst:")
    for path, est, exact in sorted(rows, key=lambda r: -abs(r[1] / r[2] - 1))[:5]:
        print(f"  {path[-64:]:<64} est={est:5d} exact={exact:5d} {(est/exact-1)*100:+.1f}%")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))

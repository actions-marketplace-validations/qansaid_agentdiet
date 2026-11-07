# Field measurements

What agent context actually looks like in public repositories, measured rather
than asserted. Every number below comes from running `agentdiet` over a clone of
each repository, and the harness that produced it is in
[`scripts/field_report.py`](../scripts/field_report.py).

If you are deciding whether context bloat is a real problem or a marketing
story, this page is the evidence, including the parts that cut against the
story.

## Method

| Step | Detail |
| --- | --- |
| Discovery | GitHub code search for `filename:AGENTS.md` and `filename:CLAUDE.md`, first 3 pages of 100 results each, keeping repositories where the file sits at the root |
| Population | 432 repositories with a root `AGENTS.md` or `CLAUDE.md` |
| Filter | not archived, not a fork, repository size between 100 KB and 25 MB |
| Eligible | 304 repositories |
| Sample | 80 drawn with `random.Random(7).sample()` over the sorted eligible list |
| Measurement | `git clone --depth 1 --single-branch`, then `agentdiet <dir> --json` |
| Tool | agentdiet 0.1.8 |
| Date | 2026-11-07 |

Token counts are the tool's own estimates: prose at characters/4.5, fenced code
at characters/3.4, rounded up per segment, with a measured mean absolute error
of 8% against `cl100k_base`.

## Always-on context

The distribution is not a bell curve. Most repositories are lean, and a long
tail is not.

| Percentile | Always-on tokens |
| --- | --- |
| min | 0 |
| p25 | 801 |
| median | 1,504 |
| p75 | 3,147 |
| p90 | 8,446 |
| p95 | 11,111 |
| max | 80,229 |
| mean | 3,902 |

Grades over the 80 repositories: **A 40, B 26, C 5, D 5, F 4**.

| Budget | Repositories above it |
| --- | --- |
| 1,500 | 40 / 80 (50%) |
| 4,000 | 14 / 80 (18%) |
| 8,000 | 9 / 80 (11%) |
| 16,000 | 4 / 80 (5%) |
| 32,000 | 1 / 80 (1%) |

Half the sample is above the tool's own A-grade budget of 1,500 tokens, but only
one repository in eighty spends more than 32k tokens on instructions. The
interesting population is the 5 to 15% in between.

At $3.00 per million input tokens, that tail costs $25.34 per 1,000 sessions at
p90 and $240.69 at the maximum. The median repository costs $4.51, which is not
a problem anyone needs a tool for.

## What the findings say

| Finding | Repositories | Tokens involved |
| --- | --- | --- |
| duplication | 19 / 80 | 49,827 |
| near-duplicate | 11 / 80 | 22,556 |
| oversize (single file above 3,000 tokens) | 17 / 80 | 221,859 |
| scope (always-on content that belongs in a subdirectory) | 6 / 80 | not counted |

Duplicated content is **16.0%** of all always-on tokens in the sample
(49,827 of 312,219), spread across 19 repositories.

Read that as duplication in the repository, not duplication in a session. Two
always-on files holding the same bytes are both first-request candidates by this
tool's model, but a runtime normally reads one convention file, so a `CLAUDE.md`
that copies `AGENTS.md` often costs a session once rather than twice. The double
charge is certain only where a runtime loads both. What is certain either way is
drift: two 548-line files that have to be edited in step, and stop agreeing the
moment an edit lands in one of them.

The oversized single file is the more common failure. Five of the worst:

| Repository | Always-on | Largest file |
| --- | --- | --- |
| `msrbuilds/elementor-mcp` | 80,229 | `AGENTS.md`, 358,600 bytes |
| `KonghaYao/harness-perf-benchmark` | 20,404 | `CLAUDE.md` |
| `the-omics-os/cct` | 17,894 | `AGENTS.md` 8,947 and `CLAUDE.md` 8,947, a copy |
| `igorzheludkov/execbro` | 16,540 | `CLAUDE.md` |
| `TheAndrewStaker/mcp-midi-control` | 11,111 | `CLAUDE.md` |

`the-omics-os/cct` is the pattern this tool exists for: two files, the same 8,947
tokens, both loaded on every request. `agentdiet` reports 8,802 tokens as
recoverable duplication there.

## What this does not show

Being explicit about the limits, because the numbers are easy to over-read:

- **The population is not random.** It is the slice of GitHub's code search
  index that surfaces for those two filenames, not a sample of all GitHub
  repositories. Repositories *without* agent files are excluded by construction,
  so nothing here says how common agent files are.
- **80 is small.** The p90 and the maximum are one or two repositories each. A
  different seed moves them.
- **Nobody has shown that trimming context improves outcomes.** The cost figures
  are arithmetic on token counts, not billing data, and there is no before/after
  quality measurement here.
- **Duplication is counted per repository, not per session.** The tool counts
  duplicated always-on content; it cannot see which of those files a given
  runtime actually loads. Treat the duplicated token count as an upper bound on
  what a single session pays.
- **One repository measured zero files.** `GOVINSAGA/gobblecube-eta-challenge`
  was indexed with a root `AGENTS.md` but the clone had none, presumably removed
  or renamed since. It is left in the set rather than quietly dropped.
- **The estimator is an estimator.** Segmenting prose at 4.5 characters per
  token is close, not exact. Absolute values will differ from your provider's
  tokenizer; the ranking of repositories will not.

## Reproduce it

```bash
export GITHUB_TOKEN=...
python3 scripts/field_report.py --limit 80 --seed 7
```

Results are not bit-for-bit reproducible: the code search index moves, and stars
and repository sizes change. Seed 7 over the same candidate list does return the
same repositories, which is how the figures above were re-derived.

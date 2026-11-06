# How the token estimate is calibrated

`agentdiet` does not embed a tokenizer. It estimates:

```
tokens = ceil(prose_chars / 4.5) + ceil(fenced_code_chars / 3.4)
```

Every report prints this, so a number in a screenshot can always be traced to a
method. This document records how the divisors were chosen and what the error
actually is.

## Corpus

137 files classified as agent context, from five real repositories (skills,
`AGENTS.md`, `CLAUDE.md`, `.mcp.json`, cursor rules), each ≥ 50 tokens:

| Repository | Files |
| --- | --- |
| a Claude Code plugin monorepo with ~40 skills across six client directories | 45 |
| an agent-tooling repo with a large `CLAUDE.md` and `AGENTS.md` pair | 8 |
| a Paperclip fork with agent instructions scattered through packages | 81 |
| a Spring Boot application with a single 210-line `CLAUDE.md` | 1 |
| this repository | 2 |

Ground truth: `tiktoken`, `cl100k_base` (the closest widely available proxy for
current GPT/Claude-class tokenizers; exact counts differ per model family, which
is why the tool does not pretend to be exact).

## Divisor sweep

Segments split at fenced code blocks; each segment rounded up separately.

| prose chars/token | code chars/token | mean error | median error | MAE | within ±15% |
| --- | --- | --- | --- | --- | --- |
| 4.0 | 3.0 | +13.6% | +11.9% | 14.3% | 62.0% |
| 4.2 | 3.2 | +8.1% | +6.3% | 10.3% | 72.3% |
| 4.4 | 3.3 | +3.3% | +1.8% | 8.5% | 83.9% |
| **4.5** | **3.4** | **+1.2%** | **+0.4%** | **8.1%** | **87%** |
| 4.6 | 3.5 | -1.3% | -2.9% | 8.4% | 87.6% |
| 4.8 | 3.6 | -5.3% | -6.8% | 9.5% | 84.7% |
| 5.0 | 3.8 | -9.2% | -10.5% | 11.3% | 68.6% |

4.5 / 3.4 was chosen for near-zero bias at the best MAE. Final distribution on
the same corpus: p10 -10.5%, p90 +16.7%, 87% of files within ±15%, 98% within
±25%.

## Why not exact

- A 2 MB BPE vocabulary in the binary costs ~30 MB of download for precision
  nobody acts on: the tool answers "400 tokens or 4,000" and "did this grow by
  30% this quarter", both far outside an 8% error bar.
- Every model family ships a different tokenizer. Embedding one guarantees the
  number is wrong for the next model, and right only by accident today.
- An estimate that is printed is auditable. An exact count from an undisclosed
  vocabulary is not.

If you need exact counts for a specific model, run the file through that
tokenizer — `agentdiet` tells you which file is worth the trouble.

## Reproducing

`scripts/measure_estimator.py` is development tooling (requires `tiktoken`, not a
dependency of the binary):

```bash
pip install tiktoken
./agentdiet --json path/to/repo > /tmp/report.json
python scripts/measure_estimator.py path/to/repo /tmp/report.json
```

Changes to the divisor must come with a re-run of the sweep, and the table above
updated — the honest number matters more than the flattering one.

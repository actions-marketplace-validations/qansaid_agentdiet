# Security

`agentdiet` reads files in the repository it is pointed at and prints a report.
It has no network code, no telemetry, no configuration file, and no privilege
beyond the user running it.

## What it does with your files

- Walks the directory tree, skipping `node_modules`, `vendor`, `dist`, `build`,
  `target`, virtualenvs, `.git`, and other dependency/build trees.
- Reads each file it classifies as agent context into memory to count tokens.
- Prints paths, byte counts, line counts, token estimates, and duplicated-quoted
  sentence *counts* — never file contents.
- Writes nothing to disk.

`--json` output therefore contains file paths and numbers. If your paths are
sensitive, treat the report like `git ls-files`.

## Reporting a vulnerability

Open a private security advisory on this repository
(Security → Advisories → New draft advisory) rather than a public issue. Expect
a response within a week. There is no bounty.

## Scope

In scope: unexpected file reads outside the audited root, crashes on malformed
input, path traversal in report output, anything causing the tool to write or
execute code.

Out of scope: the accuracy of the token estimate (documented, ±15%), and grades
you disagree with (they are stated budgets in `README.md`).

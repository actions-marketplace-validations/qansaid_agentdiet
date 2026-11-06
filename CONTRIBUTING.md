# Contributing

Thanks for taking a look. This tool is deliberately small: a stdlib-only Go
binary, no runtime dependencies, no network calls. Please keep it that way.

## Quick start

```bash
git clone https://github.com/indraoverflow/agentdiet
cd agentdiet
make test     # go test ./... -race
make run      # audit this repository
```

Go 1.22 or newer. Nothing else.

## What makes a good contribution

**A new file convention** — your agent runtime loads a file `agentdiet` does not
know about. Add a case to `classify()` in `internal/audit/scan.go`, a fixture in
`internal/audit/audit_test.go`, and a row in the README's "What it finds" table.
Decide the tier carefully: *always-on* means the runtime injects it into every
request without the user asking. Getting that wrong is worse than not supporting
the file.

**A new finding** — a check that turns a number into an action. Findings must
carry a `Fix` string that a reader can execute without further research, and a
token count when the fix recovers tokens. Add a test that fails without the
check.

**Accuracy of the estimator** — if you have measured the estimator against a real
tokenizer on a corpus, open an issue with the numbers before changing the
divisors. The estimator's value is that it is stable and printed, not that it is
exact.

## What will be declined

- Anything that adds a third-party dependency to the binary.
- Anything that phones home, collects telemetry, or requires an account.
- Reporting a *total* across tiers. The tiers are the product.
- Findings that cannot be acted on, or that fire on ordinary repositories.
- New flags that duplicate an existing one.

## Pull requests

1. One change per pull request.
2. `make test` must pass; paste the output in the description.
3. `gofmt` clean. CI checks it and will fail otherwise.
4. Conventional commit title: `feat:`, `fix:`, `docs:`, `test:`, `chore:`.
5. If the change alters output, include the before/after of the affected lines.

## Releasing

Releases are cut from `main` with an immutable semver tag; the tag is the only
thing that may trigger `.github/workflows/release.yml`:

```bash
git tag -a v0.1.5 -m "agentdiet 0.1.5"
git push origin v0.1.5
```

The workflow stamps that tag into the binary, publishes the archives, and then
moves the `v1` major tag onto the released commit. `v1` is the ref README tells
users to pin, so it must always name the newest released commit — it is moved by
CI and never by hand. Never push `v1` yourself, and never use it as a release
tag: two tags on one commit make goreleaser publish twice onto the same release.

`go install github.com/indraoverflow/agentdiet@latest` cannot receive ldflags, so
the binary reads its version from the module build info; both install paths must
report the same tag (see `resolveVersion` in `main.go`).

## Reporting a bug

Include the runtime and version (Claude Code, Cursor, Codex, …), the output of
`agentdiet --json`, and the `agentdiet --version` line. If the report is about a
file that was not detected, name the file and where it sits in the tree — do not
paste a private repository's full contents.

## License

Contributions are accepted under the MIT license, the same as the project.

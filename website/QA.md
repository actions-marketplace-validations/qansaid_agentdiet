# QA report — AgentDiet website

Build under test: production build (`next build`, Next 16.4.5), served with
`next start` on `http://localhost:4321` and independently as a Docker image on
`http://localhost:4322`.

Node 26.12.1 · npm 12.0.2 · Linux 7.0.0-38-generic · Chromium via CDP at
1440×900, 834×1112, 390×844 (deviceScaleFactor 2) and 320–1920 for layout sweeps.

---

## 1. Static checks

| Check | Command | Result |
| --- | --- | --- |
| Lint | `npm run lint` | PASS — 0 errors, 0 warnings (`eslint-config-next` core-web-vitals + TS) |
| Types | `tsc --noEmit` | PASS — strict, plus `noUncheckedIndexedAccess` |
| Production build | `npm run build` | PASS — 7 routes, all prerendered static |
| Formatting/consistency | `npm run check` | PASS — lint → typecheck → build |

Routes emitted: `/`, `/_not-found`, `/docs`, `/icon.svg`, `/opengraph-image`,
`/robots.txt`, `/sitemap.xml`.

## 2. Content verification against the repository

Every product claim was checked against `github.com/qansaid/agentdiet` at commit
`2a55492` (v0.1.5 + module-path rename), not against memory.

| Claim on the site | Verified against |
| --- | --- |
| Install command `go install github.com/qansaid/agentdiet@latest` | `go.mod` module path, README install section, `action.yml` — **and executed against the module proxy before and after the v0.1.6 release (§8.11, §11)** |
| Flags, defaults (`--json`, `--badge`, `--window 200000`, `--price 3.00`, `--max-tokens 0`, `--top 8`, `--version`) | `main.go` flag set, and the running binary's `--help` |
| Flags accepted before *or* after the path | `parseInterleaved()` in `main.go` |
| Exit codes 0 / 1 / 2 | `main.go` `run()`; verified live: gate breach returned 1 |
| Four tiers and their meaning | `Tier*` constants and `classify()` in `internal/audit/scan.go` |
| Detected file list, including `.claude/` `.codex/` placement rules and root-only `.rules` | `classify()` switch — the site re-states the placement precisely rather than quoting the README's looser phrasing |
| Duplicate / near-duplicate (≥60%) / oversize (>3,000) / MCP surface findings | `detectFindings()` in `internal/audit/report.go` |
| Estimator: 4.5 prose, 3.4 fenced code, MAE 8.1%, 87% within ±15%, 137 files / 5 repos | `internal/audit/estimate.go`, `docs/estimator.md` |
| Grades A ≤1,500 · B ≤4,000 · C ≤8,000 · D ≤16,000 · F | `gradeBudgets` in `report.go` |
| Composite action, `max-tokens` input, `always-on-tokens`/`grade` outputs | `action.yml` |
| `qansaid/agentdiet@v1` is the moving major tag | `.github/workflows/release.yml` `retag-major` job; tag `v1` exists |
| MIT license | GitHub API `license.spdx_id == MIT`, `LICENSE` |
| Discussions enabled | GitHub API `has_discussions: true` |
| Read-only: never rewrites files | No write path in `scan.go`/`report.go`; only `os.ReadFile` |
| Roadmap items listed as *unshipped* (`--since`, `.agentdietignore`, exact tokenizer, `--explain`, SARIF, model presets) | README roadmap — every one is an unchecked box, so the site calls them planned |

Deliberately **not** published: star count, fork count, download count, user
count, testimonials, benchmark percentages, integration logos implying runtime
hooks. The repository had 0 stars / 0 forks at build time; the site shows no
number at all rather than a vanity zero.

### Demo numbers

The before/after figures are generated, not authored: a synthetic
`acme-platform` monorepo was built, audited with a compiled binary, and the JSON
fed into `lib/demo.ts` by a script. Reproduced values:

```
before: always-on 6,770 · grade C · $20.31 per 1k sessions · 7 findings
after:  always-on   711 · grade A ·  $2.13 per 1k sessions · 1 finding
delta:  -89.5% always-on tokens
```

Both terminals render the captured stdout verbatim (one banner line removed,
replaced by a shell prompt). The simulated fixture is labelled in the hero, the
section header, the terminal footnotes and a dedicated warning panel.

## 3. Layout and responsive behaviour

- **Horizontal overflow sweep, 320/360/390/414/768/1024/1280/1440/1920 px**:
  `document.scrollWidth <= innerWidth` at every width, on both `/` and `/docs`.
- Every element is checked against the viewport with intentional scroll
  containers excluded (`pre`, terminal bodies, code blocks).
- No text clipping: the only elements where `scrollWidth > clientWidth` are the
  two **sr-only** nodes (1px wide by design).
- Interactive target size: 0 buttons/tabbable controls below 24×24 CSS px
  (copy buttons are 30×26; theme toggle 36×36). Inline text links are exempt.
- Smallest type on the page: 10px monospace chips inside the report tables.
- Section rhythm is uniform: 96px vertical padding on every section; the hero
  uses 112/96.
- Desktop terminal panels fit without horizontal scrolling at 1440px — measured
  `scrollWidth == clientWidth` for both full reports.

## 4. Accessibility

| Check | Result |
| --- | --- |
| Headings | 1 × `h1`, no level skips (`h1→h2→h3→h4` audit returned `[]`) |
| Landmarks | `header`, `main`, `footer`, 5 × `nav` with labels |
| Language | `<html lang="en">` |
| Skip link | First focusable element, reveals on focus, targets `#main` |
| Images | 0 `<img>` without `alt`; decorative SVGs are `aria-hidden` |
| Accessible names | 0 buttons and 0 links without a name (`aria-label` or text) |
| Tabs | `role="tablist"`/`tab`/`tabpanel`, roving `tabindex`, `aria-selected`, `aria-controls`; Arrow/Home/End verified to move focus **and** selection across all three tab groups |
| Disclosure | Native `<details>`/`<summary>`; opens by click and by keyboard (Space) |
| Focus visibility | 2px accent outline with offset on every interactive element |
| Reduced motion | With `prefers-reduced-motion: reduce`, 0 elements remain hidden and reveals/caret animations are disabled |
| Contrast — dark | body 7.21:1 · faint/secondary 5.28:1 · h1 18.27:1 |
| Contrast — light | body 6.68:1 · faint/secondary 4.75:1 · h1 18.83:1 |
| Primary button | `#3ddc97` on `#04170e` ≈ 10.8:1 (dark), white on `#077a4d` ≈ 5.4:1 (light) |
| Theme | Preference persists across reloads; applied before first paint, so no flash (verified by reloading with `light` stored: `bg = rgb(252,252,251)`, no dark class) |

## 5. SEO and metadata

- `<title>`, meta description (238 chars), canonical, `robots: index, follow`.
- Open Graph: `og:title`, `og:description`, `og:image` (1200×630), `og:url`,
  `og:site_name`, `og:locale`; Twitter `summary_large_image`.
- `application/ld+json` `SoftwareApplication` with `offers: 0 USD`, MIT license,
  `codeRepository`, `author`/`maintainer` = Qansa. No `softwareVersion` field is
  emitted, so it cannot go stale.
- `/sitemap.xml` and `/robots.txt` both 200 and reference the canonical origin.
- OG image route returns `image/png`, 1200×630, 64 KB.
- Canonical origin comes from `NEXT_PUBLIC_SITE_URL`, with a safe fallback when
  the variable is unset **or empty** (see bug 2 below).

## 6. Performance (local production server)

| Metric | Value |
| --- | --- |
| Cumulative Layout Shift | 0 |
| LCP | 184 ms (local) |
| DOMContentLoaded | 158 ms |
| Requests / transfer on first load | 16 / 58 KB (compressed) |
| HTML | 247 KB raw, **41 KB gzipped** |
| Client JS + CSS + fonts | 840 KB on disk total, hashed and `immutable` |
| Fonts | Geist Sans/Mono self-hosted via `next/font`, preloaded, no third-party request |
| Third-party JS | none |

The largest HTML payload is the two verbatim reports plus the RSC stream; it is
static and cacheable, and there is no runtime data fetching.

## 7. Deployment verification

`Dockerfile` (3 stages) built and run from the **final** source:

```
docker build -t agentdiet-site .   → success, 75.0 MB
docker run -d -p 4322:3000         → health=healthy, user=nextjs (uid 1001)
GET /  /docs  /icon.svg  /robots.txt  /sitemap.xml  /opengraph-image  → 200
GET /nope                                                            → 404
canonical                                         https://agentdiet.qansa.dev/
```

Security headers confirmed on responses: `X-Content-Type-Options: nosniff`,
`Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: SAMEORIGIN`,
no `X-Powered-By`. Hashed assets return
`Cache-Control: public, max-age=31536000, immutable`.

## 8. Bugs found during QA and fixed

1. **Page-wide horizontal scroll on phones** (document 696 px wide at a 390 px
   viewport). Cause: a terminal's `min-w-max` content propagated through
   `min-width: auto` on grid items. Fixed with `min-w-0` on the four grid columns
   that contain scrollable panels; re-verified to 320 px.
2. **Docker build failed with `TypeError: Invalid URL`.** An empty
   `NEXT_PUBLIC_SITE_URL` build arg produced `metadataBase = new URL("")` while a
   stale image kept serving. Fixed with `.trim() || fallback`, and the image was
   rebuilt from scratch (`--no-cache`) to confirm.
3. **Copy buttons were 22 px tall** — under the 24×24 minimum target. Raised to
   26 px with a minimum width.
4. **Heading outline pollution** — footer column labels were `<h2>`, competing
   with section titles. Changed to `<p>`.
5. **Stray whitespace before the hero period** ("Context ."), caused by a JSX
   text node wrapping. Fixed with `{"."}`.
6. **Dead link**: the "Star on GitHub" CTA pointed at
   `/stargazers`, which returns 404 for this repository. Repointed at the repo.
7. **Light-theme secondary text at 4.05:1** — below AA. Darkened `--faint` to
   `#6a717c` → 4.75:1.
8. **Mislabelled file convention**: the docs implied `AGENT.md` is detected in
   `.claude/` and `.codex/`. It is root-only; the copy now says so precisely.
9. **Command/output mismatch** in the `--json` example: the displayed `jq`
   projection did not match the output shown. Command now matches its output.
10. **Duplicate command announcement** for screen readers in the terminal
    prompt (visible text plus an `sr-only` copy). Removed.
11. **The headline install command did not resolve** (found during QA, fixed by
    releasing v0.1.6 — see §11). Running
    `go install github.com/qansaid/agentdiet@latest` against the module proxy
    failed because every tag from v0.1.0 to v0.1.5 was cut before the module path
    moved to `qansaid`:

    ```
    github.com/qansaid/agentdiet@v0.1.5: parsing go.mod:
      module declares its path as: github.com/indraoverflow/agentdiet
              but was required as: github.com/qansaid/agentdiet
    ```

    The site briefly carried a dated install note plus a `/docs#quickstart`
    callout describing the workaround. Both were removed after v0.1.6 shipped and
    the exact command was re-verified against a clean module cache.

## 9. Screenshots

30 PNGs in [`screenshots/`](./screenshots), captured from this build:

| Group | Files |
| --- | --- |
| Desktop (1440×900) | `desktop-01-hero` … `desktop-15-docs-quickstart` |
| Mobile (390×844) | `mobile-01-hero` … `mobile-08-menu` |
| Tablet (834×1112) | `tablet-01-hero`, `tablet-02-how-it-works`, `tablet-03-example` |
| Light theme | `light-01-hero`, `light-02-example`, `light-03-dx` |

All 30 files were re-opened and profiled after capture to prove they are real
renders and not blank frames: unique colour counts range 430–2,631 per shot, mean
luminance 12.3–25.8 for the dark theme and 166–245 for the light theme, with no
image falling below the blank-frame threshold.

## 10. Known limitations of this QA pass

- **No automated visual-diff review.** The screenshots were produced but the
  image-analysis backend returned 429/timeout throughout the pass, so the visual
  judgement was replaced with structural assertions (overflow, clipping, target
  size, contrast, spacing rhythm, heading order). The screenshots exist for a
  human eye; treat them as the remaining review step, not as machine-verified.
- Browser checks ran over raw CDP rather than Playwright, since no browser test
  harness is installed in this environment. The assertions are equivalent to what
  a Playwright suite would check, but they are not committed as a test suite.
- Clipboard verification required a real input gesture plus granted permissions;
  a synthetic `.click()` correctly does *not* reach the clipboard API, and the
  component falls back to `execCommand` with a visible failure message.

## 11. Release verification — v0.1.6

The install defect in §8.11 was fixed at the source by cutting the release the
renamed module needed. Everything below was executed, not assumed.

| Step | Result |
| --- | --- |
| Preflight on `main` | `gofmt` clean · `go vet ./...` ok · `go test ./...` ok · build ok; `HEAD == origin/main == 2a55492` |
| Tag | annotated `v0.1.6` → `2a5549224bce6c291ec8b6d5c176f2b104cc4f01` |
| Workflow | `release` run 42334974115 — **success**; jobs `goreleaser` (7 steps) and `retag-major` (5 steps) both success |
| Published release | `v0.1.6`, 2026-11-07T03:39:42Z, not draft, not prerelease |
| Assets | 6 archives (linux/darwin/windows × amd64/arm64) + `checksums.txt` |
| Moving major tag | `v1` now points at `2a55492`, moved by CI, not by hand |
| Module proxy | `@v/v0.1.6.info` served immediately; `@latest` reported v0.1.5 for ~4 minutes (edge cache), then v0.1.6 |
| Install, exact site command | `go install github.com/qansaid/agentdiet@latest` in a clean `GOMODCACHE` → downloads v0.1.6, binary reports `agentdiet 0.1.6` |
| Binary behaviour | audit and `--max-tokens` gate (exit 1) verified with the installed binary |

Site follow-up: the temporary hero note and the `/docs#quickstart` install callout
were deleted after the release, the build was re-run (lint, typecheck, build all
clean, no horizontal overflow at 320–1440 px on `/` and `/docs`), and the
affected screenshots and Docker image were regenerated.

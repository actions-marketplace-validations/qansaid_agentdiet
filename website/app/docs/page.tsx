import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import { CopyButton } from "@/components/copy-button";
import { exitCodes, flags, gradeScale, installCommand, links } from "@/lib/site";

export const metadata: Metadata = {
  title: "Documentation",
  description:
    "Install AgentDiet, audit a repository, read the report, wire it into CI, and understand how the token estimate is calibrated.",
  alternates: { canonical: "/docs" },
  openGraph: {
    title: "AgentDiet documentation",
    description:
      "Install, audit, read the report, enforce a budget in CI, and see how the estimator is calibrated.",
    url: "/docs",
  },
};

const toc = [
  { id: "quickstart", label: "Quickstart" },
  { id: "cli", label: "CLI reference" },
  { id: "files", label: "Detected files" },
  { id: "report", label: "Reading the report" },
  { id: "findings", label: "Findings" },
  { id: "grading", label: "Grades" },
  { id: "estimator", label: "Token estimation" },
  { id: "ci", label: "CI integration" },
  { id: "troubleshooting", label: "Troubleshooting" },
];

const detected = [
  {
    tier: "always-on",
    files:
      "AGENTS.md · CLAUDE.md · GEMINI.md · JULES.md · .goosehints at the root or in .claude/ or .codex/; AGENT.md · README.agent.md at the root; .cursorrules · .windsurfrules · .clinerules · .rules at the root; .github/copilot-instructions.md",
  },
  {
    tier: "scoped",
    files: "The same instruction filenames in any subdirectory.",
  },
  {
    tier: "on-demand",
    files:
      "**/skills/**/SKILL.md · .cursor/rules/*.mdc · .claude/commands/** · .github/prompts/** · .github/instructions/** · .roo/rules/** · .continue/rules/**",
  },
  {
    tier: "config",
    files:
      ".mcp.json · .cursor/mcp.json · .vscode/mcp.json · .claude/settings.json · .codex/config.toml — MCP server names are extracted and reported.",
  },
];

const findingKinds = [
  {
    kind: "duplicate",
    what: "A paragraph that appears verbatim in two or more files, with the tokens recoverable by keeping it once.",
    fix: "Keep the text in one file and point at it from the others.",
  },
  {
    kind: "near-duplicate",
    what: "One instruction file at least 60% contained in another — a copy that was edited once and never again.",
    fix: "Keep one canonical file; the other should be a pointer, not a copy.",
  },
  {
    kind: "oversize",
    what: "A single always-on file above 3,000 tokens.",
    fix: "Move reference material into a skill or docs/ and keep the root file to rules.",
  },
  {
    kind: "scope",
    what: "MCP servers declared in the repository. Their tool schemas enter the prompt as soon as a session connects.",
    fix: "Disable servers you do not use in this repo — schema cost scales with tool count.",
  },
];

export default function DocsPage() {
  return (
    <div className="mx-auto w-full max-w-[1180px] px-5 sm:px-8">
      <div className="grid gap-12 py-14 lg:grid-cols-[190px_minmax(0,1fr)] lg:gap-16 lg:py-20">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <p className="eyebrow mb-4">Documentation</p>
          <nav aria-label="On this page">
            <ul className="flex flex-wrap gap-x-4 gap-y-2 lg:flex-col lg:gap-1.5">
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="text-[12.5px] text-muted transition-colors hover:text-fg"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-6 hidden border-t border-line pt-4 lg:block">
            <a
              href={links.repo}
              target="_blank"
              rel="noreferrer noopener"
              className="font-mono text-[10.5px] text-faint hover:text-fg"
            >
              github.com/qansaid/agentdiet ↗
            </a>
          </div>
        </aside>

        <article className="min-w-0">
          <header className="border-b border-line pb-8">
            <p className="eyebrow mb-4">AgentDiet</p>
            <h1 className="text-[clamp(1.9rem,4vw,2.6rem)] leading-[1.06] font-semibold tracking-[-0.03em]">
              Documentation
            </h1>
            <p className="mt-4 max-w-[62ch] text-[14.5px] leading-[1.65] text-muted">
              Everything below describes the shipped binary. The tool has six
              flags, three exit codes and no configuration file — the whole surface
              fits on this page.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-3 rounded-md border border-line bg-surface px-3 py-2">
                <code className="font-mono text-[11.5px] text-fg/90">
                  <span className="mr-1.5 text-faint select-none">$</span>
                  {installCommand}
                </code>
                <CopyButton value={installCommand} label="install command" />
              </div>
              <a
                href={links.releases}
                target="_blank"
                rel="noreferrer noopener"
                className="text-[12.5px] text-muted underline decoration-line-strong underline-offset-4 hover:text-fg hover:decoration-accent"
              >
                Prebuilt binaries ↗
              </a>
            </div>
          </header>

          <div className="prose-docs mt-10">
            <h2 id="quickstart">Quickstart</h2>
            <p>
              Install with Go 1.22 or newer, then run it inside any repository.
              Nothing is uploaded, nothing is written, and no account is involved.
            </p>
            <CodeBlock
              className="my-4"
              title="terminal"
              copyLabel="quickstart"
              code={`# 1. install
go install github.com/qansaid/agentdiet@latest

# 2. audit the repository you are standing in
agentdiet

# 3. audit somewhere else
agentdiet path/to/repo
`}
            />
            <p>
              Exit code <code>0</code> means the audit completed within budget,{" "}
              <code>1</code> means always-on tokens exceeded{" "}
              <code>--max-tokens</code>, and <code>2</code> means the audit could
              not run — usually a path that does not exist or is not a directory.
            </p>

            <h2 id="cli">CLI reference</h2>
            <p>
              Flags may appear before or after the path:{" "}
              <code>agentdiet . --json</code> and{" "}
              <code>agentdiet --json .</code> are the same command.
            </p>
            <div className="my-5 overflow-hidden rounded-lg border border-line">
              <div className="hidden grid-cols-[170px_110px_1fr] gap-4 border-b border-line bg-elevated/40 px-3 py-2 sm:grid">
                <span className="eyebrow">Flag</span>
                <span className="eyebrow">Default</span>
                <span className="eyebrow">Meaning</span>
              </div>
              {flags.map((f) => (
                <div
                  key={f.flag}
                  className="grid gap-1 border-b border-line px-3 py-2.5 last:border-b-0 sm:grid-cols-[170px_110px_1fr] sm:items-baseline sm:gap-4"
                >
                  <code className="font-mono text-[11.5px] text-fg">{f.flag}</code>
                  <code className="font-mono text-[11px] text-faint">
                    {f.default}
                  </code>
                  <span className="text-[12.5px] leading-[1.55] text-muted">
                    {f.meaning}
                  </span>
                </div>
              ))}
            </div>

            <h3>Exit codes</h3>
            <ul className="not-prose my-4 flex flex-col gap-2">
              {exitCodes.map((e) => (
                <li
                  key={e.code}
                  className="flex items-center gap-3 rounded-md border border-line bg-surface px-3 py-2"
                >
                  <code
                    className={`font-mono text-[11.5px] ${
                      e.code === "0"
                        ? "text-accent"
                        : e.code === "1"
                          ? "text-warn"
                          : "text-danger"
                    }`}
                  >
                    exit {e.code}
                  </code>
                  <span className="text-[12.5px] text-muted">{e.meaning}</span>
                </li>
              ))}
            </ul>

            <h2 id="files">Detected files</h2>
            <p>
              Detection is by filename and position, with no configuration.{" "}
              <code>node_modules</code>, <code>vendor</code>, <code>dist</code>,{" "}
              <code>build</code>, <code>target</code>, virtualenvs, <code>.git</code>{" "}
              and other dependency or build trees are skipped — a vendored{" "}
              <code>AGENTS.md</code> is not your prompt.
            </p>
            <div className="my-5 overflow-hidden rounded-lg border border-line">
              {detected.map((d) => (
                <div
                  key={d.tier}
                  className="grid gap-1.5 border-b border-line px-3 py-3 last:border-b-0 sm:grid-cols-[110px_1fr] sm:gap-4"
                >
                  <code className="font-mono text-[11px] text-accent">
                    {d.tier}
                  </code>
                  <span className="text-[12px] leading-[1.6] text-muted">
                    {d.files}
                  </span>
                </div>
              ))}
            </div>

            <h2 id="report">Reading the report</h2>
            <p>
              Files are grouped by tier, not by directory. The always-on section is
              the bill; the on-demand section is inventory that costs nothing until
              the agent opens it. Totals, grade and the cost line follow, then the
              findings.
            </p>
            <p>
              The <code>cost</code> line multiplies always-on tokens by{" "}
              <code>--price</code> (default <code>3.00</code> USD per 1M input
              tokens). It is a model of the context, not a claim about your
              invoice — change the flag to match your provider&apos;s rate.
            </p>
            <p>
              <code>--json</code> emits the same data with stable keys:{" "}
              <code>alwaysOnTokens</code>, <code>scopedTokens</code>,{" "}
              <code>onDemandTokens</code>, <code>grade</code>,{" "}
              <code>costPer1kSessionsUSD</code>, <code>files[]</code>,{" "}
              <code>findings[]</code>, <code>mcpServers[]</code>, plus the estimator
              description and the price used.
            </p>

            <h2 id="findings">Findings</h2>
            <div className="my-5 overflow-hidden rounded-lg border border-line">
              {findingKinds.map((f) => (
                <div
                  key={f.kind}
                  className="border-b border-line px-3 py-3 last:border-b-0"
                >
                  <code className="font-mono text-[11.5px] text-accent">
                    {f.kind}
                  </code>
                  <p className="mt-1.5 text-[12.5px] leading-[1.6] text-muted">
                    {f.what}
                  </p>
                  <p className="mt-1 text-[12px] text-faint">→ {f.fix}</p>
                </div>
              ))}
            </div>

            <h2 id="grading">Grades</h2>
            <p>
              The grade is absolute always-on tokens, not a percentage of the
              context window. A percentage makes every real repository an A and the
              grade becomes decoration.
            </p>
            <div className="my-5 overflow-hidden rounded-lg border border-line">
              {gradeScale.map((g) => (
                <div
                  key={g.grade}
                  className="grid grid-cols-[44px_110px_1fr] items-baseline gap-3 border-b border-line px-3 py-2.5 last:border-b-0"
                >
                  <span className="font-mono text-[13px] text-fg">{g.grade}</span>
                  <span className="font-mono text-[11.5px] text-muted tabular-nums">
                    {g.max}
                  </span>
                  <span className="text-[12.5px] text-muted">{g.reading}</span>
                </div>
              ))}
            </div>

            <h2 id="estimator">Token estimation</h2>
            <p>
              There is no tokenizer in the binary. Prose is estimated at 4.5
              characters per token and fenced code at 3.4, rounding each segment up,
              so a file made of many short paragraphs is not under-counted.
            </p>
            <p>
              The divisors were chosen by sweep against <code>cl100k_base</code> on
              137 real agent-configuration files from five repositories: mean error
              +1.2%, median +0.4%, mean absolute error 8.1%, 87% of files within
              ±15% (p10 −10.5%, p90 +16.7%). The corpus and the full sweep are in{" "}
              <a href={links.estimator} target="_blank" rel="noreferrer noopener">
                docs/estimator.md
              </a>
              , and <code>scripts/measure_estimator.py</code> re-runs it.
            </p>
            <p>
              If you need exact counts for a specific model, run the file through
              that tokenizer. The report tells you which file is worth the trouble.
            </p>

            <h2 id="ci">CI integration</h2>
            <p>
              The repository ships a composite action that installs the binary,
              audits the checkout and fails the job when{" "}
              <code>max-tokens</code> is exceeded. It also exposes{" "}
              <code>always-on-tokens</code> and <code>grade</code> as step outputs.
            </p>
            <CodeBlock
              className="my-4"
              title=".github/workflows/agent-context.yml"
              copyLabel="workflow"
              highlight={["max-tokens: 4000"]}
              code={`name: agent-context
on: [push, pull_request]
jobs:
  agentdiet:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: qansaid/agentdiet@v1
        with:
          max-tokens: 4000
`}
            />
            <p>
              Without the action, install with <code>go install</code> and run{" "}
              <code>agentdiet --max-tokens 4000</code> as a step: exit code 1 fails
              the job. To publish the number as a badge, write{" "}
              <code>agentdiet --badge</code> to a gist and point a shields.io
              endpoint badge at the raw URL — the workflow for that is in the
              repository README.
            </p>

            <h2 id="troubleshooting">Troubleshooting</h2>
            <h3>A file was not detected</h3>
            <p>
              Detection is a fixed table in{" "}
              <code>internal/audit/scan.go</code>. Open an issue with the filename
              and where it sits in the tree — do not paste a private
              repository&apos;s contents. There is a dedicated issue template for
              exactly this.
            </p>
            <h3>The token count differs from my provider</h3>
            <p>
              Expected. The number is an estimate calibrated against{" "}
              <code>cl100k_base</code>, and every model family ships a different
              tokenizer. Use it for order-of-magnitude decisions and trends, not for
              billing reconciliation.
            </p>
            <h3>Exit code 2</h3>
            <p>
              The audit could not run: the path does not exist, is not a directory,
              or <code>--window</code> was not positive. The message on stderr names
              the problem.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4 rounded-lg border border-line bg-surface/60 p-5">
              <p className="text-[12.5px] text-muted">
                Found something wrong on this page?
              </p>
              <a
                href={links.newIssue}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-1.5 text-[12.5px] text-fg underline decoration-line-strong underline-offset-4 hover:decoration-accent"
              >
                Open an issue
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </a>
              <Link
                href="/#example"
                className="ml-auto inline-flex items-center gap-1.5 text-[12.5px] text-muted hover:text-fg"
              >
                See the worked example
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

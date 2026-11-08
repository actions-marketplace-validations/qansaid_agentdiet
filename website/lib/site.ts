/**
 * Single source of truth for copy that must stay true to the repository.
 *
 * Every command, flag, threshold and number below was read out of
 * github.com/qansaid/agentdiet (main, 2a55492) or produced by running the
 * compiled binary against the fixture described in lib/demo.ts. If the CLI
 * changes, this file changes with it. Nothing here is aspirational.
 */

export const site = {
  name: "AgentDiet",
  tagline: "Less Context Waste. More Room for Engineering.",
  description:
    "AgentDiet measures, analyzes and helps you cut the context your AI coding agent loads on every request: the always-on token tax in AGENTS.md, CLAUDE.md, .cursorrules and MCP configs. One static Go binary, MIT licensed, enforceable in CI.",
  // Override with NEXT_PUBLIC_SITE_URL when deploying to a different domain.
  // `||` catches an empty string too: a build arg that is set but blank must
  // not produce an invalid metadataBase.
  url: process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://agentdiet.qansa.dev",
  org: "Qansa",
  license: "MIT",
  language: "Go",
} as const;

export const links = {
  repo: "https://github.com/qansaid/agentdiet",
  org: "https://github.com/qansaid",
  issues: "https://github.com/qansaid/agentdiet/issues",
  newIssue: "https://github.com/qansaid/agentdiet/issues/new/choose",
  discussions: "https://github.com/qansaid/agentdiet/discussions",
  contributing: "https://github.com/qansaid/agentdiet/blob/main/CONTRIBUTING.md",
  license: "https://github.com/qansaid/agentdiet/blob/main/LICENSE",
  releases: "https://github.com/qansaid/agentdiet/releases",
  latestRelease: "https://github.com/qansaid/agentdiet/releases/latest",
  action: "https://github.com/qansaid/agentdiet/blob/main/action.yml",
  readme: "https://github.com/qansaid/agentdiet#readme",
  ci: "https://github.com/qansaid/agentdiet/actions/workflows/ci.yml",
  estimator: "https://github.com/qansaid/agentdiet/blob/main/docs/estimator.md",
  star: "https://github.com/qansaid/agentdiet",
  fork: "https://github.com/qansaid/agentdiet/fork",
  security: "https://github.com/qansaid/agentdiet/blob/main/SECURITY.md",
} as const;

export const installCommand = "go install github.com/qansaid/agentdiet@latest";

/** Verbatim from `agentdiet --help`, minus the version banner. */
export const flags = [
  { flag: "--json", default: "off", meaning: "Emit the full report as JSON with stable keys, safe for dashboards." },
  { flag: "--badge", default: "off", meaning: "Emit a shields.io endpoint document instead of the report." },
  { flag: "--max-tokens", default: "0 (off)", meaning: "CI gate: exit 1 when always-on tokens exceed this number." },
  { flag: "--window", default: "200000", meaning: "Context window used for the share column." },
  { flag: "--price", default: "3.00", meaning: "USD per 1M input tokens, used for the cost line." },
  { flag: "--top", default: "8", meaning: "Maximum files listed per section." },
  { flag: "--version", default: "n/a", meaning: "Print the version and exit." },
] as const;

export const exitCodes = [
  { code: "0", meaning: "Audit completed, within budget." },
  { code: "1", meaning: "Always-on tokens exceeded --max-tokens." },
  { code: "2", meaning: "The audit could not run." },
] as const;

export const tiers = [
  {
    name: "always-on",
    when: "Every request, automatically",
    advice: "Keep it ruthless. Rules only.",
    weight: "bill",
  },
  {
    name: "scoped",
    when: "While editing that subtree",
    advice: "Fine, proportional to the work.",
    weight: "cheap",
  },
  {
    name: "on-demand",
    when: "Only when the agent opens it",
    advice: "Let it grow. Reference lives here.",
    weight: "free",
  },
  {
    name: "config",
    when: "Declares tools, not text",
    advice: "Audit the surface, not the word count.",
    weight: "surface",
  },
] as const;

export const capabilities = [
  {
    title: "Repository scanning",
    body: "Walks the tree, classifies each recognized instruction file into one of four tiers, and skips node_modules, vendor, dist, build and other dependency trees so a vendored AGENTS.md never counts as your prompt.",
    evidence: "internal/audit/scan.go",
  },
  {
    title: "Context token estimation",
    body: "Prose at 4.5 characters per token, fenced code at 3.4, each segment rounded up. Calibrated against cl100k_base on 137 real agent-config files: 8.1% mean absolute error, 87% within ±15%.",
    evidence: "internal/audit/estimate.go",
  },
  {
    title: "Duplicate instruction detection",
    body: "Normalizes paragraphs and reports text that appears in two or more files, with the token count you would recover by keeping it once. The CLAUDE.md-is-a-stale-copy-of-AGENTS.md drift, quantified.",
    evidence: "internal/audit/report.go",
  },
  {
    title: "Near-duplicate detection",
    body: "Flags one instruction file that is at least 60% contained in another, which is what a copy that was edited once and never again looks like.",
    evidence: "blockOverlap()",
  },
  {
    title: "Oversized file identification",
    body: "Any single always-on file above 3,000 tokens is called out by name, because one file that large is reading material, not a rule set.",
    evidence: "detectFindings()",
  },
  {
    title: "MCP tool surface analysis",
    body: "Extracts declared server names from the three config dialects in the wild (.mcp.json, .cursor/mcp.json and .vscode/mcp.json). This inventories the declared surface. It does not measure the schema tokens those servers add, because that depends on the client and the tools it exposes.",
    evidence: "mcpServerNames()",
  },
  {
    title: "Token budget enforcement",
    body: "Exits 1 when always-on context outgrows --max-tokens. Machine-checkable, so the number can only shrink on purpose instead of by hope.",
    evidence: "main.go",
  },
  {
    title: "GitHub Actions integration",
    body: "A composite action installs the binary, runs the audit, exposes always-on-tokens and grade as step outputs, and fails the job when the budget is exceeded.",
    evidence: "action.yml",
  },
] as const;

export const steps = [
  {
    id: "scan",
    label: "Discover",
    title: "Discover what the agent loads",
    body: "The walker finds instruction files by convention: no config file, no manifest to maintain. Each hit is sorted into always-on, scoped, on-demand or config, because only one of those four tiers is a bill.",
    caption: "No configuration. Convention beats a manifest you forget to update.",
  },
  {
    id: "analyze",
    label: "Analyze",
    title: "Price the overhead",
    body: "Tokens per file, share of the context window, estimated cost per 1,000 requests at one request per session, and an A–F grade on absolute always-on tokens. Then the findings: verbatim duplicates, near-duplicates, oversize files, declared MCP surface.",
    caption: "Absolute thresholds, not percentages of the window: a percentage makes every real repository an A.",
  },
  {
    id: "optimize",
    label: "Optimize",
    title: "Reorganize, do not just delete",
    body: "Every finding carries a fix you can execute. Rules stay in the root file; reference material moves to docs/ or a skill where it costs nothing until it is opened; the copy becomes a pointer to the canonical file.",
    caption: "The tool recommends. You edit. Nothing is rewritten behind your back.",
  },
  {
    id: "enforce",
    label: "Enforce",
    title: "Make the budget a gate",
    body: "Wire the action into pull requests with --max-tokens. The job fails when the always-on tax grows, so a regression is a red check instead of a slow drift nobody notices for a quarter.",
    caption: "Exit 0 within budget, 1 over budget, 2 when the audit could not run.",
  },
] as const;

export const faq = [
  {
    q: "What is AgentDiet?",
    a: "A single static Go binary that discovers recognized AI agent instruction files based on supported file conventions, and reports what those files cost: per request, per 1,000 requests at one request per session, and against a budget you can enforce in CI. It is one binary with no runtime dependencies, no config file and no network call.",
  },
  {
    q: "Why should I care about context consumption?",
    a: "Instruction files are loaded on every request, before you have typed anything. They grow by accretion, a rule per incident and a table per architecture decision, until the agent spends thousands of tokens of attention on stale instructions and reference material that was never meant to be read every time. Unlike skills, which cost nothing until opened, that context is paid for on every single request.",
  },
  {
    q: "Does AgentDiet require an API key?",
    a: "No. There is no account, no API key, no sign-in and no network access at all. The binary reads files from disk and prints a report.",
  },
  {
    q: "Does it send source code to external servers?",
    a: "No. The audit runs entirely on your machine, there is no telemetry and no configuration file that could point it somewhere else. The estimator is arithmetic on character counts, so nothing needs to be embedded or uploaded to count tokens.",
  },
  {
    q: "Which AI coding agents are supported?",
    a: "AgentDiet detects file conventions rather than connecting to runtimes: AGENTS.md, CLAUDE.md, GEMINI.md, JULES.md, .goosehints, AGENT.md, .cursorrules, .windsurfrules, .clinerules, .rules, .github/copilot-instructions.md, .cursor/rules/*.mdc, skills/**/SKILL.md, .claude/commands, .github/prompts, .roo/rules, .continue/rules, and MCP configs in .mcp.json, .cursor/, .vscode/ and .claude/. That covers Claude Code, Codex, Cursor, Gemini CLI, GitHub Copilot, Windsurf, Cline, Goose, Jules, Roo Code and Continue.",
  },
  {
    q: "Does it automatically modify instruction files?",
    a: "No. AgentDiet is read-only: it opens files, counts, and reports. Every finding carries a fix as text, and you decide how to apply it. Rewriting someone's AGENTS.md automatically would be a much larger claim than measuring it.",
  },
  {
    q: "Can I integrate it into CI/CD?",
    a: "Yes. There is a composite GitHub Action (qansaid/agentdiet@v1) that installs the binary, runs the audit and fails the job when always-on tokens exceed max-tokens. Without the action, install the binary with go install and run agentdiet --max-tokens 4000 as a step; exit code 1 is the gate.",
  },
  {
    q: "How accurate is the token count?",
    a: "It is an estimate, and it says so in every report. Prose is counted at 4.5 characters per token and fenced code at 3.4, calibrated against cl100k_base on 137 real agent-configuration files from five repositories: mean error +1.2%, mean absolute error 8.1%, 87% of files within ±15%. That is precise enough to answer \"400 tokens or 4,000\" and \"did it grow 30% this quarter\", which are the decisions the tool exists for. Exact per-model counts are a tokenizer's job, and the report tells you which file is worth running through one.",
  },
  {
    q: "Is AgentDiet free and open source?",
    a: "Yes. MIT licensed, developed in the open at github.com/qansaid/agentdiet, with no paid tier, no hosted product and no feature held back. Issues and discussions are open, and contributions are accepted under the same MIT license.",
  },
] as const;

export const gradeScale = [
  { grade: "A", max: "≤ 1,500", reading: "Lean." },
  { grade: "B", max: "≤ 4,000", reading: "Normal for a serious repo." },
  { grade: "C", max: "≤ 8,000", reading: "Start moving reference material out." },
  { grade: "D", max: "≤ 16,000", reading: "The agent is reading a document, not instructions." },
  { grade: "F", max: "> 16,000", reading: "Most of the prompt is policy nobody re-reads." },
] as const;

export const nav = [
  { href: "/#problem", label: "Problem" },
  { href: "/#capabilities", label: "Capabilities" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#example", label: "Example" },
  { href: "/docs", label: "Docs" },
] as const;

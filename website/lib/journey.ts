/**
 * Fixture data for the interactive journey sections.
 *
 * Every token count below comes from lib/demo.ts, which is generated from a
 * real run against the synthetic acme-platform repository. This file adds the
 * tree shape and the copy that explains *why* a file sits in a tier; it does not
 * introduce new measurements.
 */

export type Tier = "always-on" | "scoped" | "on-demand" | "config" | "ignored";

export type TreeRow = {
  id: string;
  name: string;
  path: string;
  depth: number;
  kind: "dir" | "file";
  tier?: Tier;
  tokens?: number;
  lines?: number;
  meta?: string;
  note?: string;
  /** Tokens shared verbatim with another file in this fixture. */
  duplicate?: number;
};

export const tierMeta: Record<
  Tier,
  { label: string; when: string; advice: string; tone: "warn" | "accent" | "muted" | "faint" }
> = {
  "always-on": {
    label: "always-on",
    when: "Injected on every request, before you type",
    advice: "Keep it ruthless: rules only.",
    tone: "warn",
  },
  scoped: {
    label: "scoped",
    when: "Loaded only while the agent edits that subtree",
    advice: "Proportional to the work, so let it be specific.",
    tone: "muted",
  },
  "on-demand": {
    label: "on-demand",
    when: "Costs nothing until the agent opens it",
    advice: "Reference material belongs here and can grow.",
    tone: "accent",
  },
  config: {
    label: "config",
    when: "Declares tools and servers, not instruction text",
    advice: "The MCP configuration inventory is a list of declarations, not a token count.",
    tone: "muted",
  },
  ignored: {
    label: "ignored",
    when: "Not read by any agent runtime",
    advice: "The walker skips it, so it does not appear in the bill.",
    tone: "faint",
  },
};

/**
 * Tree in display order. Directories exist to make the shape legible; only
 * files carry tokens. `ignored` rows exist because a scan that silently skipped
 * node_modules would look like a scan that missed it.
 */
export const treeRows: TreeRow[] = [
  {
    id: "root",
    name: "acme-platform",
    path: "acme-platform/",
    depth: 0,
    kind: "dir",
    meta: "git worktree",
  },
  { id: "github", name: ".github", path: ".github/", depth: 1, kind: "dir" },
  {
    id: "copilot",
    name: "copilot-instructions.md",
    path: ".github/copilot-instructions.md",
    depth: 2,
    kind: "file",
    tier: "always-on",
    tokens: 268,
    lines: 25,
    note: "The Copilot dialect of the same rules. Short after optimization, but still injected on every request while Copilot is the active agent.",
  },
  {
    id: "workflow",
    name: "agent-context.yml",
    path: ".github/workflows/agent-context.yml",
    depth: 2,
    kind: "file",
    tier: "config",
    meta: "workflow",
    note: "The CI gate itself. It declares when the audit runs; it is not part of the prompt.",
  },
  { id: "services", name: "services", path: "services/", depth: 1, kind: "dir" },
  {
    id: "billing",
    name: "AGENTS.md",
    path: "services/billing/AGENTS.md",
    depth: 2,
    kind: "file",
    tier: "scoped",
    tokens: 116,
    lines: 11,
    note: "Billing-specific rules. Loaded while the agent works inside services/billing, not while it edits the ledger.",
  },
  {
    id: "ledger",
    name: "AGENTS.md",
    path: "services/ledger/AGENTS.md",
    depth: 2,
    kind: "file",
    tier: "scoped",
    tokens: 80,
    lines: 8,
    note: "Ledger-specific rules. Small because it only states what differs from the repository defaults.",
  },
  { id: "skills", name: "skills", path: "skills/", depth: 1, kind: "dir" },
  {
    id: "deploy",
    name: "SKILL.md",
    path: "skills/deploy/SKILL.md",
    depth: 2,
    kind: "file",
    tier: "on-demand",
    tokens: 351,
    lines: 43,
    note: "The deploy runbook. It costs nothing until a deploy task opens it, which is why reference material can live here.",
  },
  {
    id: "incident",
    name: "SKILL.md",
    path: "skills/incident/SKILL.md",
    depth: 2,
    kind: "file",
    tier: "on-demand",
    tokens: 560,
    lines: 66,
    note: "Incident themes and escalation paths. Useful during an incident, irrelevant while writing a handler.",
  },
  {
    id: "node-modules",
    name: "node_modules",
    path: "node_modules/",
    depth: 1,
    kind: "dir",
    tier: "ignored",
    meta: "skipped",
    note: "Dependency tree. Vendored instruction files under it are not yours and never enter the bill.",
  },
  {
    id: "agents",
    name: "AGENTS.md",
    path: "AGENTS.md",
    depth: 1,
    kind: "file",
    tier: "always-on",
    tokens: 3086,
    lines: 285,
    duplicate: 2389,
    note: "The canonical rule set, plus schema tables, a glossary and a runbook that only one task in fifty needs. 100% contained in CLAUDE.md.",
  },
  {
    id: "claude",
    name: "CLAUDE.md",
    path: "CLAUDE.md",
    depth: 1,
    kind: "file",
    tier: "always-on",
    tokens: 3118,
    lines: 290,
    duplicate: 2389,
    note: "A hand-maintained copy of AGENTS.md. The two files share 2,389 tokens; whether a runtime loads both depends on the agent. The duplication also guarantees drift.",
  },
  {
    id: "cursorrules",
    name: ".cursorrules",
    path: ".cursorrules",
    depth: 1,
    kind: "file",
    tier: "always-on",
    tokens: 298,
    lines: 23,
    note: "Cursor's dialect: a third restatement of the same workflow rules for a third client.",
  },
  {
    id: "mcp",
    name: ".mcp.json",
    path: ".mcp.json",
    depth: 1,
    kind: "file",
    tier: "config",
    tokens: 93,
    meta: "6 servers",
    note: "MCP configuration inventory: six declared servers, github, jira, playwright, postgres, sentry and slack. The schema tokens those servers add are not measured here; that depends on the runtime and connected tools.",
  },
  {
    id: "readme",
    name: "README.md",
    path: "README.md",
    depth: 1,
    kind: "file",
    tier: "ignored",
    meta: "not scanned",
    note: "Human documentation. No runtime injects it automatically, so it is not part of the always-on bill.",
  },
];

/** The four always-on files, in descending token order. */
export const alwaysOnFiles = treeRows
  .filter((row) => row.kind === "file" && row.tier === "always-on")
  .sort((a, b) => (b.tokens ?? 0) - (a.tokens ?? 0));

/** A block that exists verbatim in two files; shown in the comparison panel. */
export const duplicateBlock = {
  heading: "## Git workflow",
  lines: [
    "Branch names are <type>/<issue>-<slug>.",
    "Rebase onto main before opening a PR.",
    "Squash-merge is the default.",
  ],
  tokens: 2389,
};

export type PipelineStage = {
  id: string;
  label: string;
  detail: string;
  duration: number;
};

export const pipelineStages: PipelineStage[] = [
  {
    id: "checkout",
    label: "actions/checkout@v4",
    detail: "Reads the pull request head. No credentials are requested.",
    duration: 420,
  },
  {
    id: "install",
    label: "qansaid/agentdiet@v1",
    detail: "Installs the static Go binary from the release asset.",
    duration: 460,
  },
  {
    id: "audit",
    label: "agentdiet . --max-tokens",
    detail: "Walks the tree, estimates tokens, compares instruction files.",
    duration: 900,
  },
  {
    id: "verdict",
    label: "budget gate",
    detail: "Exit 0 within budget, exit 1 above it. The job inherits the exit code.",
    duration: 420,
  },
];

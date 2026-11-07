/**
 * Measured demo data — generated from real runs, do not hand-edit.
 *
 * Fixture: a simulated "acme-platform" Go monorepo (AGENTS.md, a CLAUDE.md copy,
 * .cursorrules, copilot-instructions, subdirectory AGENTS.md files, two skills
 * and a six-server .mcp.json), audited before and after a reorganization.
 *
 * Captured with a build of github.com/qansaid/agentdiet main (2a55492) using
 * `agentdiet . --top 10`. It is an illustration of the report, not a benchmark:
 * the repository is synthetic and the numbers describe that fixture only.
 */

export type DemoFinding = {
  kind: "duplicate" | "near-duplicate" | "oversize" | "scope";
  tokens: number;
  detail: string;
  fix: string;
};

export type DemoFile = {
  tier: "always-on" | "scoped" | "on-demand" | "config";
  tokens: number;
  lines: number;
  path: string;
};

export type DemoRun = {
  tokens: number;
  grade: "A" | "B" | "C" | "D" | "F";
  budget: number;
  cost: number;
  share: number;
  scoped: number;
  onDemand: number;
  files: DemoFile[];
  findings: DemoFinding[];
};

export const demoMeta = {
  fixture: "acme-platform (simulated monorepo)",
  command: "agentdiet . --top 10",
  window: 200000,
  price: 3,
} as const;

export const demo: {
  before: DemoRun;
  after: DemoRun;
  beforeOutput: string;
  afterOutput: string;
} = {
  before: {
  "tokens": 6770,
  "grade": "C",
  "budget": 8000,
  "cost": 20.31,
  "share": 3.39,
  "scoped": 196,
  "onDemand": 911,
  "files": [
    {
      "tier": "always-on",
      "tokens": 3118,
      "lines": 290,
      "path": "CLAUDE.md"
    },
    {
      "tier": "always-on",
      "tokens": 3086,
      "lines": 285,
      "path": "AGENTS.md"
    },
    {
      "tier": "always-on",
      "tokens": 298,
      "lines": 23,
      "path": ".cursorrules"
    },
    {
      "tier": "always-on",
      "tokens": 268,
      "lines": 25,
      "path": ".github/copilot-instructions.md"
    },
    {
      "tier": "scoped",
      "tokens": 116,
      "lines": 11,
      "path": "services/billing/AGENTS.md"
    },
    {
      "tier": "scoped",
      "tokens": 80,
      "lines": 8,
      "path": "services/ledger/AGENTS.md"
    },
    {
      "tier": "on-demand",
      "tokens": 560,
      "lines": 66,
      "path": "skills/incident/SKILL.md"
    },
    {
      "tier": "on-demand",
      "tokens": 351,
      "lines": 43,
      "path": "skills/deploy/SKILL.md"
    },
    {
      "tier": "config",
      "tokens": 93,
      "lines": 26,
      "path": ".mcp.json"
    },
    {
      "tier": "config",
      "tokens": 41,
      "lines": 14,
      "path": ".claude/settings.json"
    }
  ],
  "findings": [
    {
      "kind": "duplicate",
      "tokens": 2389,
      "detail": "2,389 tokens repeated across AGENTS.md ↔ CLAUDE.md",
      "fix": "keep the text in one file and point at it from the others"
    },
    {
      "kind": "duplicate",
      "tokens": 762,
      "detail": "762 tokens repeated across AGENTS.md ↔ CLAUDE.md ↔ skills/incident/SKILL.md",
      "fix": "keep the text in one file and point at it from the others"
    },
    {
      "kind": "duplicate",
      "tokens": 236,
      "detail": "236 tokens repeated across AGENTS.md ↔ CLAUDE.md ↔ skills/deploy/SKILL.md",
      "fix": "keep the text in one file and point at it from the others"
    },
    {
      "kind": "near-duplicate",
      "tokens": 3086,
      "detail": "AGENTS.md is 100% contained in CLAUDE.md",
      "fix": "keep one canonical file; the other should be a pointer, not a copy"
    },
    {
      "kind": "oversize",
      "tokens": 3118,
      "detail": "CLAUDE.md is 3,118 tokens loaded on every request",
      "fix": "move reference material into a skill or docs/ and keep the root file to rules"
    },
    {
      "kind": "oversize",
      "tokens": 3086,
      "detail": "AGENTS.md is 3,086 tokens loaded on every request",
      "fix": "move reference material into a skill or docs/ and keep the root file to rules"
    },
    {
      "kind": "scope",
      "tokens": 0,
      "detail": "6 MCP servers declared (github, jira, playwright, postgres, sentry, slack); tool schemas enter the prompt on connect",
      "fix": "disable servers you do not use in this repo — schema cost scales with tool count"
    }
  ]
},
  after: {
  "tokens": 711,
  "grade": "A",
  "budget": 1500,
  "cost": 2.13,
  "share": 0.36,
  "scoped": 152,
  "onDemand": 480,
  "files": [
    {
      "tier": "always-on",
      "tokens": 540,
      "lines": 55,
      "path": "AGENTS.md"
    },
    {
      "tier": "always-on",
      "tokens": 72,
      "lines": 7,
      "path": ".github/copilot-instructions.md"
    },
    {
      "tier": "always-on",
      "tokens": 51,
      "lines": 6,
      "path": "CLAUDE.md"
    },
    {
      "tier": "always-on",
      "tokens": 48,
      "lines": 4,
      "path": ".cursorrules"
    },
    {
      "tier": "scoped",
      "tokens": 97,
      "lines": 11,
      "path": "services/billing/AGENTS.md"
    },
    {
      "tier": "scoped",
      "tokens": 55,
      "lines": 6,
      "path": "services/ledger/AGENTS.md"
    },
    {
      "tier": "on-demand",
      "tokens": 207,
      "lines": 28,
      "path": "skills/deploy/SKILL.md"
    },
    {
      "tier": "on-demand",
      "tokens": 188,
      "lines": 27,
      "path": "skills/incident/SKILL.md"
    },
    {
      "tier": "on-demand",
      "tokens": 85,
      "lines": 11,
      "path": "skills/schema/SKILL.md"
    },
    {
      "tier": "config",
      "tokens": 46,
      "lines": 14,
      "path": ".mcp.json"
    },
    {
      "tier": "config",
      "tokens": 41,
      "lines": 14,
      "path": ".claude/settings.json"
    }
  ],
  "findings": [
    {
      "kind": "scope",
      "tokens": 0,
      "detail": "2 MCP servers declared (github, postgres); tool schemas enter the prompt on connect",
      "fix": "disable servers you do not use in this repo — schema cost scales with tool count"
    }
  ]
},
  beforeOutput: "estimator: prose chars/4.5 + fenced-code chars/3.4, rounded up per segment (measured MAE 8% vs cl100k_base)\n\nALWAYS-ON   paid on every request, before you type\n   3,118   1.56%   290 L  CLAUDE.md\n   3,086   1.54%   285 L  AGENTS.md\n     298   0.15%    23 L  .cursorrules\n     268   0.13%    25 L  .github/copilot-instructions.md\n\nSCOPED   loaded only while editing that subtree\n     116   0.06%    11 L  services/billing/AGENTS.md\n      80   0.04%     8 L  services/ledger/AGENTS.md\n\nON-DEMAND   costs nothing until the agent opens it\n     560   0.28%    66 L  skills/incident/SKILL.md\n     351   0.18%    43 L  skills/deploy/SKILL.md\n\nCONFIG   not context; declares what the agent may call\n      93  mcp          .mcp.json\n      41  settings     .claude/settings.json\n\nTOTAL      6,770 always-on tokens  (3.39% of a 200,000-token window)\nGRADE      C  (budget 8,000)   on-demand surface: 911 tokens\nCOST       $20.31 per 1,000 sessions at $3.00 per 1M input tokens\n\nFINDINGS\n  · 2,389 tokens repeated across AGENTS.md ↔ CLAUDE.md\n    → keep the text in one file and point at it from the others\n  · 762 tokens repeated across AGENTS.md ↔ CLAUDE.md ↔ skills/incident/SKILL.md\n    → keep the text in one file and point at it from the others\n  · 236 tokens repeated across AGENTS.md ↔ CLAUDE.md ↔ skills/deploy/SKILL.md\n    → keep the text in one file and point at it from the others\n  · AGENTS.md is 100% contained in CLAUDE.md\n    → keep one canonical file; the other should be a pointer, not a copy\n  · CLAUDE.md is 3,118 tokens loaded on every request\n    → move reference material into a skill or docs/ and keep the root file to rules\n  · AGENTS.md is 3,086 tokens loaded on every request\n    → move reference material into a skill or docs/ and keep the root file to rules\n  · 6 MCP servers declared (github, jira, playwright, postgres, sentry, slack); tool schemas enter the prompt on connect\n    → disable servers you do not use in this repo — schema cost scales with tool count\n\n--json for machines  ·  --badge for shields.io  ·  github.com/qansaid/agentdiet",
  afterOutput: "estimator: prose chars/4.5 + fenced-code chars/3.4, rounded up per segment (measured MAE 8% vs cl100k_base)\n\nALWAYS-ON   paid on every request, before you type\n     540   0.27%    55 L  AGENTS.md\n      72   0.04%     7 L  .github/copilot-instructions.md\n      51   0.03%     6 L  CLAUDE.md\n      48   0.02%     4 L  .cursorrules\n\nSCOPED   loaded only while editing that subtree\n      97   0.05%    11 L  services/billing/AGENTS.md\n      55   0.03%     6 L  services/ledger/AGENTS.md\n\nON-DEMAND   costs nothing until the agent opens it\n     207   0.10%    28 L  skills/deploy/SKILL.md\n     188   0.09%    27 L  skills/incident/SKILL.md\n      85   0.04%    11 L  skills/schema/SKILL.md\n\nCONFIG   not context; declares what the agent may call\n      46  mcp          .mcp.json\n      41  settings     .claude/settings.json\n\nTOTAL      711 always-on tokens  (0.36% of a 200,000-token window)\nGRADE      A  (budget 1,500)   on-demand surface: 480 tokens\nCOST       $2.13 per 1,000 sessions at $3.00 per 1M input tokens\n\nFINDINGS\n  · 2 MCP servers declared (github, postgres); tool schemas enter the prompt on connect\n    → disable servers you do not use in this repo — schema cost scales with tool count\n\n--json for machines  ·  --badge for shields.io  ·  github.com/qansaid/agentdiet",
};

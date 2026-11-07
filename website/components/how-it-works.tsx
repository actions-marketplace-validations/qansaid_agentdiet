"use client";

import { useRef, useState, type ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { CodeBlock } from "@/components/code-block";
import { exitCodes, steps } from "@/lib/site";

const tierTone: Record<string, string> = {
  "always-on": "border-warn/35 text-warn",
  scoped: "border-line-strong text-muted",
  "on-demand": "border-accent/35 text-accent",
  config: "border-line-strong text-muted",
};

function ScanVisual() {
  const rows: Array<[string, keyof typeof tierTone, string]> = [
    ["AGENTS.md", "always-on", "3,086"],
    ["CLAUDE.md", "always-on", "3,118"],
    [".cursorrules", "always-on", "298"],
    [".github/copilot-instructions.md", "always-on", "268"],
    ["services/billing/AGENTS.md", "scoped", "116"],
    ["skills/deploy/SKILL.md", "on-demand", "351"],
    [".mcp.json", "config", "93"],
  ];
  return (
    <div className="overflow-hidden rounded-lg border border-line">
      {rows.map(([path, tier, tokens]) => (
        <div
          key={path}
          className="flex items-center gap-3 border-b border-line px-3.5 py-2 last:border-b-0"
        >
          <span className="min-w-0 flex-1 truncate font-mono text-[11px] text-fg/85">
            {path}
          </span>
          <span
            className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] ${tierTone[tier] ?? ""}`}
          >
            {tier}
          </span>
          <span className="w-11 shrink-0 text-right font-mono text-[10.5px] text-faint tabular-nums">
            {tokens}
          </span>
        </div>
      ))}
    </div>
  );
}

function AnalyzeVisual() {
  const stats = [
    ["always-on", "6,770", "tokens per request"],
    ["grade", "C", "budget 8,000"],
    ["cost", "$20.31", "per 1,000 sessions"],
    ["window", "3.39%", "of 200,000 tokens"],
  ];
  return (
    <div>
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
        {stats.map(([label, value, note]) => (
          <div key={label} className="bg-surface px-3.5 py-3">
            <p className="font-mono text-[9.5px] tracking-wide text-faint uppercase">
              {label}
            </p>
            <p className="mt-1.5 font-mono text-[16px] tabular-nums text-fg">
              {value}
            </p>
            <p className="mt-0.5 text-[10.5px] text-faint">{note}</p>
          </div>
        ))}
      </div>
      <div className="mt-3 overflow-hidden rounded-lg border border-line">
        {[
          ["verbatim duplication", "3 findings", "2,389 + 762 + 236"],
          ["near-duplicate file", "1 finding", "100% contained"],
          ["oversize always-on file", "2 findings", "above 3,000 tokens"],
          ["MCP tool surface", "1 finding", "6 servers"],
        ].map(([kind, count, detail]) => (
          <div
            key={kind}
            className="flex items-center gap-3 border-b border-line px-3.5 py-2 last:border-b-0"
          >
            <span className="w-24 shrink-0 font-mono text-[10.5px] text-warn/90">
              {count}
            </span>
            <span className="flex-1 text-[12px] text-muted">{kind}</span>
            <span className="font-mono text-[10.5px] text-faint">{detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function OptimizeVisual() {
  const rows = [
    ["AGENTS.md", "3,086", "540", "rules only"],
    ["CLAUDE.md", "3,118", "51", "pointer file"],
    ["reference material", "always-on", "docs/", "not counted"],
  ];
  return (
    <div className="overflow-hidden rounded-lg border border-line">
      {rows.map(([name, before, after, note]) => (
        <div
          key={name}
          className="flex items-center gap-3 border-b border-line px-3.5 py-3 last:border-b-0"
        >
          <span className="min-w-0 flex-1 truncate font-mono text-[11.5px] text-fg/85">
            {name}
          </span>
          <span className="font-mono text-[11px] text-faint tabular-nums line-through decoration-line-strong">
            {before}
          </span>
          <ArrowRight className="size-3 text-faint" aria-hidden="true" />
          <span className="w-14 font-mono text-[11px] text-accent tabular-nums">
            {after}
          </span>
          <span className="hidden w-28 text-right text-[10.5px] text-faint sm:block">
            {note}
          </span>
        </div>
      ))}
    </div>
  );
}

function EnforceVisual() {
  return (
    <div className="space-y-3">
      <CodeBlock
        title=".github/workflows/agent-context.yml"
        copyLabel="workflow"
        highlight={["max-tokens: 4000"]}
        code={`name: agent-context
on: [pull_request]
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
      <div className="flex flex-wrap items-center gap-2">
        {exitCodes.map((e) => (
          <span
            key={e.code}
            className="inline-flex items-center gap-1.5 rounded border border-line bg-surface px-2 py-1 font-mono text-[10.5px] text-muted"
          >
            <span
              className={
                e.code === "0"
                  ? "text-accent"
                  : e.code === "1"
                    ? "text-warn"
                    : "text-danger"
              }
            >
              exit {e.code}
            </span>
            <span className="text-faint">{e.meaning}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const visuals: ReactNode[] = [
  <ScanVisual key="scan" />,
  <AnalyzeVisual key="analyze" />,
  <OptimizeVisual key="optimize" />,
  <EnforceVisual key="enforce" />,
];

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    const last = steps.length - 1;
    let next = active;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = active === last ? 0 : active + 1;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = active === 0 ? last : active - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else return;
    e.preventDefault();
    setActive(next);
    refs.current[next]?.focus();
  }

  const step = steps[active] ?? steps[0]!;

  return (
    <section id="how-it-works" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-20 sm:px-8 sm:py-24">
        <SectionHeading
          index="03"
          kicker="How it works"
          title="Scan, analyze, optimize, enforce"
          lede="Four steps, one pass, no server round-trip. The first two are a command; the last two are decisions you make with the output."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-[minmax(0,290px)_minmax(0,1fr)] lg:gap-12">
          <div
            role="tablist"
            aria-label="How AgentDiet works"
            aria-orientation="vertical"
            onKeyDown={onKeyDown}
            className="scroll-thin flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
          >
            {steps.map((s, i) => {
              const selected = i === active;
              return (
                <button
                  key={s.id}
                  ref={(node) => {
                    refs.current[i] = node;
                  }}
                  role="tab"
                  id={`step-tab-${s.id}`}
                  aria-selected={selected}
                  aria-controls={`step-panel-${s.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(i)}
                  className={`group relative flex min-w-[132px] shrink-0 items-center gap-3 rounded-md px-3 py-2.5 text-left transition-colors lg:min-w-0 lg:px-3 lg:py-3 ${
                    selected
                      ? "bg-elevated text-fg"
                      : "text-muted hover:bg-elevated/50 hover:text-fg"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute top-2 bottom-2 left-0 w-px ${selected ? "bg-accent" : "bg-transparent"}`}
                  />
                  <span
                    className={`font-mono text-[10.5px] tabular-nums ${selected ? "text-accent" : "text-faint"}`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-[13.5px] font-medium">{s.label}</span>
                </button>
              );
            })}
            <p className="hidden pt-4 font-mono text-[10.5px] leading-relaxed text-faint lg:block">
              every step is local.
              <br />
              no upload, no request.
            </p>
          </div>

          <div
            key={step.id}
            role="tabpanel"
            id={`step-panel-${step.id}`}
            aria-labelledby={`step-tab-${step.id}`}
            tabIndex={0}
            className="min-h-[320px] min-w-0 animate-[rise_0.4s_cubic-bezier(0.22,1,0.36,1)] outline-none"
          >
            <h3 className="text-[17px] font-medium tracking-[-0.015em]">
              {step.title}
            </h3>
            <p className="mt-2 max-w-[62ch] text-[13.5px] leading-[1.65] text-muted">
              {step.body}
            </p>
            <div className="mt-6">{visuals[active]}</div>
            <p className="mt-4 flex items-start gap-2 font-mono text-[10.5px] leading-relaxed text-faint">
              <span className="text-accent" aria-hidden="true">
                ↳
              </span>
              {step.caption}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

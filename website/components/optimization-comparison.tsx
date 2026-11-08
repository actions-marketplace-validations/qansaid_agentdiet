"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Check, Play } from "lucide-react";
import { demo } from "@/lib/demo";
import { duplicateBlock } from "@/lib/journey";
import { Bar, BarScale, Count } from "@/components/motion/primitives";

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const money = (n: number) => `$${n.toFixed(2)}`;

const before = demo.before;
const after = demo.after;
const drop = ((before.tokens - after.tokens) / before.tokens) * 100;

const beforeFiles = before.files.filter((file) => file.tier === "always-on");
const afterFiles = after.files.filter((file) => file.tier === "always-on");
const maxTokens = Math.max(...beforeFiles.map((file) => file.tokens), 1);

const rows = beforeFiles.map((file) => {
  const next = afterFiles.find((candidate) => candidate.path === file.path);
  return {
    path: file.path,
    before: file.tokens,
    after: next?.tokens ?? 0,
    note: file.path.endsWith("AGENTS.md") ? "rules only" : file.path.endsWith("CLAUDE.md") ? "pointer" : "short form",
  };
});

const moved = [
  { from: "Schema, glossary, endpoint catalog", to: "docs/ · opened when needed" },
  { from: "Incident and deploy runbooks", to: "skills/ · free until opened" },
  { from: "The CLAUDE.md copy", to: "a 6-line pointer" },
  { from: "6 declared MCP servers", to: "2 the repository uses" },
];

const viewCopy = {
  before: {
    grade: before.grade,
    tokens: before.tokens,
    cost: before.cost,
    budget: before.budget,
    servers: 6,
    tone: "warn" as const,
    label: "As it accreted, all always-on.",
  },
  after: {
    grade: after.grade,
    tokens: after.tokens,
    cost: after.cost,
    budget: after.budget,
    servers: 2,
    tone: "accent" as const,
    label: "Reorganized by tier, nothing deleted.",
  },
};

function DuplicateDiagram({ deduped }: { deduped: boolean }) {
  return (
    <div className="mt-6 border-t border-line pt-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h4 className="text-[12px] font-medium text-fg">
          What happens to the duplicated block
        </h4>
        <span className="font-mono text-[9.5px] text-faint">
          <Count
            value={deduped ? 0 : duplicateBlock.tokens}
            format={fmt}
            duration={0.7}
          />{" "}
          duplicated tokens · AGENTS.md ↔ CLAUDE.md
        </span>
      </div>

      <div className="mt-3 grid grid-cols-1 items-stretch gap-3 sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
        <figure className="overflow-hidden rounded border border-line bg-elevated/30">
          <figcaption className="flex items-center justify-between border-b border-line px-3 py-1.5 font-mono text-[10px] text-faint">
            <span>before · two copies</span>
            <span className="text-warn">both injected</span>
          </figcaption>
          <div className="grid grid-cols-2 divide-x divide-line">
            {["AGENTS.md", "CLAUDE.md"].map((file) => (
              <div key={file} className="px-2.5 py-2">
                <p className="truncate font-mono text-[9.5px] text-muted">{file}</p>
                <div className="mt-1.5 space-y-0.5">
                  <p className="font-mono text-[9.5px] text-faint">{duplicateBlock.heading}</p>
                  {duplicateBlock.lines.map((line) => (
                    <p
                      key={line}
                      className="border-l-2 border-warn/50 bg-warn/[0.08] px-1.5 font-mono text-[9px] leading-[1.5] text-muted"
                    >
                      {line}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-line px-3 py-1.5 font-mono text-[9px] text-faint">
            Pay this paragraph twice on every request, and keep it in sync by hand.
          </div>
        </figure>

        <div className="flex items-center justify-center" aria-hidden="true">
          <ArrowRight className="size-3.5 rotate-90 text-faint sm:rotate-0" />
        </div>

        <figure
          key={deduped ? "deduped" : "duplicated"}
          className="detail-in overflow-hidden rounded border border-accent/25 bg-accent/[0.035]"
        >
          <figcaption className="flex items-center justify-between border-b border-accent/20 px-3 py-1.5 font-mono text-[10px] text-faint">
            <span>after · one canonical</span>
            <span className="text-accent">paid once</span>
          </figcaption>
          <div className="grid grid-cols-2 divide-x divide-line">
            <div className="px-2.5 py-2">
              <p className="truncate font-mono text-[9.5px] text-accent">AGENTS.md</p>
              <div className="mt-1.5 space-y-0.5">
                <p className="font-mono text-[9.5px] text-faint">{duplicateBlock.heading}</p>
                {duplicateBlock.lines.map((line) => (
                  <p
                    key={line}
                    className="border-l-2 border-accent/50 px-1.5 font-mono text-[9px] leading-[1.5] text-muted"
                  >
                    {line}
                  </p>
                ))}
              </div>
            </div>
            <div className="px-2.5 py-2">
              <p className="truncate font-mono text-[9.5px] text-muted">CLAUDE.md</p>
              <p className="mt-1.5 border-l-2 border-accent/40 px-1.5 font-mono text-[9px] leading-[1.5] text-faint">
                Repository rules: see AGENTS.md.
              </p>
              <p className="mt-1 font-mono text-[9px] text-faint">
                6 lines · pointer, not a copy
              </p>
            </div>
          </div>
          <div className="border-t border-accent/20 px-3 py-1.5 font-mono text-[9px] text-faint">
            One source of truth. The other file points at it, so it cannot drift.
          </div>
        </figure>
      </div>
    </div>
  );
}

/**
 * Before/after comparison. The toggle is the interaction; the bars and figures
 * animate between the two measured runs rather than replaying a scripted
 * marketing number.
 */
export function OptimizationComparison() {
  const [view, setView] = useState<"before" | "after">("before");
  const [playing, setPlaying] = useState(false);
  const playTimer = useRef<number | null>(null);
  const current = viewCopy[view];

  useEffect(
    () => () => {
      if (playTimer.current !== null) window.clearTimeout(playTimer.current);
    },
    [],
  );

  function playTransition() {
    if (playing) return;
    if (view === "before") {
      setView("after");
      return;
    }
    setPlaying(true);
    setView("before");
    playTimer.current = window.setTimeout(() => {
      setView("after");
      setPlaying(false);
    }, 700);
  }

  return (
    <BarScale className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-elevated/40 px-3.5 py-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10.5px] text-muted">
            context optimization
          </span>
          <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[9px] text-faint">
            simulated fixture
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={playTransition}
            disabled={playing}
            className="inline-flex min-h-[26px] items-center gap-1 rounded border border-line px-2 font-mono text-[10px] text-muted transition-colors hover:border-line-strong hover:text-fg disabled:opacity-60"
          >
            <Play className="size-3" aria-hidden="true" />
            play transition
          </button>
          <div
            role="group"
            aria-label="Compare before and after optimization"
            className="flex rounded border border-line bg-bg/50 p-0.5"
          >
          {(["before", "after"] as const).map((option) => {
            const active = view === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setView(option)}
                aria-pressed={active}
                className={`min-h-[26px] rounded px-2.5 py-1 font-mono text-[10px] transition-colors ${
                  active
                    ? option === "after"
                      ? "bg-accent/15 text-accent"
                      : "bg-warn/10 text-warn"
                    : "text-faint hover:text-muted"
                }`}
              >
                {option}
              </button>
            );
          })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-4">
        <div className="bg-surface px-4 py-3">
          <p className="font-mono text-[9px] tracking-[0.12em] text-faint uppercase">
            always-on
          </p>
          <p className="mt-1 font-mono text-[23px] leading-none font-medium tracking-[-0.03em] tabular-nums">
            <Count value={current.tokens} format={fmt} />
          </p>
          <p className="mt-1 font-mono text-[9.5px] text-faint">
            {view === "after" ? `from ${fmt(before.tokens)}` : "tokens per request"}
          </p>
        </div>
        <div className="bg-surface px-4 py-3">
          <p className="font-mono text-[9px] tracking-[0.12em] text-faint uppercase">
            grade
          </p>
          <div className="mt-1 flex h-[23px] items-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={current.grade}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.18 }}
                className={`font-mono text-[23px] leading-none font-medium ${
                  current.tone === "accent" ? "text-accent" : "text-warn"
                }`}
              >
                {current.grade}
              </motion.span>
            </AnimatePresence>
          </div>
          <p className="mt-1 font-mono text-[9.5px] text-faint">
            budget {fmt(current.budget)}
          </p>
        </div>
        <div className="bg-surface px-4 py-3">
          <p className="font-mono text-[9px] tracking-[0.12em] text-faint uppercase">
            cost / 1k
          </p>
          <p className="mt-1 font-mono text-[23px] leading-none font-medium tracking-[-0.02em] tabular-nums">
            <Count value={current.cost} format={money} />
          </p>
          <p className="mt-1 font-mono text-[9.5px] text-faint">
            {view === "after" ? `from ${money(before.cost)}` : "at $3.00 per 1M"}
          </p>
        </div>
        <div className="bg-surface px-4 py-3">
          <p className="font-mono text-[9px] tracking-[0.12em] text-faint uppercase">
            MCP servers
          </p>
          <p className="mt-1 font-mono text-[23px] leading-none font-medium tracking-[-0.02em] tabular-nums">
            <Count value={current.servers} format={fmt} duration={0.5} />
          </p>
          <p className="mt-1 font-mono text-[9.5px] text-faint">
            {view === "after" ? "github, postgres" : "declared for one service"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 border-t border-line px-4 py-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div>
          <div className="flex items-baseline justify-between">
            <h4 className="text-[12px] font-medium text-fg">Always-on files</h4>
            <span className="font-mono text-[9.5px] text-faint">
              {view === "after" ? "after reorganization" : "as it accreted"}
            </span>
          </div>

          <div className="mt-3 space-y-3">
            {rows.map((row, i) => {
              const value = view === "after" ? row.after : row.before;
              return (
                <div key={row.path}>
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="min-w-0 truncate font-mono text-[10.5px] text-muted">
                      {row.path}
                    </span>
                    <span className="shrink-0 font-mono text-[10px] tabular-nums">
                      <span className="text-fg">
                        <Count value={value} format={fmt} duration={0.7} />
                      </span>
                      {view === "after" ? (
                        <span className="ml-1.5 text-faint line-through decoration-line-strong">
                          {fmt(row.before)}
                        </span>
                      ) : (
                        <span className="ml-1.5 text-faint">{row.note}</span>
                      )}
                    </span>
                  </div>
                  <Bar
                    to={value / maxTokens}
                    delay={i * 60}
                    height={5}
                    className="mt-1"
                    tone={view === "after" ? "var(--accent)" : "var(--warn)"}
                    label={`${row.path}: ${fmt(value)} tokens`}
                  />
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-2 rounded border border-line bg-elevated/30 px-3 py-2">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={view}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="font-mono text-[10px] leading-relaxed text-faint"
              >
                {current.label}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        <div>
          <h4 className="text-[12px] font-medium text-fg">What moved, not deleted</h4>
          <ul className="mt-3 border-t border-line">
            {moved.map((item) => (
              <li
                key={item.from}
                className="flex items-start gap-2 border-b border-line py-2"
              >
                <Check className="mt-[1px] size-3 shrink-0 text-accent/80" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-[11px] leading-[1.45] text-muted">{item.from}</p>
                  <p className="font-mono text-[9.5px] text-faint">→ {item.to}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-baseline justify-between font-mono">
            <span className="text-[9.5px] text-faint">always-on delta</span>
            <span className="text-[12px] text-accent tabular-nums">
              −{fmt(before.tokens - after.tokens)} · −{drop.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      <DuplicateDiagram deduped={view === "after"} />

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-elevated/30 px-4 py-2 font-mono text-[9.5px] text-faint">
        <span>both columns measured on the same fixture, before and after</span>
        <span className="text-muted">7 findings → 1 · 0 words deleted</span>
      </div>
    </BarScale>
  );
}

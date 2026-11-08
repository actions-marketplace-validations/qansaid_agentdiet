"use client";

import { demo } from "@/lib/demo";
import { alwaysOnFiles, duplicateBlock } from "@/lib/journey";
import { Bar, BarScale, Count } from "@/components/motion/primitives";

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const fmtPct = (n: number) => `${n.toFixed(2)}%`;
const fmtMoney = (n: number) => `$${n.toFixed(2)}`;

const total = demo.before.tokens;
const window = 200000;

/** Shared block, as reported: the same 2,389 tokens in both root files. */
const agents = alwaysOnFiles.find((file) => file.id === "agents");
const claude = alwaysOnFiles.find((file) => file.id === "claude");
const shared = duplicateBlock.tokens;
const agentsTotal = agents?.tokens ?? 0;
const claudeTotal = claude?.tokens ?? 0;
const agentsUnique = agentsTotal - shared;
const claudeUnique = claudeTotal - shared;
const maxOverlap = Math.max(agentsTotal, claudeTotal);

const gradeBands = [
  { grade: "A", tone: "var(--accent)", max: 1500 },
  { grade: "B", tone: "var(--accent)", max: 4000 },
  { grade: "C", tone: "var(--warn)", max: 8000 },
  { grade: "D", tone: "var(--danger)", max: 16000 },
  { grade: "F", tone: "var(--danger)", max: Infinity },
];
const bandIndex = 2;
const within = (total - 4000) / (8000 - 4000);
const markerPct = ((bandIndex + Math.min(Math.max(within, 0), 1)) / gradeBands.length) * 100;

function TierRow({
  label,
  value,
  valueText,
  note,
  tone,
  to,
  muted = false,
}: {
  label: string;
  value?: number;
  valueText?: string;
  note: string;
  tone: string;
  to: number;
  muted?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span
          className={`font-mono text-[10px] ${muted ? "text-muted" : "text-fg"}`}
        >
          {label}
        </span>
        <span className="font-mono text-[10px] text-muted tabular-nums">
          {typeof value === "number" ? (
            <>
              <Count value={value} format={fmt} duration={0.8} />
              <span className="ml-1 text-faint">tokens</span>
            </>
          ) : (
            <span className="text-faint">{valueText}</span>
          )}
        </span>
      </div>
      <Bar to={to} height={4} tone={tone} className="mt-1" />
      <p className="mt-1 font-mono text-[9px] leading-snug text-faint">{note}</p>
    </div>
  );
}

function DuplicateBar({
  file,
  tokens,
  unique,
  delay,
}: {
  file: string;
  tokens: number;
  unique: number;
  delay: number;
}) {
  const uniquePct = (unique / maxOverlap) * 100;
  const sharedPct = (shared / maxOverlap) * 100;

  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-mono text-[10.5px] text-muted">{file}</span>
        <span className="font-mono text-[10px] text-faint tabular-nums">
          <Count value={tokens} format={fmt} duration={0.9} /> tokens
        </span>
      </div>
      <div
        className="mt-1 flex h-3 w-full gap-px overflow-hidden rounded-[2px] bg-line"
        role="img"
        aria-label={`${file}: ${fmt(unique)} unique tokens and ${fmt(shared)} tokens duplicated from the other file.`}
      >
        <span
          className="h-full bg-fg/20"
          style={{ width: `${uniquePct}%`, animationDelay: `${delay}ms` }}
        />
        <span
          className="h-full bg-warn/70"
          style={{ width: `${sharedPct}%` }}
        />
      </div>
    </div>
  );
}

/**
 * Token analytics for the fixture: where the always-on bill comes from, how
 * small it looks against a 200k window, and how much of it is one paragraph
 * paid for twice. Every number is rendered as text; the bars are redundant.
 */
export function TokenAnalytics() {
  return (
    <BarScale className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-elevated/40 px-3.5 py-2">
        <span className="font-mono text-[10.5px] text-muted">
          token analytics · acme-platform
        </span>
        <span className="font-mono text-[9.5px] text-faint">
          simulated fixture · estimator ±8% MAE
        </span>
      </div>

      <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-3">
        <div className="bg-surface px-4 py-3.5">
          <p className="font-mono text-[9px] tracking-[0.12em] text-faint uppercase">
            always-on
          </p>
          <p className="mt-1 font-mono text-[26px] leading-none font-medium tracking-[-0.03em] tabular-nums">
            <Count value={total} format={fmt} />
          </p>
          <p className="mt-1 font-mono text-[10px] text-faint">
            tokens before you type
          </p>
        </div>
        <div className="bg-surface px-4 py-3.5">
          <p className="font-mono text-[9px] tracking-[0.12em] text-faint uppercase">
            context window
          </p>
          <p className="mt-1 font-mono text-[26px] leading-none font-medium tracking-[-0.03em] tabular-nums text-fg">
            <Count value={demo.before.share} format={fmtPct} duration={1} />
          </p>
          <p className="mt-1 font-mono text-[10px] text-faint">
            of {fmt(window)} tokens
          </p>
        </div>
        <div className="bg-surface px-4 py-3.5">
          <p className="font-mono text-[9px] tracking-[0.12em] text-faint uppercase">
            cost
          </p>
          <p className="mt-1 font-mono text-[26px] leading-none font-medium tracking-[-0.03em] tabular-nums text-fg">
            <Count value={demo.before.cost} format={fmtMoney} />
          </p>
          <p className="mt-1 font-mono text-[10px] text-faint">
            per 1,000 sessions at $3.00/1M
          </p>
        </div>
      </div>

      <div className="border-t border-line px-4 py-3.5">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h4 className="text-[12px] font-medium text-fg">Context by tier</h4>
          <span className="font-mono text-[9.5px] text-faint">
            only always-on is billed on every request
          </span>
        </div>
        <div className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
          <TierRow
            label="always-on"
            value={total}
            note="injected before you type"
            tone="var(--warn)"
            to={1}
          />
          <TierRow
            label="scoped"
            value={demo.before.scoped}
            note="loaded while editing that subtree"
            tone="var(--fg)"
            to={demo.before.scoped / total}
            muted
          />
          <TierRow
            label="on-demand"
            value={demo.before.onDemand}
            note="free until the agent opens it"
            tone="var(--accent)"
            to={demo.before.onDemand / total}
          />
          <TierRow
            label="config · MCP"
            valueText="6 servers"
            note="not context; tool schemas enter on connect"
            tone="var(--faint)"
            to={0}
            muted
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 border-t border-line px-4 py-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div>
          <div className="flex items-baseline justify-between">
            <h4 className="text-[12px] font-medium text-fg">Always-on by file</h4>
            <span className="font-mono text-[9.5px] text-faint">
              4 files · {fmt(total)} total
            </span>
          </div>
          <div className="mt-3 space-y-2.5">
            {alwaysOnFiles.map((file, i) => (
              <div key={file.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate font-mono text-[10.5px] text-muted">
                    {file.path}
                  </span>
                  <span className="shrink-0 font-mono text-[10px] text-faint tabular-nums">
                    <Count value={file.tokens ?? 0} format={fmt} duration={1} />
                    <span className="ml-1.5 text-faint/80">
                      {(((file.tokens ?? 0) / total) * 100).toFixed(1)}%
                    </span>
                  </span>
                </div>
                <Bar
                  to={(file.tokens ?? 0) / total}
                  delay={i * 70}
                  height={5}
                  className="mt-1"
                  tone={file.id === "agents" || file.id === "claude" ? "var(--warn)" : "var(--accent)"}
                  label={`${file.path}: ${fmt(file.tokens ?? 0)} tokens`}
                />
              </div>
            ))}
          </div>

          <div className="mt-4 rounded border border-line bg-elevated/30 px-3 py-2">
            <p className="font-mono text-[10px] leading-relaxed text-faint">
              The percentage looks small because the window is large. The grade
              is absolute: 6,770 always-on tokens is grade C, whatever the
              window says.
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <h4 className="text-[12px] font-medium text-fg">Duplicate content</h4>
            <span className="font-mono text-[9.5px] text-warn">
              <Count value={shared} format={fmt} duration={0.9} /> shared
            </span>
          </div>

          <div className="mt-3 space-y-3">
            <DuplicateBar
              file="AGENTS.md"
              tokens={agentsTotal}
              unique={agentsUnique}
              delay={0}
            />
            <DuplicateBar
              file="CLAUDE.md"
              tokens={claudeTotal}
              unique={claudeUnique}
              delay={80}
            />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[9px] text-faint">
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-[1px] bg-warn/70" aria-hidden="true" />
              duplicated
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2 rounded-[1px] bg-fg/20" aria-hidden="true" />
              unique to the file
            </span>
          </div>

          <p className="mt-3 text-[11px] leading-[1.55] text-muted">
            AGENTS.md is 100% contained in CLAUDE.md. The agent receives the
            shared paragraph twice on every request, and hand-syncing the copies
            is the only thing keeping them equal.
          </p>

          <div className="mt-4">
            <div className="flex items-baseline justify-between font-mono text-[9.5px] text-faint">
              <span>grade rail</span>
              <span className="text-warn">C · budget 8,000</span>
            </div>
            <div className="relative mt-1.5">
              <div className="flex gap-1" aria-hidden="true">
                {gradeBands.map((band, i) => (
                  <span
                    key={band.grade}
                    className="h-1.5 flex-1 rounded-full"
                    style={{
                      background: band.tone,
                      opacity: i === bandIndex ? 0.9 : 0.25,
                    }}
                  />
                ))}
              </div>
              <span
                aria-hidden="true"
                className="absolute -top-1 h-3.5 w-px bg-fg"
                style={{ left: `calc(${markerPct}% - 0.5px)` }}
              />
            </div>
            <div className="mt-1 flex justify-between font-mono text-[9px] text-faint">
              <span>A 1.5k</span>
              <span>B 4k</span>
              <span className="text-warn">C 8k</span>
              <span>D 16k</span>
              <span>F</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-elevated/30 px-4 py-2 font-mono text-[9.5px] text-faint">
        <span>7 findings · 3 duplicate groups · 2 oversize files</span>
        <span>{fmt(demo.before.onDemand)} on-demand tokens cost nothing until opened</span>
      </div>
    </BarScale>
  );
}

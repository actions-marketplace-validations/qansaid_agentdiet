"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  FileCode2,
  FileCog,
  FileText,
  Folder,
  FolderOpen,
  RotateCcw,
  ScanSearch,
} from "lucide-react";
import { demo } from "@/lib/demo";
import {
  alwaysOnFiles,
  tierMeta,
  treeRows,
  type Tier,
  type TreeRow,
} from "@/lib/journey";

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

const chip: Record<Tier, string> = {
  "always-on": "border-warn/35 bg-warn/10 text-warn",
  scoped: "border-line-strong bg-elevated text-muted",
  "on-demand": "border-accent/35 bg-accent/10 text-accent",
  config: "border-line bg-elevated/60 text-muted",
  ignored: "border-line bg-transparent text-faint",
};

const filters: Array<{ id: "all" | Tier; label: string }> = [
  { id: "all", label: "all" },
  { id: "always-on", label: "always-on" },
  { id: "scoped", label: "scoped" },
  { id: "on-demand", label: "on-demand" },
  { id: "config", label: "config" },
];

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

function fileIcon(row: TreeRow) {
  if (row.tier === "config") return FileCog;
  if (row.id === "workflow") return FileCode2;
  return FileText;
}

function TierChip({ tier, delay = 0 }: { tier: Tier; delay?: number }) {
  return (
    <span
      className={`scan-chip shrink-0 rounded border px-1.5 py-0.5 font-mono text-[9.5px] leading-none ${chip[tier]}`}
      style={{ "--chip-delay": `${delay}ms` } as CSSProperties}
    >
      {tierMeta[tier].label}
    </span>
  );
}

/**
 * Interactive repository explorer. The scan is a reveal over markup that is
 * already complete: every row, tier and token count is in the DOM on first
 * paint, so the tree is usable before (and without) the animation.
 */
export function RepositoryExplorer() {
  const rootRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const [scanState, setScanState] = useState<"scanning" | "done">("done");
  const [filter, setFilter] = useState<"all" | Tier>("all");
  const [selectedId, setSelectedId] = useState("agents");

  const clear = useCallback(() => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  }, []);

  const runScan = useCallback(() => {
    const node = rootRef.current;
    if (!node) return;
    clear();

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setScanState("done");
      node.dataset.scan = "on";
      return;
    }

    setScanState("scanning");
    node.dataset.scan = "pending";
    // Paint the armed state for one frame, then release the transition.
    window.requestAnimationFrame(() => {
      node.dataset.scan = "on";
    });
    timers.current.push(
      window.setTimeout(() => {
        setScanState("done");
        node.dataset.scan = "done";
      }, 1500),
    );
  }, [clear]);

  // Arm below-the-fold only; an already visible tree renders complete.
  useIsoLayoutEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    node.dataset.scan = "pending";
    setScanState("scanning");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          node.dataset.scan = "on";
          setScanState("scanning");
          timers.current.push(
            window.setTimeout(() => {
              setScanState("done");
              node.dataset.scan = "done";
            }, 1500),
          );
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      clear();
    };
  }, [clear]);

  const selected =
    treeRows.find((row) => row.id === selectedId && row.kind === "file") ??
    treeRows.find((row) => row.id === "agents") ??
    null;

  const alwaysOnTotal = demo.before.tokens;

  function pick(next: "all" | Tier) {
    setFilter(next);
    if (next === "all") return;
    if (selected && selected.tier === next) return;
    const first = treeRows.find(
      (row) => row.kind === "file" && row.tier === next,
    );
    if (first) setSelectedId(first.id);
  }

  return (
    <div
      ref={rootRef}
      className="relative overflow-hidden rounded-lg border border-line bg-surface"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-line bg-elevated/40 px-3 py-2">
        <div className="flex items-center gap-2">
          <ScanSearch
            className={`size-3.5 ${scanState === "scanning" ? "text-accent" : "text-faint"}`}
            aria-hidden="true"
          />
          <span className="font-mono text-[10.5px] text-muted" aria-live="polite">
            {scanState === "scanning"
              ? "scanning · classifying instruction files…"
              : "scan complete · 10 files across 4 tiers"}
          </span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="hidden font-mono text-[9.5px] text-faint sm:inline">
            simulated fixture
          </span>
          <span className="font-mono text-[10.5px] text-faint tabular-nums">
            always-on {fmt(alwaysOnTotal)}
          </span>
          <button
            type="button"
            onClick={runScan}
            className="inline-flex items-center gap-1 rounded border border-line px-1.5 py-1 font-mono text-[10px] text-muted transition-colors hover:border-line-strong hover:text-fg"
          >
            <RotateCcw className="size-3" aria-hidden="true" />
            rescan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)]">
        <div className="relative border-b border-line lg:border-r lg:border-b-0">
          <div
            role="group"
            aria-label="Filter files by tier"
            className="flex flex-wrap gap-1 border-b border-line px-3 py-2"
          >
            {filters.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => pick(f.id)}
                  aria-pressed={active}
                  className={`rounded border px-1.5 py-1 font-mono text-[10px] transition-colors ${
                    active
                      ? "border-line-strong bg-elevated text-fg"
                      : "border-transparent text-faint hover:text-muted"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          <div className="scroll-thin relative h-[342px] overflow-y-auto py-1">
            {scanState === "scanning" ? (
              <span className="scan-beam" aria-hidden="true" />
            ) : null}

            {treeRows.map((row, i) => {
              const isDir = row.kind === "dir";
              const matches =
                isDir || filter === "all" || row.tier === filter;
              const isSelected = !isDir && row.id === selected?.id;
              const Icon = isDir
                ? row.id === "node-modules"
                  ? FolderOpen
                  : Folder
                : fileIcon(row);
              const rowInner = (
                <>
                  <Icon
                    className={`size-3.5 shrink-0 ${
                      isDir ? "text-faint" : "text-muted"
                    }`}
                    aria-hidden="true"
                    strokeWidth={1.7}
                  />
                  <span
                    className={`min-w-0 flex-1 truncate font-mono text-[11px] ${
                      isDir ? "text-muted" : "text-fg/90"
                    }`}
                  >
                    {row.name}
                  </span>
                  {row.meta ? (
                    <span className="shrink-0 font-mono text-[9.5px] text-faint">
                      {row.meta}
                    </span>
                  ) : null}
                  {row.tier ? (
                    <TierChip tier={row.tier} delay={i * 38 + 90} />
                  ) : null}
                  {row.duplicate ? (
                    <span className="shrink-0 rounded border border-warn/40 bg-warn/[0.08] px-1 py-0.5 font-mono text-[9px] leading-none text-warn">
                      dup
                    </span>
                  ) : null}
                  {typeof row.tokens === "number" ? (
                    <span className="w-10 shrink-0 text-right font-mono text-[10px] text-faint tabular-nums">
                      {fmt(row.tokens)}
                    </span>
                  ) : null}
                </>
              );

              return isDir ? (
                <div
                  key={row.id}
                  className="scan-row flex items-center gap-2 px-3 py-[7px]"
                  style={
                    {
                      paddingLeft: `${12 + row.depth * 14}px`,
                      "--row-delay": `${i * 38}ms`,
                      opacity: matches ? 1 : 0.45,
                    } as CSSProperties
                  }
                >
                  {rowInner}
                </div>
              ) : (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => setSelectedId(row.id)}
                  aria-pressed={isSelected}
                  aria-label={`${row.path}, ${row.tier ?? "unclassified"}${typeof row.tokens === "number" ? `, ${fmt(row.tokens)} tokens` : ""}`}
                  className={`scan-row relative flex w-full items-center gap-2 px-3 py-[7px] text-left transition-colors hover:bg-elevated/70 ${
                    isSelected
                      ? "bg-elevated"
                      : row.duplicate
                        ? "bg-warn/[0.045]"
                        : ""
                  }`}
                  style={
                    {
                      paddingLeft: `${12 + row.depth * 14}px`,
                      "--row-delay": `${i * 38}ms`,
                      opacity: matches ? 1 : 0.4,
                    } as CSSProperties
                  }
                >
                  {isSelected ? (
                    <span
                      aria-hidden="true"
                      className="absolute left-0 h-5 w-px bg-accent"
                      style={{ marginLeft: 2 }}
                    />
                  ) : null}
                  {rowInner}
                </button>
              );
            })}
          </div>
        </div>

        <div className="min-w-0 bg-elevated/20 p-4">
          {selected ? (
            <div key={selected.id} className="detail-in">
              <div className="flex items-start justify-between gap-2">
                <p className="min-w-0 font-mono text-[11px] break-all text-fg">
                  {selected.path}
                </p>
                {selected.tier ? <TierChip tier={selected.tier} /> : null}
              </div>

              <p className="mt-2 text-[12px] leading-[1.6] text-muted">
                {selected.note}
              </p>

              <dl className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded border border-line bg-line">
                <div className="bg-surface px-2.5 py-2">
                  <dt className="font-mono text-[9px] tracking-wide text-faint uppercase">
                    tokens
                  </dt>
                  <dd className="mt-0.5 font-mono text-[13px] tabular-nums text-fg">
                    {typeof selected.tokens === "number"
                      ? fmt(selected.tokens)
                      : "n/a"}
                  </dd>
                </div>
                <div className="bg-surface px-2.5 py-2">
                  <dt className="font-mono text-[9px] tracking-wide text-faint uppercase">
                    lines
                  </dt>
                  <dd className="mt-0.5 font-mono text-[13px] tabular-nums text-fg">
                    {selected.lines ?? "n/a"}
                  </dd>
                </div>
                <div className="bg-surface px-2.5 py-2">
                  <dt className="font-mono text-[9px] tracking-wide text-faint uppercase">
                    per request
                  </dt>
                  <dd className="mt-0.5 font-mono text-[13px] text-fg">
                    {selected.tier === "always-on" ? "yes" : "no"}
                  </dd>
                </div>
              </dl>

              {selected.tier ? (
                <div className="mt-3 border-t border-line pt-3">
                  <p className="font-mono text-[10px] tracking-wide text-faint uppercase">
                    {tierMeta[selected.tier].label}
                  </p>
                  <p className="mt-1 text-[11.5px] leading-[1.55] text-muted">
                    {tierMeta[selected.tier].when}.
                  </p>
                  <p className="mt-1.5 text-[11.5px] leading-[1.55] text-faint">
                    {tierMeta[selected.tier].advice}
                  </p>
                </div>
              ) : null}

              {selected.duplicate ? (
                <div className="mt-3 rounded border border-warn/25 bg-warn/[0.05] px-2.5 py-2">
                  <p className="font-mono text-[9.5px] tracking-wide text-warn uppercase">
                    duplicate · {fmt(selected.duplicate)} tokens
                  </p>
                  <p className="mt-1 text-[11px] leading-[1.5] text-muted">
                    Shared verbatim with{" "}
                    {selected.id === "agents" ? "CLAUDE.md" : "AGENTS.md"}. Both
                    copies are injected on every request.
                  </p>
                </div>
              ) : null}

              {selected.tier === "always-on" && selected.tokens ? (
                <div className="mt-3">
                  <div className="flex items-center justify-between font-mono text-[10px] text-faint">
                    <span>share of the always-on bill</span>
                    <span className="tabular-nums">
                      {((selected.tokens / alwaysOnTotal) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="bar-track mt-1 h-1">
                    <span
                      className="bar-fill"
                      style={
                        {
                          "--to": selected.tokens / alwaysOnTotal,
                          background: "var(--warn)",
                        } as CSSProperties
                      }
                    />
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <p className="mt-4 border-t border-line pt-3 font-mono text-[10px] leading-relaxed text-faint">
            {alwaysOnFiles.length} always-on files · 6,770 tokens · 3.39% of the
            window
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line bg-elevated/30 px-3 py-2 font-mono text-[9.5px] text-faint">
        <span>legend</span>
        <span className="text-warn">always-on · billed</span>
        <span className="text-muted">scoped · subtree</span>
        <span className="text-accent">on-demand · free until opened</span>
        <span>config · tool surface</span>
        <span className="text-warn">dup · 2,389 shared</span>
        <span className="ml-auto">simulated fixture</span>
      </div>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { RotateCcw, SkipForward } from "lucide-react";
import { demo } from "@/lib/demo";
import { Count } from "@/components/motion/primitives";

/* The hero terminal keeps its own fixed palette: it is a terminal in both
   themes, and a light "terminal" reads as a screenshot rather than an artifact. */
const T = {
  bg: "#0a0b0c",
  bar: "rgba(255,255,255,0.028)",
  border: "rgba(255,255,255,0.09)",
  fg: "#e4e4e7",
  body: "#c9c9cf",
  dim: "#8b8b95",
  faint: "#63636d",
  accent: "#3ddc97",
  amber: "#f5c451",
  orange: "#fb923c",
};

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const COMMAND = "agentdiet . --top 10";

const WANTED = [
  "CLAUDE.md",
  "AGENTS.md",
  ".cursorrules",
  ".github/copilot-instructions.md",
  "services/billing/AGENTS.md",
  "skills/incident/SKILL.md",
];

const files = WANTED.map((path) =>
  demo.before.files.find((file) => file.path === path),
).filter((file): file is NonNullable<typeof file> => Boolean(file));

const findings = [
  { kind: "duplicate", rest: "2,389 tokens · AGENTS.md ↔ CLAUDE.md" },
  { kind: "contained", rest: "AGENTS.md 100% contained in CLAUDE.md" },
  { kind: "oversize", rest: "CLAUDE.md · 3,118 tokens on every request" },
  { kind: "mcp", rest: "6 servers declared · schemas enter on connect" },
];

const tierColor: Record<string, string> = {
  "always-on": T.amber,
  scoped: T.dim,
  "on-demand": T.accent,
};

function Dot({ tone }: { tone: string }) {
  return (
    <span
      className="mt-[7px] size-1 shrink-0 rounded-full"
      style={{ background: tone }}
      aria-hidden="true"
    />
  );
}

/**
 * The hero artifact. It replays the scan the product actually performs, in the
 * order it performs it: files discovered, tiers assigned, tokens estimated,
 * duplication reported, then the summary. The screen-reader summary is static
 * and complete; the log is decoration on top of it.
 */
export function HeroTerminal() {
  const rootRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  // Server render is the finished report: without JavaScript (and before
  // hydration) the price is on screen, not an empty animation frame.
  const [typed, setTyped] = useState(COMMAND.length);
  const [scanning, setScanning] = useState(false);
  const [visibleFiles, setVisibleFiles] = useState(files.length);
  const [estimating, setEstimating] = useState(true);
  const [visibleFindings, setVisibleFindings] = useState(findings.length);
  const [totals, setTotals] = useState(true);
  const [done, setDone] = useState(true);
  const [run, setRun] = useState(0);

  const clearTimers = useCallback(() => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  }, []);

  const finish = useCallback(() => {
    clearTimers();
    setTyped(COMMAND.length);
    setScanning(false);
    setEstimating(false);
    setVisibleFiles(files.length);
    setVisibleFindings(findings.length);
    setTotals(true);
    setDone(true);
  }, [clearTimers]);

  const start = useCallback(() => {
    clearTimers();
    setTyped(0);
    setScanning(false);
    setVisibleFiles(0);
    setEstimating(false);
    setVisibleFindings(0);
    setTotals(false);
    setDone(false);

    const at = (ms: number, fn: () => void) => {
      timers.current.push(window.setTimeout(fn, ms));
    };

    // Type the command one character at a time before the scan starts.
    const typeStart = 140;
    const perChar = 36;
    COMMAND.split("").forEach((_, i) => {
      at(typeStart + i * perChar, () => setTyped(i + 1));
    });
    const typedAt = typeStart + COMMAND.length * perChar + 140;
    at(typedAt, () => setScanning(true));

    const fileStart = typedAt + 300;
    const stride = 145;
    files.forEach((_, i) => {
      at(fileStart + i * stride, () => setVisibleFiles(i + 1));
    });

    const afterFiles = fileStart + files.length * stride;
    at(afterFiles + 300, () => {
      setScanning(false);
      setEstimating(true);
    });

    const findingStart = afterFiles + 720;
    findings.forEach((_, i) => {
      at(findingStart + i * 420, () => setVisibleFindings(i + 1));
    });

    const afterFindings = findingStart + findings.length * 420;
    at(afterFindings + 260, () => {
      setEstimating(false);
      setTotals(true);
    });
    at(afterFindings + 780, () => setDone(true));
  }, [clearTimers]);

  // Replay from the top whenever the run changes, but only once the panel is
  // on screen and only when motion is allowed.
  useIsoLayoutEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          start();
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(node);

    return () => {
      observer.disconnect();
      clearTimers();
    };
  }, [run, start, clearTimers]);

  // Keep the newest line in view without animating layout.
  useEffect(() => {
    const node = logRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [visibleFiles, visibleFindings, estimating, totals, done]);

  const progress =
    visibleFiles / files.length * 0.6 + visibleFindings / findings.length * 0.4;

  return (
    <div
      ref={rootRef}
      className="overflow-hidden rounded-[12px] border shadow-[0_24px_70px_-34px_rgba(0,0,0,0.8)]"
      style={{ background: T.bg, borderColor: T.border }}
    >
      <div
        className="flex items-center gap-3 border-b px-3 py-2"
        style={{ background: T.bar, borderColor: T.border }}
      >
        <div className="flex items-center gap-[6px]" aria-hidden="true">
          <span className="size-[9px] rounded-full bg-[#ff5f57]/70" />
          <span className="size-[9px] rounded-full bg-[#febc2e]/70" />
          <span className="size-[9px] rounded-full bg-[#28c840]/70" />
        </div>
        <div
          className="min-w-0 flex-1 truncate text-center font-mono text-[11px]"
          style={{ color: T.dim }}
        >
          acme-platform <span style={{ color: T.faint }}>·</span> agentdiet
        </div>
        <span className="hidden shrink-0 font-mono text-[9.5px] tracking-wide text-zinc-500 sm:inline">
          simulated
        </span>
        <div className="flex shrink-0 items-center gap-1">
          {!done ? (
            <button
              type="button"
              onClick={finish}
              className="inline-flex min-h-[26px] items-center gap-1 rounded px-1.5 py-1 font-mono text-[10px] text-zinc-400 transition-colors hover:bg-white/5 hover:text-zinc-100"
            >
              <SkipForward className="size-3" aria-hidden="true" />
              skip
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                finish();
                return;
              }
              setRun((n) => n + 1);
            }}
            className="inline-flex size-7 items-center justify-center rounded text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-100"
            aria-label="Replay the scan animation"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Visual log. The complete summary is repeated below and in sr-only text,
          so nothing here is load-bearing for a screen reader. */}
      <div
        ref={logRef}
        aria-hidden="true"
        className="scroll-thin h-[286px] overflow-y-auto px-4 py-3 font-mono text-[11px] leading-[1.72] sm:text-[11.5px]"
      >
        <div className="flex items-start gap-2 whitespace-pre-wrap break-words">
          <span style={{ color: T.accent }}>$</span>
          <span style={{ color: T.fg }}>
            {COMMAND.slice(0, typed)}
            {done ? null : <span className="caret" />}
          </span>
        </div>

        {scanning ? (
          <div className="mt-1 flex items-center gap-2" style={{ color: T.dim }}>
            <span className="pulse-soft" style={{ color: T.accent }}>
              ◐
            </span>
            <span>walking acme-platform…</span>
          </div>
        ) : null}

        {visibleFiles > 0 ? (
          <div className="mt-1 line-in" style={{ color: T.faint }}>
            skipped node_modules/ vendor/ dist/ build/ (4 trees)
          </div>
        ) : null}

        {files.slice(0, visibleFiles).map((file) => (
          <div
            key={file.path}
            className="line-in flex items-baseline gap-2"
            style={{ animationDelay: "0ms" }}
          >
            <span className="min-w-0 flex-1 truncate" style={{ color: T.body }}>
              {file.path}
            </span>
            <span
              className="shrink-0 tabular-nums"
              style={{ color: T.dim }}
            >
              {fmt(file.tokens)}
            </span>
            <span
              className="w-[62px] shrink-0 text-right text-[10px]"
              style={{ color: tierColor[file.tier] ?? T.dim }}
            >
              {file.tier}
            </span>
          </div>
        ))}

        {estimating ? (
          <div className="mt-1 flex items-center gap-2" style={{ color: T.dim }}>
            <span className="pulse-soft" style={{ color: T.accent }}>
              ◐
            </span>
            <span>estimating · 4.5 chars/token prose · 3.4 fenced</span>
          </div>
        ) : null}

        {findings.slice(0, visibleFindings).map((finding) => (
          <div key={finding.kind} className="line-in mt-1 flex items-start gap-2">
            <Dot tone={finding.kind === "mcp" ? T.dim : T.orange} />
            <span className="min-w-0" style={{ color: T.body }}>
              <span style={{ color: T.orange }}>{finding.kind}</span>{" "}
              {finding.rest}
            </span>
          </div>
        ))}

        {totals ? (
          <div
            className="mt-2 line-in border-t pt-1.5"
            style={{ borderColor: T.border, color: T.faint }}
          >
            <span style={{ color: T.fg }}>
              TOTAL{" "}
              <Count
                value={demo.before.tokens}
                format={fmt}
                duration={0.8}
                className="tabular-nums"
              />
            </span>{" "}
            always-on tokens
            {" · "}
            <span style={{ color: T.dim }}>3.39% of a 200,000-token window</span>
          </div>
        ) : null}

        {done ? (
          <div className="line-in" style={{ color: T.faint }}>
            7 findings · report below
          </div>
        ) : null}
      </div>

      {/* The summary strip. Its final layout is always present, so the terminal
          never changes height when the numbers land; only an overlay swaps. */}
      <div
        className="relative border-t px-4 py-3.5"
        style={{ borderColor: T.border, background: "rgba(255,255,255,0.015)" }}
        aria-hidden="true"
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
          <div>
            <p
              className="font-mono text-[9.5px] tracking-[0.14em] uppercase"
              style={{ color: T.faint }}
            >
              always-on tokens
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <Count
                key={done ? "done" : "pending"}
                value={demo.before.tokens}
                format={fmt}
                className="font-mono text-[32px] leading-none font-medium tracking-[-0.03em] tabular-nums"
              />
              <span className="font-mono text-[11px]" style={{ color: T.faint }}>
                / request
              </span>
            </div>
            <p className="mt-1.5 font-mono text-[10px]" style={{ color: T.faint }}>
              3.39% of window · 7 findings · 4 files
            </p>
          </div>
          <div className="text-right">
            <span
              className="inline-flex rounded border px-1.5 py-0.5 font-mono text-[10.5px] font-medium"
              style={{
                borderColor: "rgba(245,196,81,0.35)",
                background: "rgba(245,196,81,0.1)",
                color: T.amber,
              }}
            >
              grade {demo.before.grade}
            </span>
            <p className="mt-2 font-mono text-[12px] tabular-nums" style={{ color: T.body }}>
              <span className="text-[10px]" style={{ color: T.faint }}>
                est.{" "}
              </span>
              ${demo.before.cost.toFixed(2)}
              <span className="text-[10px]" style={{ color: T.faint }}>
                {" "}
                / 1K requests
              </span>
            </p>
            <p className="mt-0.5 font-mono text-[10px]" style={{ color: T.faint }}>
              one request per session · budget {fmt(demo.before.budget)}
            </p>
          </div>
        </div>

        {!done ? (
          <div
            className="absolute inset-0 flex flex-col justify-center gap-2 px-4"
            style={{ background: T.bg }}
          >
            <div
              className="flex items-center justify-between font-mono text-[10px]"
              style={{ color: T.faint }}
            >
              <span>scanning</span>
              <span className="tabular-nums">
                {Math.round(progress * 100)}%
              </span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full transition-[width] duration-300 ease-out"
                style={{
                  width: `${Math.max(progress * 100, 4)}%`,
                  background: T.accent,
                }}
              />
            </div>
          </div>
        ) : null}
      </div>

      <div
        className="border-t px-4 py-2 font-mono text-[10px]"
        style={{ borderColor: T.border, color: T.faint }}
      >
        simulated repository · numbers from a real run · nothing is uploaded
      </div>

      <p className="sr-only">
        The simulated acme-platform repository loads 6,770 always-on tokens
        across four instruction files on every request, 3.39% of a 200,000-token
        window, which is grade C against an 8,000-token budget and an estimated
        $20.31 per 1,000 requests at $3.00 per million input tokens, assuming one
        request per session. Seven findings
        include 2,389 tokens duplicated between AGENTS.md and CLAUDE.md.
      </p>
    </div>
  );
}

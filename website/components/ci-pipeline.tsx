"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Check,
  Circle,
  LoaderCircle,
  Play,
  ShieldCheck,
  Workflow,
  X,
} from "lucide-react";
import { demo } from "@/lib/demo";
import { pipelineStages } from "@/lib/journey";

const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
const total = demo.before.tokens;
const scale = 8000;

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * The gate, animated end to end. A 4,000-token budget on a 6,770-token fixture
 * fails, which is the point of the section; raising the budget to 8,000 makes
 * the same audit pass. Both outcomes are measured, not scripted.
 */
export function CiPipeline() {
  const rootRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const [budget, setBudget] = useState(4000);
  const [completed, setCompleted] = useState(pipelineStages.length);
  const [running, setRunning] = useState(false);
  const [verdict, setVerdict] = useState<"pass" | "fail" | null>("fail");

  const clear = useCallback(() => {
    for (const id of timers.current) window.clearTimeout(id);
    timers.current = [];
  }, []);

  const run = useCallback(
    (limit: number) => {
      clear();
      const passed = total <= limit;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setCompleted(pipelineStages.length);
        setRunning(false);
        setVerdict(passed ? "pass" : "fail");
        return;
      }

      setCompleted(0);
      setRunning(true);
      setVerdict(null);

      let elapsed = 0;
      pipelineStages.forEach((stage, i) => {
        elapsed += stage.duration;
        timers.current.push(
          window.setTimeout(() => setCompleted(i + 1), elapsed),
        );
      });
      timers.current.push(
        window.setTimeout(() => {
          setRunning(false);
          setVerdict(passed ? "pass" : "fail");
        }, elapsed + 160),
      );
    },
    [clear],
  );

  useIsoLayoutEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          run(4000);
          observer.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [run]);

  useEffect(() => clear, [clear]);

  const passed = total <= budget;
  const headroom = Math.abs(budget - total);
  const runningStage = running ? completed : -1;
  const statusLabel =
    verdict === "pass"
      ? `PASS: ${fmt(total)} always-on tokens is within the ${fmt(budget)} budget.`
      : verdict === "fail"
        ? `FAIL: ${fmt(total)} always-on tokens exceeds the ${fmt(budget)} budget by ${fmt(headroom)}.`
        : "Audit running.";

  return (
    <div ref={rootRef} className="overflow-hidden rounded-lg border border-line bg-surface">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-elevated/40 px-3.5 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <Workflow className="size-3.5 shrink-0 text-faint" aria-hidden="true" />
          <span className="truncate font-mono text-[10.5px] text-muted">
            .github/workflows/agent-context.yml
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden rounded border border-line px-1.5 py-0.5 font-mono text-[9px] text-faint sm:inline">
            simulated run
          </span>
          <span className="font-mono text-[9.5px] text-faint">pull_request</span>
          <AnimatePresence mode="wait" initial={false}>
            {verdict ? (
              <motion.span
                key={verdict}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px] font-medium ${
                  verdict === "pass"
                    ? "border-accent/35 bg-accent/10 text-accent"
                    : "border-danger/40 bg-danger/10 text-danger"
                }`}
              >
                {verdict === "pass" ? (
                  <Check className="size-3" aria-hidden="true" />
                ) : (
                  <X className="size-3" aria-hidden="true" />
                )}
                {verdict === "pass" ? "PASS" : "FAIL"}
              </motion.span>
            ) : (
              <motion.span
                key="running"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="inline-flex items-center gap-1 rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-muted"
              >
                <LoaderCircle
                  className="size-3 animate-spin motion-reduce:animate-none"
                  aria-hidden="true"
                />
                running
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-3.5 py-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9.5px] tracking-wide text-faint uppercase">
            max-tokens
          </span>
          <div
            role="group"
            aria-label="Token budget"
            className="flex rounded border border-line bg-bg/50 p-0.5"
          >
            {[4000, 8000].map((limit) => (
              <button
                key={limit}
                type="button"
                onClick={() => {
                  setBudget(limit);
                  run(limit);
                }}
                aria-pressed={budget === limit}
                className={`min-h-[26px] rounded px-2 py-1 font-mono text-[10px] tabular-nums transition-colors ${
                  budget === limit
                    ? "bg-elevated text-fg"
                    : "text-faint hover:text-muted"
                }`}
              >
                {fmt(limit)}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => run(budget)}
          className="inline-flex items-center gap-1.5 rounded border border-line px-2 py-1 font-mono text-[10px] text-muted transition-colors hover:border-line-strong hover:text-fg"
        >
          <Play className="size-3" aria-hidden="true" />
          run workflow
        </button>
      </div>

      <div className="grid grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <div className="border-b border-line p-3.5 lg:border-r lg:border-b-0">
          <ol className="relative">
            <span
              aria-hidden="true"
              className="absolute top-3 bottom-3 left-[7px] w-px bg-line"
            >
              <span
                className="block w-px bg-accent/70 transition-[height] duration-500 ease-out"
                style={{
                  height: `${(completed / pipelineStages.length) * 100}%`,
                }}
              />
            </span>
            {pipelineStages.map((stage, i) => {
              const state =
                i < completed ? "done" : i === runningStage ? "running" : "pending";
              return (
                <li key={stage.id} className="flex gap-3 py-2">
                  <span
                    className={`relative z-10 mt-[1px] flex size-4 shrink-0 items-center justify-center rounded-full border bg-surface ${
                      state === "done"
                        ? "border-accent/40 bg-accent/10 text-accent"
                        : state === "running"
                          ? "border-line-strong text-muted"
                          : "border-line text-faint"
                    }`}
                    aria-hidden="true"
                  >
                    {state === "done" ? (
                      <Check className="size-2.5" />
                    ) : state === "running" ? (
                      <LoaderCircle className="size-2.5 animate-spin motion-reduce:animate-none" />
                    ) : (
                      <Circle className="size-2" />
                    )}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="min-w-0 truncate font-mono text-[10.5px] text-fg/90">
                        {stage.label}
                      </span>
                      <span className="shrink-0 font-mono text-[9px] text-faint tabular-nums">
                        {(stage.duration / 1000).toFixed(1)}s
                      </span>
                    </div>
                    <p className="mt-0.5 text-[10.5px] leading-[1.45] text-faint">
                      {stage.detail}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-2 border-t border-line pt-3">
            <div className="flex items-baseline justify-between font-mono text-[9.5px] text-faint">
              <span>token budget</span>
              <span className={passed ? "text-accent" : "text-danger"}>
                {fmt(total)} / {fmt(budget)}
              </span>
            </div>
            <div className="relative mt-1.5">
              <div className="flex h-2 overflow-hidden rounded-full bg-line">
                <span
                  className="h-full transition-[width] duration-500"
                  style={{
                    width: `${(Math.min(budget, total) / scale) * 100}%`,
                    background: "var(--accent)",
                    opacity: 0.55,
                  }}
                />
                {!passed ? (
                  <span
                    className="h-full transition-[width] duration-500"
                    style={{
                      width: `${((total - budget) / scale) * 100}%`,
                      background: "var(--danger)",
                    }}
                  />
                ) : null}
              </div>
              <span
                className="absolute -top-1 h-4 w-px bg-fg"
                style={{ left: `${(budget / scale) * 100}%` }}
                aria-hidden="true"
              />
            </div>
            <div className="mt-1 flex justify-between font-mono text-[9px] text-faint">
              <span>0</span>
              <span>{fmt(scale)}</span>
            </div>
          </div>
        </div>

        <div className="min-w-0 bg-[#0a0b0c] p-3">
          <div className="scroll-thin h-[176px] overflow-y-auto font-mono text-[10px] leading-[1.7] text-zinc-400">
            <p className="text-zinc-500">$ agentdiet . --max-tokens {fmt(budget)}</p>
            {completed >= 1 ? (
              <p className="line-in text-zinc-500">
                ✓ checkout · {fmt(demo.before.files.length)} instruction files on disk
              </p>
            ) : null}
            {completed >= 2 ? (
              <p className="line-in text-zinc-500">✓ installed agentdiet 0.1.6 (static)</p>
            ) : null}
            {completed >= 3 ? (
              <p className="line-in text-zinc-300">
                scanned 10 files · always-on {fmt(total)} · grade {demo.before.grade}
              </p>
            ) : null}
            {completed >= 4 ? (
              <p className={`line-in ${passed ? "text-[#3ddc97]" : "text-[#f87171]"}`}>
                {passed
                  ? `budget ${fmt(budget)} · within by ${fmt(headroom)}`
                  : `budget ${fmt(budget)} · over by ${fmt(headroom)}`}
              </p>
            ) : null}
            {verdict === "fail" ? (
              <>
                <p className="line-in mt-1 text-[#f87171]">
                  ::error::always-on context {fmt(total)} &gt; max-tokens {fmt(budget)}
                </p>
                <p className="line-in text-zinc-500">
                  Process completed with exit code 1.
                </p>
              </>
            ) : null}
            {verdict === "pass" ? (
              <>
                <p className="line-in mt-1 text-[#3ddc97]">
                  ::notice::always-on context within budget
                </p>
                <p className="line-in text-zinc-500">
                  Process completed with exit code 0.
                </p>
              </>
            ) : null}
            {!verdict ? <span className="caret" aria-hidden="true" /> : null}
          </div>

          <div
            className={`mt-2 flex items-center justify-between rounded border px-2.5 py-1.5 font-mono text-[9.5px] ${
              verdict === "fail"
                ? "border-[#f87171]/30 bg-[#f87171]/10 text-[#f87171]"
                : verdict === "pass"
                  ? "border-[#3ddc97]/30 bg-[#3ddc97]/10 text-[#3ddc97]"
                  : "border-white/10 text-zinc-500"
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="size-3" aria-hidden="true" />
              {verdict === "pass"
                ? "check passed"
                : verdict === "fail"
                  ? "check failed"
                  : "check running"}
            </span>
            <span className="tabular-nums">
              {verdict ? `exit ${passed ? "0" : "1"}` : "exit n/a"}
            </span>
          </div>
          <p className="sr-only" aria-live="polite">
            {statusLabel}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-elevated/30 px-3.5 py-2 font-mono text-[9.5px] text-faint">
        <span>
          the 4,000 gate is deliberately below {fmt(total)} · raise it to 8,000 to
          see the same audit pass
        </span>
        <span className="text-muted">exit 0 within · 1 over · 2 could not run</span>
      </div>
    </div>
  );
}

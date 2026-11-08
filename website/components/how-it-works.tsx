"use client";

import dynamic from "next/dynamic";
import {
  Component,
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { steps } from "@/lib/site";

function VisualSkeleton() {
  const [mounted, setMounted] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setMounted(true));
    const timer = window.setTimeout(() => setSlow(true), 7000);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timer);
    };
  }, []);

  // The loading fallback is also rendered during streaming. Keep it out of the
  // server HTML so a no-JS or pre-hydration document never shows a skeleton
  // next to the panel it is supposed to replace.
  if (!mounted) return null;

  return (
    <div
      className="relative h-[560px] overflow-hidden rounded-lg border border-line bg-surface"
      aria-busy="true"
      aria-label="Loading interactive panel"
    >
      <div className="flex items-center justify-between border-b border-line bg-elevated/40 px-3.5 py-2">
        <span className="h-2.5 w-40 rounded-sm bg-line" aria-hidden="true" />
        <span className="h-2.5 w-20 rounded-sm bg-line" aria-hidden="true" />
      </div>
      <div className="grid gap-px bg-line sm:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <div key={index} className="bg-surface px-4 py-4">
            <span className="block h-2 w-16 rounded-sm bg-line" aria-hidden="true" />
            <span
              className="mt-2 block h-5 w-24 rounded-sm bg-elevated"
              aria-hidden="true"
            />
          </div>
        ))}
      </div>
      <div className="space-y-3 p-4">
        {[0, 1, 2, 3].map((index) => (
          <div key={index} className="space-y-1.5">
            <div className="flex justify-between">
              <span className="h-2 w-32 rounded-sm bg-line" aria-hidden="true" />
              <span className="h-2 w-12 rounded-sm bg-line" aria-hidden="true" />
            </div>
            <span
              className="block h-1.5 rounded-full bg-elevated"
              aria-hidden="true"
            />
          </div>
        ))}
      </div>
      {slow ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-surface/95 px-6 text-center">
          <p className="font-mono text-[10px] text-muted">
            This panel is taking longer than expected.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="min-h-[26px] rounded border border-line px-2.5 font-mono text-[10px] text-fg transition-colors hover:bg-elevated"
          >
            Reload page
          </button>
        </div>
      ) : null}
    </div>
  );
}

class PanelBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="flex h-[320px] flex-col items-center justify-center gap-3 rounded-lg border border-line bg-surface px-6 text-center">
          <p className="text-[12.5px] text-muted">
            This panel could not load.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="min-h-[26px] rounded border border-line px-2.5 font-mono text-[10px] text-fg transition-colors hover:bg-elevated"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const RepositoryExplorer = dynamic(
  () =>
    import("@/components/repository-explorer").then(
      (module) => module.RepositoryExplorer,
    ),
  { loading: () => <VisualSkeleton /> },
);

const TokenAnalytics = dynamic(
  () =>
    import("@/components/token-analytics").then(
      (module) => module.TokenAnalytics,
    ),
  { loading: () => <VisualSkeleton /> },
);

const OptimizationComparison = dynamic(
  () =>
    import("@/components/optimization-comparison").then(
      (module) => module.OptimizationComparison,
    ),
  { loading: () => <VisualSkeleton /> },
);

const CiPipeline = dynamic(
  () => import("@/components/ci-pipeline").then((module) => module.CiPipeline),
  { loading: () => <VisualSkeleton /> },
);

const visuals = [
  <RepositoryExplorer key="discover" />,
  <TokenAnalytics key="analyze" />,
  <OptimizationComparison key="optimize" />,
  <CiPipeline key="enforce" />,
];

const verbs = ["DISCOVER", "ANALYZE", "OPTIMIZE", "ENFORCE"] as const;

/** Warm the chunk on hover or focus so a tab click does not show the skeleton. */
const loaders = [
  () => import("@/components/repository-explorer"),
  () => import("@/components/token-analytics"),
  () => import("@/components/optimization-comparison"),
  () => import("@/components/ci-pipeline"),
];

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const warmed = useRef<Set<number>>(new Set());

  const prefetch = useCallback((index: number) => {
    if (warmed.current.has(index)) return;
    warmed.current.add(index);
    void loaders[index]?.();
  }, []);

  // Warm every panel shortly before the section reaches the viewport, so a tap
  // on a phone does not wait for a chunk it could have fetched while scrolling.
  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          loaders.forEach((_, index) => prefetch(index));
          observer.disconnect();
        }
      },
      { rootMargin: "320px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [prefetch]);

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const last = steps.length - 1;
    let next = active;
    if (e.key === "ArrowDown" || e.key === "ArrowRight")
      next = active === last ? 0 : active + 1;
    else if (e.key === "ArrowUp" || e.key === "ArrowLeft")
      next = active === 0 ? last : active - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else return;
    e.preventDefault();
    setActive(next);
    refs.current[next]?.focus();
  }

  const step = steps[active] ?? steps[0]!;

  return (
    <section ref={sectionRef} id="how-it-works" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-20 sm:px-8 sm:py-24">
        <SectionHeading
          index="03"
          kicker="How it works"
          title="Discover, analyze, optimize, enforce"
          lede="Four steps, one pass, no server round-trip. The first two are a command; the last two are decisions you make with the output. Each stage below is interactive."
        />

        <div
          role="tablist"
          aria-label="How AgentDiet works"
          aria-orientation="horizontal"
          onKeyDown={onKeyDown}
          className="scroll-thin mt-10 flex gap-1 overflow-x-auto border-b border-line pb-px"
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
                onPointerEnter={() => prefetch(i)}
                onFocus={() => prefetch(i)}
                className={`group relative flex min-w-[132px] shrink-0 items-baseline gap-2 px-3 py-3 text-left transition-colors sm:min-w-0 sm:flex-1 ${
                  selected ? "text-fg" : "text-muted hover:text-fg"
                }`}
              >
                <span
                  className={`font-mono text-[10px] tabular-nums ${
                    selected ? "text-accent" : "text-faint"
                  }`}
                >
                  0{i + 1}
                </span>
                <span className="text-[13px] font-medium">{s.label}</span>
                {selected ? (
                  <span
                    aria-hidden="true"
                    className="journey-underline absolute inset-x-0 -bottom-px h-[2px] origin-left bg-accent"
                  />
                ) : null}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid min-h-[560px] grid-cols-1 gap-8 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)] lg:gap-12">
          <div key={step.id} className="detail-in min-w-0">
            <div className="flex items-baseline gap-2 font-mono text-[10px] text-faint">
              <span className="text-accent">0{active + 1}</span>
              <span>{verbs[active]}</span>
            </div>
            <h3 className="mt-2 text-[17px] font-medium tracking-[-0.015em]">
              {step.title}
            </h3>
            <p className="mt-2 text-[13.5px] leading-[1.65] text-muted">
              {step.body}
            </p>
            <p className="mt-5 flex items-start gap-2 border-t border-line pt-4 font-mono text-[10.5px] leading-relaxed text-faint">
              <span className="text-accent" aria-hidden="true">
                ↳
              </span>
              {step.caption}
            </p>
            <a
              href="#example"
              className="mt-4 inline-flex items-center gap-1.5 font-mono text-[10.5px] text-muted transition-colors hover:text-fg"
            >
              see the full report
              <ArrowRight className="size-3" aria-hidden="true" />
            </a>
          </div>

          <div
            key={`${step.id}-panel`}
            role="tabpanel"
            id={`step-panel-${step.id}`}
            aria-labelledby={`step-tab-${step.id}`}
            tabIndex={0}
            className="detail-in min-w-0 outline-none"
          >
            <PanelBoundary key={step.id}>{visuals[active]}</PanelBoundary>
          </div>
        </div>
      </div>
    </section>
  );
}

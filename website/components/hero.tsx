import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { GitHubMark } from "@/components/marks";
import { CopyButton } from "@/components/copy-button";
import { demo } from "@/lib/demo";
import { installCommand, links, site } from "@/lib/site";
import { buttonPrimary, buttonSecondary } from "@/lib/ui";

const fmt = (n: number) => n.toLocaleString("en-US");

/**
 * The hero artifact: a "context bill" for the simulated repository, built from
 * the same numbers the CLI printed. The grade rail is the argument the tool
 * makes: absolute always-on tokens, not a percentage of the window.
 */
function ContextBill() {
  const b = demo.before;

  // Bands are equal width; the marker sits inside the C band (4,000–8,000).
  const bands = [
    { grade: "A", max: 1500, tone: "var(--accent)" },
    { grade: "B", max: 4000, tone: "var(--accent)" },
    { grade: "C", max: 8000, tone: "var(--warn)" },
    { grade: "D", max: 16000, tone: "var(--danger)" },
    { grade: "F", max: Infinity, tone: "var(--danger)" },
  ];
  const bandIndex = 2; // C
  const bandStart = 4000;
  const bandEnd = 8000;
  const within = (b.tokens - bandStart) / (bandEnd - bandStart);
  const markerPct = ((bandIndex + Math.min(Math.max(within, 0), 1)) / bands.length) * 100;

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="relative flex size-1.5 shrink-0">
            <span className="absolute inline-flex size-full rounded-full bg-accent/60" />
            <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
          </span>
          <span className="truncate font-mono text-[11px] text-muted">
            agent context · acme-platform
          </span>
        </div>
        <span className="shrink-0 rounded border border-warn/30 bg-warn/10 px-1.5 py-0.5 font-mono text-[10.5px] font-medium text-warn">
          grade {b.grade}
        </span>
      </div>

      <div className="px-4 pt-5 pb-4">
        <div className="flex items-end gap-2.5">
          <span className="font-mono text-[38px] leading-none font-medium tracking-[-0.04em] tabular-nums">
            {fmt(b.tokens)}
          </span>
          <span className="pb-1 text-[12px] text-faint">tokens</span>
        </div>
        <p className="mt-2 text-[12.5px] leading-snug text-muted">
          injected before you type, on every request
        </p>

        <div className="mt-5">
          <div className="relative">
            <div className="flex gap-1" aria-hidden="true">
              {bands.map((band, i) => (
                <div
                  key={band.grade}
                  className="h-1.5 flex-1 rounded-full"
                  style={{
                    background: band.tone,
                    opacity: i === bandIndex ? 0.9 : 0.28,
                  }}
                />
              ))}
            </div>
            <div
              className="absolute -top-1 h-3.5 w-px bg-fg"
              style={{ left: `calc(${markerPct}% - 0.5px)` }}
              aria-hidden="true"
            />
          </div>
          <div className="mt-1.5 flex justify-between font-mono text-[10px] text-faint">
            <span>A 1.5k</span>
            <span>B 4k</span>
            <span className="text-warn">C 8k</span>
            <span>D 16k</span>
            <span>F</span>
          </div>
          <p className="sr-only">
            {fmt(b.tokens)} always-on tokens places this repository at grade{" "}
            {b.grade}, where the budget for grade C is {fmt(b.budget)} tokens and
            grade A ends at 1,500.
          </p>
        </div>

        <dl className="mt-5 grid grid-cols-3 divide-x divide-line border-y border-line">
          <div className="py-3 pr-2">
            <dt className="text-[10.5px] text-faint">per 1k sessions</dt>
            <dd className="mt-0.5 font-mono text-[14px] tabular-nums">
              ${b.cost.toFixed(2)}
            </dd>
          </div>
          <div className="px-3 py-3">
            <dt className="text-[10.5px] text-faint">on-demand, free</dt>
            <dd className="mt-0.5 font-mono text-[14px] tabular-nums">
              {fmt(b.onDemand)}
            </dd>
          </div>
          <div className="py-3 pl-3">
            <dt className="text-[10.5px] text-faint">MCP servers</dt>
            <dd className="mt-0.5 font-mono text-[14px] tabular-nums">
              6
            </dd>
          </div>
        </dl>

        <div className="mt-4 space-y-1.5">
          <div className="flex items-start gap-2 text-[12px] leading-snug">
            <span className="mt-[3px] size-1 shrink-0 rounded-full bg-warn" aria-hidden="true" />
            <p className="text-muted">
              <span className="text-fg">2,389 tokens</span> repeated across
              AGENTS.md and CLAUDE.md
            </p>
          </div>
          <div className="flex items-start gap-2 text-[12px] leading-snug">
            <span className="mt-[3px] size-1 shrink-0 rounded-full bg-warn" aria-hidden="true" />
            <p className="text-muted">
              <span className="text-fg">AGENTS.md is 100% contained</span> in
              CLAUDE.md
            </p>
          </div>
        </div>
      </div>

      <div className="border-t border-line bg-elevated/40 px-4 py-2 font-mono text-[10.5px] text-faint">
        simulated repository · real report output
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 grid-bg opacity-[0.55] [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px] glow-top"
      />

      <div className="relative mx-auto w-full max-w-[1180px] px-5 pt-16 pb-16 sm:px-8 sm:pt-24 lg:pt-28 lg:pb-24">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
          <div>
            <div className="mb-7 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface/70 px-2.5 py-1 font-mono text-[10.5px] tracking-[0.02em] text-muted">
                <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
                Open source · {site.license} licensed
              </span>
              <span className="font-mono text-[10.5px] text-faint">
                Go 1.22+ · single static binary
              </span>
            </div>

            <h1 className="text-[clamp(2.35rem,5.1vw,3.85rem)] leading-[1.02] font-semibold tracking-[-0.035em]">
              Your AI Agent Deserves a{" "}
              <span className="relative inline-block">
                Leaner Context
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 left-0 h-[2px] w-full origin-left bg-accent/70 sm:-bottom-1.5"
                />
              </span>
              {"."}
            </h1>

            <p className="mt-7 max-w-[54ch] text-[15.5px] leading-[1.65] text-muted">
              AgentDiet helps developers measure, analyze, and optimize AI coding
              agent context consumption. Identify unnecessary overhead, eliminate
              duplicated instructions, and keep your AI development workflow
              efficient.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <a
                href={links.repo}
                target="_blank"
                rel="noreferrer noopener"
                className={buttonPrimary}
              >
                <GitHubMark className="size-[15px]" />
                Explore on GitHub
              </a>
              <Link href="/docs#quickstart" className={buttonSecondary}>
                Get started
                <ArrowRight className="size-[15px]" aria-hidden="true" />
              </Link>
            </div>

            <div className="mt-8 max-w-[440px]">
              <div className="flex items-center justify-between gap-3 rounded-md border border-line bg-surface/60 px-3 py-2">
                <code className="min-w-0 overflow-x-auto font-mono text-[11.5px] whitespace-nowrap text-fg/90">
                  <span className="mr-1.5 text-faint select-none">$</span>
                  {installCommand}
                </code>
                <CopyButton value={installCommand} label="install command" />
              </div>
              <p className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[10.5px] text-faint">
                <span>zero dependencies</span>
                <span aria-hidden="true">·</span>
                <span>no API key</span>
                <span aria-hidden="true">·</span>
                <span>no network calls</span>
                <span aria-hidden="true">·</span>
                <span>no config file</span>
              </p>
              
            </div>
          </div>

          <div className="lg:pt-2">
            <ContextBill />
            <p className="mt-3 flex items-start gap-2 text-[11.5px] leading-snug text-faint">
              <Star className="mt-[2px] size-3 shrink-0" aria-hidden="true" />
              <span>
                Numbers come from the{" "}
                <Link
                  href="/#example"
                  className="text-muted underline decoration-line-strong underline-offset-2 hover:text-fg hover:decoration-accent"
                >
                  simulated example repository
                </Link>
                , not a benchmark of your codebase.
              </span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

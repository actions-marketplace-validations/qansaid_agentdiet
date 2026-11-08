import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import { GitHubMark } from "@/components/marks";
import { CopyButton } from "@/components/copy-button";
import { HeroTerminal } from "@/components/hero-terminal";
import { installCommand, links, site } from "@/lib/site";
import { buttonPrimary, buttonSecondary } from "@/lib/ui";

const journey = ["discover", "analyze", "optimize", "enforce"] as const;

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
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-16">
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
              <Link
                href="/#how-it-works"
                className="group mt-5 inline-flex items-baseline gap-2 font-mono text-[10.5px] text-faint transition-colors hover:text-muted"
                aria-label="How AgentDiet works: discover, analyze, optimize, enforce"
              >
                {journey.map((step, i) => (
                  <span key={step} className="flex items-baseline gap-2">
                    {i === 0 ? (
                      <span className="text-accent">{step}</span>
                    ) : (
                      <span>{step}</span>
                    )}
                    {i < journey.length - 1 ? (
                      <span aria-hidden="true" className="text-line-strong">
                        →
                      </span>
                    ) : null}
                  </span>
                ))}
              </Link>
            </div>
          </div>

          <div className="min-w-0 lg:pt-2">
            <HeroTerminal />
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

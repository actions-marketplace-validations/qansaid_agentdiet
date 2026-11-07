import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { GitHubMark } from "@/components/marks";
import { installCommand, links, site } from "@/lib/site";
import { buttonPrimary, buttonSecondary } from "@/lib/ui";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden border-t border-line">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 dot-bg opacity-40 [mask-image:radial-gradient(60%_80%_at_50%_50%,black,transparent)]"
      />
      <div className="relative mx-auto w-full max-w-[1180px] px-5 py-20 sm:px-8 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:items-end">
          <div>
            <h2 className="max-w-[18ch] text-[clamp(1.8rem,3.6vw,2.6rem)] leading-[1.06] font-semibold tracking-[-0.03em]">
              Measure it before you optimize it.
            </h2>
            <p className="mt-4 max-w-[52ch] text-[14.5px] leading-[1.65] text-muted">
              One command, no account, no upload. If your context is already lean
              the report will say so in one line — which is the cheapest possible
              answer to a question most teams never ask.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3 rounded-md border border-line bg-surface px-3 py-2.5">
              <code className="min-w-0 overflow-x-auto font-mono text-[11.5px] whitespace-nowrap text-fg/90">
                <span className="mr-1.5 text-faint select-none">$</span>
                {installCommand}
              </code>
              <CopyButton value={installCommand} label="install command" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2.5">
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
                Read the docs
                <ArrowRight className="size-[15px]" aria-hidden="true" />
              </Link>
            </div>
            <p className="mt-3 font-mono text-[10.5px] text-faint">
              {site.license} · Go 1.22+ · no telemetry · no network calls
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

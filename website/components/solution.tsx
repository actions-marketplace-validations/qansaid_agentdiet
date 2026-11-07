import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { capabilities } from "@/lib/site";
import { links } from "@/lib/site";

const nots = [
  {
    title: "Not a tokenizer",
    body: "It estimates, and prints the method in every report. A 2 MB vocabulary would buy precision nobody acts on and still be wrong for the next model.",
  },
  {
    title: "Not an auto-fixer",
    body: "It never rewrites your instruction files. Findings carry a fix as text; the diff is yours, reviewed by you.",
  },
  {
    title: "Not a hosted service",
    body: "No account, no upload, no telemetry, no network call. One binary, one pass over your working tree.",
  },
];

export function Solution() {
  return (
    <section id="capabilities" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-20 sm:px-8 sm:py-24">
        <SectionHeading
          index="02"
          kicker="The solution"
          title="One binary that prices your prompt"
          lede="AgentDiet walks the repository, keeps the four tiers apart, and turns the always-on number into something you can argue about, budget for, and gate in CI. It reads files and prints a report — nothing else."
          aside={
            <a
              href={links.repo}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 font-mono text-[11px] text-muted transition-colors hover:border-line-strong hover:text-fg"
            >
              read the source
              <span aria-hidden="true">↗</span>
            </a>
          }
        />

        <div className="mt-12 border-t border-line">
          {capabilities.map((cap, i) => (
            <Reveal key={cap.title} delay={Math.min(i * 40, 160)}>
              <article className="group grid gap-2 border-b border-line py-6 transition-colors hover:bg-elevated/25 md:grid-cols-[minmax(0,260px)_minmax(0,1fr)] md:gap-10 md:px-2">
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-[10.5px] text-faint tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="text-[14px] font-medium tracking-[-0.01em]">
                    {cap.title}
                  </h3>
                </div>
                <div>
                  <p className="max-w-[68ch] text-[13px] leading-[1.65] text-muted">
                    {cap.body}
                  </p>
                  <p className="mt-2 font-mono text-[10.5px] text-faint transition-colors group-hover:text-muted">
                    {cap.evidence}
                  </p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal className="mt-10">
          <div className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
            {nots.map((n) => (
              <div key={n.title} className="bg-bg px-5 py-5">
                <h3 className="font-mono text-[11px] tracking-wide text-faint uppercase">
                  {n.title}
                </h3>
                <p className="mt-2 text-[12.5px] leading-[1.6] text-muted">
                  {n.body}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[12px] text-faint">
            Unshipped work is listed as unchecked in the repository&rsquo;s
            roadmap — <span className="font-mono">--since</span>,{" "}
            <span className="font-mono">.agentdietignore</span>, exact tokenizer
            mode and SARIF are planned, not features.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

import { Star } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { GitHubMark, Logo } from "@/components/marks";
import { links, site } from "@/lib/site";
import { buttonPrimary, buttonSecondary } from "@/lib/ui";

const cells = [
  {
    label: "License",
    value: "MIT",
    body: "Use it, fork it, ship it inside a commercial product. The only obligation is attribution.",
    href: links.license,
  },
  {
    label: "Discussions",
    value: "Open",
    body: "Design questions, new file conventions and estimator accuracy are discussed in the open.",
    href: links.discussions,
  },
  {
    label: "Issues",
    value: "Templates",
    body: "Two focused forms: a file that was not detected, and a finding that looks wrong.",
    href: links.newIssue,
  },
  {
    label: "Contributing",
    value: "Welcome",
    body: "New conventions and new findings are the most useful contributions, each with a test fixture.",
    href: links.contributing,
  },
];

export function OpenSource() {
  return (
    <section id="open-source" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-20 sm:px-8 sm:py-24">
        <SectionHeading
          index="07"
          kicker="Open source"
          title="Built for Developers. Open for Everyone."
          lede="AgentDiet is developed in the open under Qansa, licensed MIT, and deliberately small: a stdlib-only Go binary with no runtime dependencies, no network calls and no telemetry. There is no paid tier and no hosted version to upsell you into."
          aside={
            <div className="flex items-center gap-2 font-mono text-[10.5px] text-faint md:justify-end">
              <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />
              {site.license} · public repository
            </div>
          }
        />

        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {cells.map((cell) => (
            <a
              key={cell.label}
              href={cell.href}
              target="_blank"
              rel="noreferrer noopener"
              className="group flex flex-col bg-bg px-5 py-5 transition-colors hover:bg-elevated/50"
            >
              <div className="flex items-center justify-between">
                <span className="eyebrow">{cell.label}</span>
                <span className="text-faint transition-transform group-hover:-translate-y-0.5 group-hover:text-fg">
                  ↗
                </span>
              </div>
              <p className="mt-3 font-mono text-[15px] text-fg">{cell.value}</p>
              <p className="mt-2 text-[12px] leading-[1.6] text-muted">
                {cell.body}
              </p>
            </a>
          ))}
        </div>

        <Reveal className="mt-6">
          <div className="flex flex-col gap-4 rounded-lg border border-line bg-surface/50 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Logo className="mt-0.5 size-[18px] text-fg" />
              <div>
                <p className="text-[13px] text-fg">
                  Maintained by{" "}
                  <a
                    href={links.org}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline decoration-line-strong underline-offset-4 hover:decoration-accent"
                  >
                    Qansa
                  </a>
                </p>
                <p className="mt-1 max-w-[52ch] text-[12px] leading-[1.6] text-muted">
                  AgentDiet is a Qansa open-source project. Product identity stays
                  with AgentDiet; the repository, releases and roadmap live under
                  the Qansa organization on GitHub.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <a
                href={links.star}
                target="_blank"
                rel="noreferrer noopener"
                className={buttonPrimary}
              >
                <Star className="size-[14px]" aria-hidden="true" />
                Star on GitHub
              </a>
              <a
                href={links.fork}
                target="_blank"
                rel="noreferrer noopener"
                className={buttonSecondary}
              >
                <GitHubMark className="size-[14px]" />
                Fork
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

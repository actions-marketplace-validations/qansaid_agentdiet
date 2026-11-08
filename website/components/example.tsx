import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { Terminal, Report, ShellLine } from "@/components/terminal";
import { demo, demoMeta } from "@/lib/demo";

const fmt = (n: number) => n.toLocaleString("en-US");

const changes = [
  {
    from: "AGENTS.md",
    to: "Rules only, 55 lines",
    detail:
      "Schema, glossary, endpoint catalog, incident themes and the deploy runbook moved to docs/ and skills/, where they load only when the task needs them.",
  },
  {
    from: "CLAUDE.md",
    to: "A pointer, 6 lines",
    detail:
      "The full copy became a two-sentence pointer to the canonical file. Duplication removed at the source, not summarized.",
  },
  {
    from: ".cursorrules / copilot-instructions",
    to: "Short form + pointer",
    detail:
      "Kept the handful of client-specific notes; stopped restating the repository rules in every dialect.",
  },
  {
    from: "6 MCP servers",
    to: "2 declared",
    detail:
      "jira, playwright, sentry and slack were removed from .mcp.json, leaving github and postgres. Their tool schemas no longer enter the prompt on connect.",
  },
];

function DeltaBand() {
  const b = demo.before;
  const a = demo.after;
  const drop = ((b.tokens - a.tokens) / b.tokens) * 100;

  return (
    <div className="card overflow-hidden">
      <div className="grid divide-line sm:grid-cols-3 sm:divide-x">
        <div className="px-5 py-5">
          <p className="eyebrow">Always-on tokens</p>
          <div className="mt-2 flex items-baseline gap-2 font-mono">
            <span className="text-[15px] text-faint tabular-nums line-through decoration-line-strong">
              {fmt(b.tokens)}
            </span>
            <ArrowRight className="size-3.5 self-center text-faint" aria-hidden="true" />
            <span className="text-[22px] text-fg tabular-nums">{fmt(a.tokens)}</span>
          </div>
          <p className="mt-1.5 text-[11px] text-faint">
            per request, before you type
          </p>
        </div>
        <div className="border-t border-line px-5 py-5 sm:border-t-0">
          <p className="eyebrow">Grade</p>
          <div className="mt-2 flex items-baseline gap-2 font-mono">
            <span className="text-[15px] text-warn tabular-nums">{b.grade}</span>
            <ArrowRight className="size-3.5 self-center text-faint" aria-hidden="true" />
            <span className="text-[22px] text-accent tabular-nums">{a.grade}</span>
          </div>
          <p className="mt-1.5 text-[11px] text-faint">
            {fmt(b.budget)} → {fmt(a.budget)} token budget
          </p>
        </div>
        <div className="border-t border-line px-5 py-5 sm:border-t-0">
          <p className="eyebrow">Est. cost / 1K requests</p>
          <div className="mt-2 flex items-baseline gap-2 font-mono">
            <span className="text-[15px] text-faint tabular-nums line-through decoration-line-strong">
              ${b.cost.toFixed(2)}
            </span>
            <ArrowRight className="size-3.5 self-center text-faint" aria-hidden="true" />
            <span className="text-[22px] text-fg tabular-nums">
              ${a.cost.toFixed(2)}
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-faint">
            at ${demoMeta.price.toFixed(2)} per 1M, one request per session
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line bg-elevated/40 px-5 py-2.5">
        <p className="font-mono text-[11px] text-muted">
          <span className="text-accent">{drop.toFixed(1)}%</span> less context on
          every single request
        </p>
        <p className="font-mono text-[10.5px] text-faint">
          none of the information was deleted, it moved tiers
        </p>
      </div>
    </div>
  );
}

export function Example() {
  return (
    <section id="example" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-20 sm:px-8 sm:py-24">
        <SectionHeading
          index="04"
          kicker="Worked example"
          title="The same repository, measured twice"
          lede="A simulated Go monorepo with the drift almost every mature repository accumulates: a 285-line AGENTS.md, a CLAUDE.md that is a full copy of it, per-client rule files restating the same paragraphs, and six MCP servers declared for one service."
          aside={
            <div className="space-y-1 font-mono text-[10.5px] text-faint md:text-right">
              <p>simulated fixture</p>
              <p className="text-muted">not a benchmark</p>
            </div>
          }
        />

        <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-line py-3 font-mono text-[10.5px] text-faint">
          <span>
            fixture <span className="text-muted">{demoMeta.fixture}</span>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            command <span className="text-muted">$ {demoMeta.command}</span>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            window <span className="text-muted">{fmt(demoMeta.window)}</span>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            price <span className="text-muted">${demoMeta.price.toFixed(2)}/1M</span>
          </span>
        </div>

        <Reveal className="mt-8">
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="rounded border border-warn/30 bg-warn/10 px-1.5 py-0.5 font-mono text-[10px] text-warn">
                BEFORE
              </span>
              <span className="text-[12.5px] text-muted">
                As it accreted: rules, reference and a duplicate, all always-on.
              </span>
            </div>
            <span className="font-mono text-[11px] text-faint">
              grade C · {fmt(demo.before.tokens)} tokens
            </span>
          </div>
          <Terminal
            title={
              <span className="text-zinc-400">
                acme-platform <span className="text-zinc-600">·</span> agentdiet .
                --top 10
              </span>
            }
            copyValue={demo.beforeOutput}
            copyLabel="before report"
            footnote="verbatim output · simulated repository"
          >
            <div className="mb-1">
              <ShellLine command="agentdiet . --top 10" />
            </div>
            <Report output={demo.beforeOutput} />
          </Terminal>
        </Reveal>

        <Reveal className="mt-8">
          <DeltaBand />
        </Reveal>

        <Reveal className="mt-8">
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <span className="rounded border border-accent/30 bg-accent/10 px-1.5 py-0.5 font-mono text-[10px] text-accent">
                AFTER
              </span>
              <span className="text-[12.5px] text-muted">
                Reorganized by tier, with nothing thrown away.
              </span>
            </div>
            <span className="font-mono text-[11px] text-faint">
              grade A · {fmt(demo.after.tokens)} tokens
            </span>
          </div>
          <Terminal
            title={
              <span className="text-zinc-400">
                acme-platform <span className="text-zinc-600">·</span> agentdiet .
                --top 10
              </span>
            }
            copyValue={demo.afterOutput}
            copyLabel="after report"
            footnote="verbatim output · simulated repository"
          >
            <div className="mb-1">
              <ShellLine command="agentdiet . --top 10" />
            </div>
            <Report output={demo.afterOutput} />
          </Terminal>
        </Reveal>

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-14">
          <Reveal>
            <h3 className="text-[15px] font-medium">What actually changed</h3>
            <dl className="mt-4 border-t border-line">
              {changes.map((c) => (
                <div key={c.from} className="border-b border-line py-4">
                  <dt className="flex flex-wrap items-baseline gap-2 font-mono text-[11.5px]">
                    <span className="text-muted line-through decoration-line-strong">
                      {c.from}
                    </span>
                    <ArrowRight className="size-3 text-faint" aria-hidden="true" />
                    <span className="text-fg">{c.to}</span>
                  </dt>
                  <dd className="mt-1.5 max-w-[62ch] text-[12.5px] leading-[1.6] text-muted">
                    {c.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <Reveal delay={80}>
            <div className="rounded-lg border border-warn/25 bg-warn/[0.04] p-5">
              <h3 className="font-mono text-[10.5px] tracking-wide text-warn uppercase">
                Read this before quoting the numbers
              </h3>
              <p className="mt-2.5 text-[12.5px] leading-[1.65] text-muted">
                This repository is{" "}
                <span className="text-fg">synthetic</span>. The before and after
                figures describe that fixture only. They are not a benchmark, not
                a survey, and not a promised saving for your codebase.
              </p>
              <p className="mt-2.5 text-[12.5px] leading-[1.65] text-muted">
                The CLI prints its cost line per 1,000 sessions because it assumes
                one request per session. The labels here call the same figure an
                estimated cost per 1,000 requests; multiply it by the requests a
                session actually makes if your workflow differs.
              </p>
              <p className="mt-2.5 text-[12.5px] leading-[1.65] text-muted">
                The percentage is a consequence of how much duplication the fixture
                contains. Your repository may have almost none, in which case the
                report will tell you that too, and the honest next step is to run
                it on your own tree, which takes one command and sends nothing
                anywhere.
              </p>
              <Link
                href="/docs#quickstart"
                className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] text-fg underline decoration-line-strong underline-offset-4 hover:decoration-accent"
              >
                Run it on your repository
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

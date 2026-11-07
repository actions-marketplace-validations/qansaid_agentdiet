import { SectionHeading } from "@/components/section-heading";
import { Reveal } from "@/components/reveal";
import { demo } from "@/lib/demo";

const patterns = [
  {
    n: "01",
    title: "Bloated AGENTS.md",
    body: "A rule per incident, a table per architecture decision. Nothing is ever deleted, because removing a rule feels riskier than adding one — so the file only grows.",
    sample: "AGENTS.md · 285 lines · 3,086 tokens",
  },
  {
    n: "02",
    title: "Duplicated CLAUDE.md instructions",
    body: "The same rules under a second filename, kept in sync by hand. Both copies are injected, so every request pays for the paragraph twice and neither file is authoritative.",
    sample: "AGENTS.md ↔ CLAUDE.md · 2,389 tokens repeated",
  },
  {
    n: "03",
    title: "Oversized system instructions",
    body: "Schemas, endpoint catalogs and glossaries pasted into the root file. They are reference material, needed for one task in fifty, loaded for all fifty.",
    sample: "one always-on file above 3,000 tokens",
  },
  {
    n: "04",
    title: "Unnecessary always-on context",
    body: "On-call escalation paths, incident history, retention policy. All true, all useful, none of it relevant to the function you asked the agent to change.",
    sample: "scoped rules promoted to always-on, silently",
  },
  {
    n: "05",
    title: "Excessive MCP tool definitions",
    body: "Each connected server contributes tool schemas to the prompt as soon as a session opens. Six servers declared for one repo means six surfaces competing for attention.",
    sample: "6 servers declared · schemas enter on connect",
  },
];

const tierRows = [
  {
    name: "always-on",
    when: "Injected on every request, before you type",
    advice: "Keep it ruthless. Rules only.",
    tokens: demo.before.tokens,
    bill: true,
  },
  {
    name: "scoped",
    when: "Loaded only while editing that subtree",
    advice: "Fine — proportional to the work.",
    tokens: demo.before.scoped,
    bill: false,
  },
  {
    name: "on-demand",
    when: "Costs nothing until the agent opens it",
    advice: "Let it grow. Reference belongs here.",
    tokens: demo.before.onDemand,
    bill: false,
  },
  {
    name: "config",
    when: "Declares tools and servers, not text",
    advice: "Audit the surface, not the word count.",
    tokens: 0,
    bill: false,
  },
];

function TierLadder() {
  const max = Math.max(...tierRows.map((r) => r.tokens), 1);

  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <div className="hidden grid-cols-[190px_1fr_170px] gap-6 border-b border-line bg-elevated/40 px-5 py-2.5 md:grid">
        <span className="eyebrow">Tier</span>
        <span className="eyebrow">When it reaches the model</span>
        <span className="eyebrow text-right">In the fixture</span>
      </div>
      {tierRows.map((row) => (
        <div
          key={row.name}
          className={`grid gap-2 border-b border-line px-5 py-4 last:border-b-0 md:grid-cols-[190px_1fr_170px] md:items-center md:gap-6 ${
            row.bill ? "bg-warn/[0.045]" : ""
          }`}
        >
          <div className="flex items-center gap-2">
            <span
              className={`font-mono text-[12.5px] ${row.bill ? "text-warn" : "text-fg"}`}
            >
              {row.name}
            </span>
            {row.bill ? (
              <span className="rounded-sm border border-warn/30 px-1 py-0.5 font-mono text-[10px] tracking-wide text-warn uppercase">
                billed
              </span>
            ) : null}
          </div>
          <div>
            <p className="text-[13px] text-muted">{row.when}</p>
            <p className="mt-0.5 text-[11.5px] text-faint">{row.advice}</p>
          </div>
          <div className="md:text-right">
            {row.tokens > 0 ? (
              <>
                <div className="mb-1.5 hidden h-1 w-full overflow-hidden rounded-full bg-line md:block">
                  <div
                    className={`h-full rounded-full ${row.bill ? "bg-warn/80" : "bg-fg/25"}`}
                    style={{
                      width: `${Math.max((row.tokens / max) * 100, 2)}%`,
                    }}
                  />
                </div>
                <span className="font-mono text-[11.5px] tabular-nums text-muted">
                  {row.tokens.toLocaleString("en-US")} tokens
                </span>
              </>
            ) : (
              <span className="font-mono text-[11.5px] text-muted">
                6 MCP servers
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

const duplicated = [
  "## Git workflow",
  "Branch names are <type>/<issue>-<slug>.",
  "Rebase onto main before opening a PR.",
  "Squash-merge is the default.",
];

function DuplicateVisual() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {["AGENTS.md", "CLAUDE.md"].map((file) => (
        <figure key={file} className="overflow-hidden rounded-md border border-line bg-surface">
          <figcaption className="flex items-center justify-between border-b border-line px-3 py-1.5 font-mono text-[10.5px] text-faint">
            <span>{file}</span>
            <span className="text-warn/80">duplicate</span>
          </figcaption>
          <div className="space-y-1 px-3 py-2.5 font-mono text-[10.5px] leading-[1.7]">
            {duplicated.map((line, i) => (
              <p
                key={line}
                className={
                  i === 0
                    ? "text-muted"
                    : "bg-warn/[0.09] text-fg/80 -mx-3 px-3 border-l-2 border-warn/50"
                }
              >
                {line}
              </p>
            ))}
          </div>
        </figure>
      ))}
    </div>
  );
}

export function Problem() {
  return (
    <section id="problem" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-20 sm:px-8 sm:py-24">
        <SectionHeading
          index="01"
          kicker="The problem"
          title="The tax you pay before you type"
          lede="Every agent runtime loads a set of instruction files unconditionally: AGENTS.md, CLAUDE.md, .cursorrules, copilot-instructions.md. Nobody measures them. They grow by accretion until the agent is spending thousands of tokens on instructions before it has read your question."
          aside={
            <div className="font-mono text-[11px] leading-relaxed text-faint md:text-right">
              <p>paid per request</p>
              <p className="text-warn">not per task</p>
            </div>
          }
        />

        <Reveal className="mt-12">
          <TierLadder />
          <p className="mt-3 max-w-[76ch] text-[12px] leading-relaxed text-faint">
            A tool that reports &ldquo;your repo has 90k tokens of agent
            config&rdquo; collapses these rows and cannot tell you what to do.
            Only the first one is a bill; the rest is inventory.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-16">
          <Reveal>
            <h3 className="mb-1 text-[15px] font-medium">
              Five ways the prompt gets fat
            </h3>
            <p className="mb-6 text-[13px] text-faint">
              Each one is ordinary engineering hygiene until you count it.
            </p>
            <ol className="border-t border-line">
              {patterns.map((p) => (
                <li
                  key={p.n}
                  className="grid gap-1.5 border-b border-line py-5 sm:grid-cols-[36px_1fr] sm:gap-5"
                >
                  <span className="font-mono text-[11px] text-faint tabular-nums">
                    {p.n}
                  </span>
                  <div>
                    <h4 className="text-[13.5px] font-medium text-fg">
                      {p.title}
                    </h4>
                    <p className="mt-1.5 max-w-[58ch] text-[13px] leading-[1.6] text-muted">
                      {p.body}
                    </p>
                    <p className="mt-2 font-mono text-[10.5px] text-warn/80">
                      {p.sample}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>

          <Reveal delay={80} className="lg:pt-10">
            <div className="card p-5">
              <h3 className="text-[13.5px] font-medium">
                Duplication is worse than size
              </h3>
              <p className="mt-2 text-[12.5px] leading-[1.6] text-muted">
                The same paragraph in two files is not redundancy the agent can
                deduplicate. Both copies arrive in the prompt, every request, and
                they drift apart the first time someone edits only one.
              </p>
              <div className="mt-4">
                <DuplicateVisual />
              </div>
              <p className="mt-3 font-mono text-[10.5px] leading-relaxed text-faint">
                2,389 tokens recovered by keeping one copy and pointing at it.
              </p>
            </div>

            <div className="mt-4 rounded-lg border border-line bg-elevated/30 p-5">
              <p className="text-[12.5px] leading-[1.65] text-muted">
                The cost line uses{" "}
                <span className="font-mono text-[11.5px] text-fg">
                  $3.00 per 1M input tokens
                </span>{" "}
                as a default assumption — change it with{" "}
                <code className="rounded border border-line bg-surface px-1 py-0.5 font-mono text-[11px] text-fg">
                  --price
                </code>
                . It prices the context, not your invoice.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { GitPullRequest, ShieldCheck, Workflow } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { CodeBlock } from "@/components/code-block";
import { links } from "@/lib/site";

const samples = [
  {
    id: "action",
    label: "GitHub Action",
    file: ".github/workflows/agent-context.yml",
    highlight: ["max-tokens: 4000"],
    code: `name: agent-context
on: [push, pull_request]
jobs:
  agentdiet:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: qansaid/agentdiet@v1
        with:
          max-tokens: 4000
`,
  },
  {
    id: "go",
    label: "Plain Go install",
    file: ".github/workflows/agent-context.yml",
    highlight: ["agentdiet --max-tokens 4000"],
    code: `      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: "1.22"
      - run: go install github.com/qansaid/agentdiet@latest
      - run: agentdiet --max-tokens 4000
`,
  },
  {
    id: "badge",
    label: "Publish a badge",
    file: ".github/workflows/agent-context.yml",
    highlight: ["agentdiet --badge"],
    code: `      - run: agentdiet --badge > badge.json
      - uses: schneegans/dynamic-badges-action@v1.7.0
        with:
          auth: \${{ secrets.GIST_TOKEN }}
          gistID: <your-gist-id>
          filename: badge.json
`,
  },
];

const points = [
  {
    icon: GitPullRequest,
    title: "Pull request validation",
    body: "The check runs on every PR. A change that inflates the always-on tax fails like any other broken invariant, so the reviewer sees it before the merge, not a quarter later.",
  },
  {
    icon: Workflow,
    title: "Machine-readable output",
    body: "The action exposes always-on-tokens and grade as step outputs, and --json gives you every file, finding and total if you want your own dashboard instead.",
  },
  {
    icon: ShieldCheck,
    title: "No secrets to provision",
    body: "There is no API key to store, no service to reach and nothing to allowlist. The binary runs in the runner, reads the checkout and exits.",
  },
];

export function GithubIntegration() {
  const [active, setActive] = useState(samples[0]!.id);
  const sample = samples.find((s) => s.id === active) ?? samples[0]!;

  return (
    <section id="ci" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-20 sm:px-8 sm:py-24">
        <SectionHeading
          index="06"
          kicker="GitHub integration"
          title="Make it a gate, not a habit"
          lede="A number nobody checks is a number that grows. Wire the audit into the workflow you already have, and the always-on tax becomes a pull request check that has to be justified."
          aside={
            <a
              href={links.action}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-md border border-line px-3 py-2 font-mono text-[11px] text-muted transition-colors hover:border-line-strong hover:text-fg"
            >
              action.yml
              <span aria-hidden="true">↗</span>
            </a>
          }
        />

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] lg:gap-12">
          <div className="min-w-0">
            <div
              role="tablist"
              aria-label="CI integration examples"
              className="mb-3 flex flex-wrap gap-1.5"
            >
              {samples.map((s) => {
                const selected = s.id === active;
                return (
                  <button
                    key={s.id}
                    role="tab"
                    aria-selected={selected}
                    aria-controls={`ci-panel-${s.id}`}
                    id={`ci-tab-${s.id}`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActive(s.id)}
                    onKeyDown={(e) => {
                      const i = samples.findIndex((x) => x.id === active);
                      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
                      e.preventDefault();
                      const next =
                        samples[
                          (i + (e.key === "ArrowRight" ? 1 : -1) + samples.length) %
                            samples.length
                        ]!;
                      setActive(next.id);
                      document.getElementById(`ci-tab-${next.id}`)?.focus();
                    }}
                    className={`rounded-md border px-2.5 py-1.5 font-mono text-[11px] transition-colors ${
                      selected
                        ? "border-line-strong bg-elevated text-fg"
                        : "border-line text-muted hover:text-fg"
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
            <div
              role="tabpanel"
              id={`ci-panel-${sample.id}`}
              aria-labelledby={`ci-tab-${sample.id}`}
              key={sample.id}
              className="animate-[rise_0.35s_cubic-bezier(0.22,1,0.36,1)]"
            >
              <CodeBlock
                code={sample.code}
                title={sample.file}
                copyLabel="workflow snippet"
                highlight={sample.highlight}
              />
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-faint">
              Pins <span className="font-mono text-muted">@v1</span>, the moving
              major tag the maintainers update on each release. Pin a full semver
              tag if you prefer immutable refs.
            </p>
          </div>

          <div className="border-t border-line lg:border-t-0">
            {points.map((p) => (
              <div
                key={p.title}
                className="flex gap-3.5 border-b border-line py-5 first:pt-0 last:border-b-0"
              >
                <p.icon
                  className="mt-0.5 size-4 shrink-0 text-accent"
                  strokeWidth={1.7}
                  aria-hidden="true"
                />
                <div>
                  <h3 className="text-[13.5px] font-medium">{p.title}</h3>
                  <p className="mt-1.5 text-[12.5px] leading-[1.6] text-muted">
                    {p.body}
                  </p>
                </div>
              </div>
            ))}
            <a
              href={links.contributing}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-4 inline-flex items-center gap-1.5 text-[12.5px] text-muted underline decoration-line-strong underline-offset-4 transition-colors hover:text-fg hover:decoration-accent"
            >
              Contribution guidelines
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

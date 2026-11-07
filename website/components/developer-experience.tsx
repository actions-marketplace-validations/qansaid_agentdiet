"use client";

import { useState } from "react";
import { Terminal, Report } from "@/components/terminal";
import { demo } from "@/lib/demo";
import { flags, installCommand } from "@/lib/site";
import { SectionHeading } from "@/components/section-heading";

const jqOutput = `{
  "alwaysOnTokens": 6770,
  "grade": "C",
  "costPer1kSessionsUSD": 20.31,
  "onDemandTokens": 911,
  "mcpServers": [
    "github",
    "jira",
    "playwright",
    "postgres",
    "sentry",
    "slack"
  ],
  "findings": 7
}`;

const badgeOutput = `{
  "schemaVersion": 1,
  "label": "agent context",
  "message": "6.8k tok · C",
  "color": "yellow"
}`;

type Command = {
  id: string;
  label: string;
  command: string;
  blurb: string;
  body: React.ReactNode;
};

function Jsonish({ text }: { text: string }) {
  return (
    <div>
      {text.split("\n").map((line, i) => {
        const m = line.match(/^(\s*)("[^"]+")(: )(.*)$/);
        if (m) {
          return (
            <div key={i}>
              <span>{m[1]}</span>
              <span style={{ color: "#b8c4d0" }}>{m[2]}</span>
              <span style={{ color: "#5b5b64" }}>{m[3]}</span>
              <span style={{ color: "#3ddc97" }}>{m[4]}</span>
            </div>
          );
        }
        return (
          <div key={i} style={{ color: "#5b5b64" }}>
            {line || "\u00A0"}
          </div>
        );
      })}
    </div>
  );
}

export function DeveloperExperience() {
  const [active, setActive] = useState("audit");

  const commands: Command[] = [
    {
      id: "install",
      label: "install",
      command: installCommand,
      blurb: "One binary on your PATH. Prebuilt archives for Linux, macOS and Windows are on the releases page.",
      body: (
        <div>
          <div style={{ color: "#5b5b64" }}>
            {"# no output on success — the binary lands in $(go env GOPATH)/bin"}
          </div>
          <div style={{ color: "#c9c9cf" }}>{"$ which agentdiet"}</div>
          <div style={{ color: "#e4e4e7" }}>{"~/go/bin/agentdiet"}</div>
        </div>
      ),
    },
    {
      id: "audit",
      label: "audit",
      command: "agentdiet",
      blurb: "Audit the current repository. Pass a path to audit another tree.",
      body: <Report output={demo.afterOutput} />,
    },
    {
      id: "json",
      label: "--json",
      command:
        "agentdiet --json | jq '{alwaysOnTokens, grade, costPer1kSessionsUSD, onDemandTokens, mcpServers, findings: (.findings | length)}'",
      blurb: "Stable keys for dashboards, scripts and anything that is not a human. Pipe it straight into jq.",
      body: <Jsonish text={jqOutput} />,
    },
    {
      id: "gate",
      label: "--max-tokens",
      command: "agentdiet --max-tokens 4000",
      blurb: "The CI gate. Exit code 1 when the always-on tax outgrows the budget, so it can only shrink on purpose.",
      body: (
        <div>
          <div style={{ color: "#e4e4e7" }}>
            {"agentdiet: 6770 always-on tokens exceeds budget of 4000"}
          </div>
          <div style={{ color: "#f87171" }}>{"exit 1"}</div>
        </div>
      ),
    },
    {
      id: "badge",
      label: "--badge",
      command: "agentdiet --badge > badge.json",
      blurb: "A shields.io endpoint document. Publish it to a gist and the badge updates itself on every push.",
      body: <Jsonish text={badgeOutput} />,
    },
  ];

  const activeCmd = commands.find((c) => c.id === active) ?? commands[0]!;

  return (
    <section id="developer-experience" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-20 sm:px-8 sm:py-24">
        <SectionHeading
          index="05"
          kicker="Developer experience"
          title="Install once. Read it in a second."
          lede="No config file to write, no account to create, no daemon to keep alive. The whole interface is a command with six flags and three exit codes."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)] lg:gap-8">
          <div
            role="tablist"
            aria-label="CLI commands"
            aria-orientation="vertical"
            className="flex flex-col gap-1"
          >
            {commands.map((c) => {
              const selected = c.id === active;
              return (
                <button
                  key={c.id}
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`cmd-panel-${c.id}`}
                  id={`cmd-tab-${c.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(c.id)}
                  onKeyDown={(e) => {
                    const i = commands.findIndex((x) => x.id === active);
                    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                      e.preventDefault();
                      const n = commands[(i + 1) % commands.length]!;
                      setActive(n.id);
                      document.getElementById(`cmd-tab-${n.id}`)?.focus();
                    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                      e.preventDefault();
                      const n =
                        commands[(i - 1 + commands.length) % commands.length]!;
                      setActive(n.id);
                      document.getElementById(`cmd-tab-${n.id}`)?.focus();
                    }
                  }}
                  className={`rounded-md border px-3 py-2.5 text-left transition-colors ${
                    selected
                      ? "border-line-strong bg-elevated text-fg"
                      : "border-transparent text-muted hover:bg-elevated/50 hover:text-fg"
                  }`}
                >
                  <span className="flex items-center gap-2 font-mono text-[11.5px]">
                    <span className={selected ? "text-accent" : "text-faint"}>
                      $
                    </span>
                    <span className="truncate">{c.label}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="min-w-0">
            <div
              role="tabpanel"
              id={`cmd-panel-${activeCmd.id}`}
              aria-labelledby={`cmd-tab-${activeCmd.id}`}
              key={activeCmd.id}
              className="animate-[rise_0.35s_cubic-bezier(0.22,1,0.36,1)]"
            >
              <Terminal
                title={<span className="text-zinc-400">bash — {activeCmd.command}</span>}
                copyValue={activeCmd.command}
                copyLabel={`${activeCmd.label} command`}
              >
                <div style={{ color: "#5b5b64" }}>{"$ "}{activeCmd.command}</div>
                <div className="mt-1.5">{activeCmd.body}</div>
              </Terminal>
            </div>
            <p className="mt-3 max-w-[64ch] text-[12.5px] leading-[1.6] text-muted">
              {activeCmd.blurb}
            </p>
          </div>
        </div>

        <div className="mt-14 overflow-hidden rounded-lg border border-line">
          <div className="hidden grid-cols-[180px_120px_1fr] gap-4 border-b border-line bg-elevated/40 px-4 py-2.5 md:grid">
            <span className="eyebrow">Flag</span>
            <span className="eyebrow">Default</span>
            <span className="eyebrow">Meaning</span>
          </div>
          {flags.map((f) => (
            <div
              key={f.flag}
              className="grid gap-1 border-b border-line px-4 py-3 last:border-b-0 md:grid-cols-[180px_120px_1fr] md:items-baseline md:gap-4"
            >
              <code className="font-mono text-[12px] text-fg">{f.flag}</code>
              <code className="font-mono text-[11.5px] text-faint">{f.default}</code>
              <span className="text-[12.5px] leading-[1.55] text-muted">
                {f.meaning}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 font-mono text-[10.5px] text-faint">
          identical to `agentdiet --help`, which the binary prints itself.
        </p>
      </div>
    </section>
  );
}

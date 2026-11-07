import type { ReactNode } from "react";
import { CopyButton } from "@/components/copy-button";

/* Terminals stay dark in both themes: a light "terminal" reads as a mockup. The
   palette is therefore fixed rather than token-driven. */

const C = {
  bg: "#0a0b0c",
  bar: "rgba(255,255,255,0.028)",
  border: "rgba(255,255,255,0.09)",
  fg: "#e4e4e7",
  body: "#c9c9cf",
  dim: "#7c7c86",
  faint: "#5b5b64",
  accent: "#3ddc97",
  amber: "#f5c451",
  orange: "#fb923c",
  red: "#f87171",
};

export function Terminal({
  title,
  children,
  copyValue,
  copyLabel,
  className = "",
  footnote,
}: {
  title: ReactNode;
  children: ReactNode;
  copyValue?: string;
  copyLabel?: string;
  className?: string;
  footnote?: ReactNode;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[12px] border shadow-[0_20px_60px_-30px_rgba(0,0,0,0.7)] ${className}`}
      style={{ background: C.bg, borderColor: C.border }}
    >
      <div
        className="flex items-center gap-3 border-b px-3 py-2"
        style={{ background: C.bar, borderColor: C.border }}
      >
        <div className="flex items-center gap-[6px]" aria-hidden="true">
          <span className="size-[9px] rounded-full bg-[#ff5f57]/70" />
          <span className="size-[9px] rounded-full bg-[#febc2e]/70" />
          <span className="size-[9px] rounded-full bg-[#28c840]/70" />
        </div>
        <div
          className="min-w-0 flex-1 truncate text-center font-mono text-[11px]"
          style={{ color: C.dim }}
        >
          {title}
        </div>
        {copyValue ? (
          <CopyButton
            value={copyValue}
            label={copyLabel ?? "terminal output"}
            className="shrink-0 hover:bg-white/5"
          />
        ) : (
          <span className="w-6" aria-hidden="true" />
        )}
      </div>
      <div className="scroll-thin overflow-x-auto">
        <div className="min-w-max px-4 py-3.5 font-mono text-[11.5px] leading-[1.75] sm:text-[12px]">
          {children}
        </div>
      </div>
      {footnote ? (
        <div
          className="border-t px-4 py-2 font-mono text-[10.5px]"
          style={{ borderColor: C.border, color: C.faint }}
        >
          {footnote}
        </div>
      ) : null}
    </div>
  );
}

const TIER = /^(ALWAYS-ON|SCOPED|ON-DEMAND|CONFIG)(\s{3,})(.*)$/;
const TOTAL = /^(TOTAL|GRADE|COST)(\s{2,})(.*)$/;
const ROW = /^(\s*)([\d,—+k.]+)(\s{2,})(.*)$/;

function gradeColor(grade: string) {
  switch (grade) {
    case "A":
    case "B":
      return C.accent;
    case "C":
      return C.amber;
    case "D":
      return C.orange;
    case "F":
      return C.red;
    default:
      return C.fg;
  }
}

function Row({
  label,
  sep,
  rest,
  labelColor = C.fg,
  restColor = C.body,
}: {
  label: string;
  sep: string;
  rest: string;
  labelColor?: string;
  restColor?: string;
}) {
  return (
    <div>
      <span style={{ color: labelColor }}>{label}</span>
      <span>{sep}</span>
      <span style={{ color: restColor }}>{rest}</span>
    </div>
  );
}

/** Renders the text report verbatim, with the label column picked out. */
export function Report({ output }: { output: string }) {
  const lines = output.split("\n");

  return (
    <>
      {lines.map((line, i) => {
        const key = `${i}-${line.slice(0, 12)}`;

        if (line.trim() === "") {
          return <div key={key} style={{ height: "0.85em" }} aria-hidden="true" />;
        }

        if (line.startsWith("estimator:")) {
          return (
            <div key={key} style={{ color: C.faint }} className="text-[10.5px]">
              {line}
            </div>
          );
        }

        const tier = line.match(TIER);
        if (tier) {
          const label = tier[1] ?? "";
          const sep = tier[2] ?? "";
          const rest = tier[3] ?? "";
          return (
            <div key={key} className="mt-1">
              <span
                style={{ color: C.fg }}
                className="text-[10.5px] tracking-[0.08em]"
              >
                {label}
              </span>
              <span>{sep}</span>
              <span style={{ color: C.faint }} className="text-[10.5px]">
                {rest}
              </span>
            </div>
          );
        }

        const total = line.match(TOTAL);
        if (total) {
          const label = total[1] ?? "";
          const sep = total[2] ?? "";
          const rest = total[3] ?? "";
          if (label === "GRADE") {
            const [, letter, tail] = rest.match(/^(\S)(.*)$/) ?? [
              "",
              rest,
              "",
            ];
            return (
              <div key={key}>
                <span style={{ color: C.dim }}>{label}</span>
                <span>{sep}</span>
                <span
                  style={{ color: gradeColor(letter ?? "") }}
                  className="font-medium"
                >
                  {letter}
                </span>
                <span style={{ color: C.body }}>{tail}</span>
              </div>
            );
          }
          return (
            <Row
              key={key}
              label={label}
              sep={sep}
              rest={rest}
              labelColor={C.dim}
              restColor={label === "TOTAL" ? C.fg : C.body}
            />
          );
        }

        if (line === "FINDINGS") {
          return (
            <div
              key={key}
              className="mt-1 text-[10.5px] tracking-[0.08em]"
              style={{ color: C.dim }}
            >
              {line}
            </div>
          );
        }

        if (line.startsWith("  · ")) {
          return (
            <div key={key}>
              <span style={{ color: C.amber }}>{"  · "}</span>
              <span style={{ color: C.body }}>{line.slice(4)}</span>
            </div>
          );
        }

        if (line.startsWith("    → ")) {
          return (
            <div key={key}>
              <span style={{ color: C.faint }}>{"    → "}</span>
              <span style={{ color: C.accent }} className="opacity-80">
                {line.slice(6)}
              </span>
            </div>
          );
        }

        if (line.startsWith("--json")) {
          return (
            <div key={key} className="mt-1 text-[10.5px]" style={{ color: C.faint }}>
              {line}
            </div>
          );
        }

        const row = line.match(ROW);
        if (row) {
          const pad = row[1] ?? "";
          const num = row[2] ?? "";
          const sep = row[3] ?? "";
          const rest = row[4] ?? "";
          return (
            <div key={key}>
              <span>{pad}</span>
              <span style={{ color: C.body }}>{num}</span>
              <span>{sep}</span>
              <span style={{ color: C.dim }}>{rest}</span>
            </div>
          );
        }

        return (
          <div key={key} style={{ color: C.body }}>
            {line}
          </div>
        );
      })}
    </>
  );
}

/** A shell prompt line plus its output block. */
export function ShellLine({ command }: { command: string }) {
  return (
    <div className="flex items-start gap-2">
      <span style={{ color: C.accent }} aria-hidden="true">
        $
      </span>
      <span style={{ color: C.fg }}>{command}</span>
      <span className="caret" aria-hidden="true" />
    </div>
  );
}

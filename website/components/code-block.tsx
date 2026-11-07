import type { ReactNode } from "react";
import { CopyButton } from "@/components/copy-button";

type Props = {
  code: string;
  /** Shown in the block's header; omit for a bare block. */
  title?: string;
  lang?: string;
  copyLabel?: string;
  /** Substrings whose lines get an accent marker and brighter text. */
  highlight?: string[];
  className?: string;
  footnote?: ReactNode;
};

/**
 * Minimal, theme-aware code surface. Deliberately not syntax-highlighted beyond
 * comments: a full token theme on a marketing page competes with the copy, and
 * half the audience reads YAML faster in one colour anyway.
 */
export function CodeBlock({
  code,
  title,
  lang,
  copyLabel,
  highlight = [],
  className = "",
  footnote,
}: Props) {
  const lines = code.replace(/\n$/, "").split("\n");

  return (
    <figure
      className={`overflow-hidden rounded-[10px] border border-line bg-surface ${className}`}
    >
      {(title || lang) && (
        <figcaption className="flex items-center justify-between gap-3 border-b border-line bg-elevated/50 px-3 py-2">
          <span className="truncate font-mono text-[11px] text-faint">
            {title ?? lang}
          </span>
          <CopyButton value={code} label={copyLabel ?? title ?? "code"} />
        </figcaption>
      )}
      <div className="scroll-thin overflow-x-auto">
        <pre className="px-4 py-3.5 font-mono text-[11.5px] leading-[1.7] sm:text-[12.5px]">
          <code>
            {lines.map((line, i) => {
              const isComment = /^\s*(#|\/\/)/.test(line);
              const isHot = highlight.some(
                (h) => h.length > 0 && line.includes(h),
              );
              return (
                <div
                  key={`${i}-${line.slice(0, 10)}`}
                  className={
                    isHot
                      ? "relative -mx-4 border-l-2 border-accent bg-accent/[0.06] px-4 pl-[14px] text-fg"
                      : isComment
                        ? "text-faint"
                        : "text-fg/85"
                  }
                >
                  {line || "\u00A0"}
                </div>
              );
            })}
          </code>
        </pre>
      </div>
      {footnote ? (
        <div className="border-t border-line px-4 py-2 text-[11.5px] text-faint">
          {footnote}
        </div>
      ) : null}
    </figure>
  );
}

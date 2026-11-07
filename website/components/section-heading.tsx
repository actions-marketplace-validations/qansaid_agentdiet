import type { ReactNode } from "react";

type Props = {
  index: string;
  kicker: string;
  title: ReactNode;
  lede?: ReactNode;
  aside?: ReactNode;
  id?: string;
};

export function SectionHeading({
  index,
  kicker,
  title,
  lede,
  aside,
  id,
}: Props) {
  return (
    <header className="grid gap-8 border-t border-line pt-8 md:grid-cols-[minmax(0,1fr)_auto] md:items-end md:gap-12">
      <div id={id}>
        <div className="mb-5 flex items-center gap-3">
          <span className="font-mono text-[11px] tabular-nums text-accent">
            {index}
          </span>
          <span className="h-px w-5 bg-line-strong" aria-hidden="true" />
          <span className="eyebrow">{kicker}</span>
        </div>
        <h2 className="max-w-[22ch] text-[clamp(1.7rem,3.3vw,2.45rem)] leading-[1.08] font-semibold tracking-[-0.028em]">
          {title}
        </h2>
        {lede ? (
          <p className="mt-5 max-w-[62ch] text-[15px] leading-[1.65] text-muted">
            {lede}
          </p>
        ) : null}
      </div>
      {aside ? <div className="md:pb-1">{aside}</div> : null}
    </header>
  );
}

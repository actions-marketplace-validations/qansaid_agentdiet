export const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-md text-[13.5px] font-medium transition-all duration-150 select-none disabled:opacity-50 disabled:pointer-events-none";

export const buttonPrimary = `${buttonBase} h-10 px-4 bg-accent text-accent-ink shadow-[inset_0_1px_0_0_rgba(255,255,255,0.25),0_1px_2px_rgba(0,0,0,0.25)] hover:brightness-[1.06] active:brightness-95`;

export const buttonSecondary = `${buttonBase} h-10 px-4 border border-line-strong bg-surface/60 text-fg hover:bg-elevated hover:border-line-strong`;

export const buttonGhost = `${buttonBase} h-9 px-3 text-muted hover:text-fg hover:bg-elevated`;

export const linkInline =
  "underline decoration-line-strong decoration-1 underline-offset-[3px] transition-colors hover:decoration-accent";

export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

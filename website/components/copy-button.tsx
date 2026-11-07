"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";

type Props = {
  value: string;
  /** Accessible description of what gets copied, e.g. "install command". */
  label: string;
  className?: string;
  /** Rendered inside the button after the icon, for wide variants. */
  text?: string;
};

async function writeClipboard(value: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // fall through to the legacy path: permissions can be denied even on https
  }
  try {
    const area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.top = "-1000px";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

export function CopyButton({ value, label, className = "", text }: Props) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const onClick = useCallback(async () => {
    const ok = await writeClipboard(value);
    setState(ok ? "copied" : "failed");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setState("idle"), 1800);
  }, [value]);

  const copied = state === "copied";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={copied ? `Copied ${label}` : `Copy ${label}`}
      className={`group inline-flex min-h-[26px] min-w-[28px] items-center justify-center gap-1.5 rounded-[5px] px-2 py-1 font-mono text-[11px] text-faint transition-colors hover:bg-elevated hover:text-fg ${className}`}
    >
      {copied ? (
        <Check className="size-3.5 text-accent" aria-hidden="true" />
      ) : (
        <Copy className="size-3.5" aria-hidden="true" />
      )}
      {text ? <span>{copied ? "Copied" : text}</span> : null}
      <span aria-live="polite" className="sr-only">
        {copied ? `${label} copied to clipboard` : ""}
        {state === "failed" ? "Copy failed, select the text manually" : ""}
      </span>
    </button>
  );
}

"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from "react";

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Number that transitions between values on a requestAnimationFrame loop. The
 * server renders the real number, so the figure is present without JavaScript;
 * the transition only runs once the element is on screen, and a reduced-motion
 * preference skips it entirely.
 *
 * `format` must be stable (module scope) so the effect does not restart on
 * every render.
 */
export function Count({
  value,
  format,
  className,
  start = true,
  from = 0,
  duration = 0.9,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
  start?: boolean;
  from?: number;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const previous = useRef<number | null>(null);

  useIsoLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;

    const prior = previous.current;
    previous.current = value;

    if (
      !start ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      node.textContent = format(value);
      return;
    }

    const origin = prior ?? from;
    if (origin === value) {
      node.textContent = format(value);
      return;
    }

    node.textContent = format(origin);
    const startedAt = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / (duration * 1000));
      const current = origin + (value - origin) * easeOutCubic(progress);
      node.textContent = format(current);
      if (progress < 1) frame = window.requestAnimationFrame(tick);
    };

    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [value, start, from, duration, format]);

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}

/**
 * Arms the bars inside a section on mount and releases them when the section
 * reaches the viewport. The markup ships at its final widths, so without
 * JavaScript (and under reduced motion) the measurement is already visible;
 * JavaScript only opts the tracks into the transition.
 */
export function BarScale({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useIsoLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    node.dataset.bars = "pending";

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          node.dataset.bars = "on";
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.15 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

/** A single track bar. Width is a scale transform, so it stays on the GPU. */
export function Bar({
  to,
  delay = 0,
  tone = "var(--accent)",
  height = 6,
  className = "",
  label,
}: {
  /** Fraction of the track, 0–1. */
  to: number;
  delay?: number;
  tone?: string;
  height?: number;
  className?: string;
  label?: string;
}) {
  const clamped = Math.max(0, Math.min(1, to));
  return (
    <div
      className={`bar-track ${className}`}
      style={{ height }}
      role={label ? "img" : undefined}
      aria-label={label}
    >
      <span
        className="bar-fill"
        style={
          {
            "--to": clamped,
            "--delay": `${delay}ms`,
            background: tone,
          } as CSSProperties
        }
      />
    </div>
  );
}

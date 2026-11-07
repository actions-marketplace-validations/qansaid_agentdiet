"use client";

import { useEffect, useRef, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Stagger in milliseconds, applied through a CSS custom property. */
  delay?: number;
  className?: string;
};

/**
 * One-shot entrance animation, driven by a direct DOM attribute rather than
 * component state: nothing here needs a re-render, and the markup ships visible
 * so no-JS and reduced-motion readers always see the content.
 */
export function Reveal({ children, delay = 0, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const show = () => {
      node.dataset.visible = "true";
    };

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) {
      show();
      return;
    }

    // Already on screen at mount: reveal without a transition.
    if (node.getBoundingClientRect().top < window.innerHeight * 0.92) {
      show();
      return;
    }

    node.classList.add("reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            show();
            observer.disconnect();
          }
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.05 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{ "--reveal-delay": `${delay}ms` } as React.CSSProperties}
    >
      {children}
    </div>
  );
}

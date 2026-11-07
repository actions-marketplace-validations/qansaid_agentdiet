"use client";

import { useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

const STORAGE_KEY = "agentdiet-theme";

/**
 * Dark is the default. The inline script in app/layout.tsx applies a stored
 * light preference before first paint, so this button only has to flip the
 * class and remember the choice.
 */
export function ThemeToggle() {
  // Unknown until the first click: reading the DOM during render would differ
  // between server and client. The label is generic until then.
  const [theme, setTheme] = useState<Theme | null>(null);

  function toggle() {
    const isDark = document.documentElement.classList.contains("dark");
    const next: Theme = isDark ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    setTheme(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // private mode: the toggle still works for this page view
    }
  }

  const label =
    theme === null
      ? "Toggle color theme"
      : `Switch to ${theme === "dark" ? "light" : "dark"} theme`;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className="inline-flex size-9 items-center justify-center rounded-md border border-line text-muted transition-colors hover:border-line-strong hover:text-fg"
    >
      <Sun
        className="hidden size-[15px] dark:block"
        aria-hidden="true"
        strokeWidth={1.8}
      />
      <Moon
        className="block size-[15px] dark:hidden"
        aria-hidden="true"
        strokeWidth={1.8}
      />
    </button>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo, GitHubMark } from "@/components/marks";
import { ThemeToggle } from "@/components/theme-toggle";
import { nav, links, installCommand } from "@/lib/site";
import { CopyButton } from "@/components/copy-button";

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-[1180px] items-center gap-4 px-5 sm:px-8">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 py-1"
          aria-label="AgentDiet home"
        >
          <Logo className="size-[17px] text-fg" />
          <span className="text-[14.5px] font-semibold tracking-[-0.015em]">
            AgentDiet
          </span>
        </Link>

        <nav
          aria-label="Main"
          className="mx-auto hidden items-center gap-0.5 md:flex"
        >
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-2.5 py-1.5 text-[13px] text-muted transition-colors hover:bg-elevated hover:text-fg"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <ThemeToggle />
          <a
            href={links.repo}
            target="_blank"
            rel="noreferrer noopener"
            className="hidden h-9 items-center gap-2 rounded-md border border-line px-3 text-[13px] text-muted transition-colors hover:border-line-strong hover:text-fg sm:inline-flex"
          >
            <GitHubMark className="size-[14px]" />
            <span>GitHub</span>
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="inline-flex size-9 items-center justify-center rounded-md border border-line text-muted md:hidden"
          >
            {open ? (
              <X className="size-4" aria-hidden="true" />
            ) : (
              <Menu className="size-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-line bg-bg md:hidden"
      >
        <nav aria-label="Mobile" className="mx-auto max-w-[1180px] px-5 py-3">
          <ul className="flex flex-col">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-md px-2 py-2.5 text-[14px] text-muted hover:bg-elevated hover:text-fg"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={links.repo}
                target="_blank"
                rel="noreferrer noopener"
                className="block rounded-md px-2 py-2.5 text-[14px] text-muted hover:bg-elevated hover:text-fg"
              >
                GitHub repository
              </a>
            </li>
          </ul>
          <div className="mt-2 flex items-center justify-between gap-3 rounded-md border border-line bg-surface px-3 py-2">
            <code className="truncate font-mono text-[11.5px] text-muted">
              {installCommand}
            </code>
            <CopyButton value={installCommand} label="install command" />
          </div>
        </nav>
      </div>
    </header>
  );
}

import Link from "next/link";
import { Logo, GitHubMark } from "@/components/marks";
import { links, site } from "@/lib/site";

const columns = [
  {
    title: "Product",
    items: [
      { label: "The problem", href: "/#problem" },
      { label: "Capabilities", href: "/#capabilities" },
      { label: "How it works", href: "/#how-it-works" },
      { label: "Example", href: "/#example" },
      { label: "FAQ", href: "/#faq" },
    ],
  },
  {
    title: "Documentation",
    items: [
      { label: "Quickstart", href: "/docs#quickstart" },
      { label: "CLI reference", href: "/docs#cli" },
      { label: "Detected files", href: "/docs#files" },
      { label: "CI integration", href: "/docs#ci" },
    ],
  },
  {
    title: "Project",
    items: [
      { label: "Repository", href: links.repo, external: true },
      { label: "Releases", href: links.releases, external: true },
      { label: "Issues", href: links.issues, external: true },
      { label: "Discussions", href: links.discussions, external: true },
      { label: "Contributing", href: links.contributing, external: true },
      { label: "License", href: links.license, external: true },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-14 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5">
              <Logo className="size-[17px] text-fg" />
              <span className="text-[14.5px] font-semibold tracking-[-0.015em]">
                AgentDiet
              </span>
            </Link>
            <p className="mt-4 max-w-[34ch] text-[13px] leading-[1.65] text-muted">
              {site.tagline} An open-source tool for measuring the context your AI
              coding agent loads before you type.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a
                href={links.repo}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex h-8 items-center gap-2 rounded-md border border-line px-2.5 text-[12px] text-muted transition-colors hover:border-line-strong hover:text-fg"
              >
                <GitHubMark className="size-[13px]" />
                qansaid/agentdiet
              </a>
              <span className="rounded-md border border-line px-2 py-1.5 font-mono text-[11px] text-faint">
                {site.license}
              </span>
            </div>
          </div>

          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="eyebrow mb-4">{col.title}</p>
              <ul className="flex flex-col gap-2.5">
                {col.items.map((item) =>
                  "external" in item && item.external ? (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-[13px] text-muted transition-colors hover:text-fg"
                      >
                        {item.label}
                      </a>
                    </li>
                  ) : (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="text-[13px] text-muted transition-colors hover:text-fg"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-faint">
            MIT licensed. Maintained by{" "}
            <a
              href={links.org}
              target="_blank"
              rel="noreferrer noopener"
              className="text-muted underline decoration-line-strong underline-offset-2 hover:text-fg hover:decoration-accent"
            >
              Qansa
            </a>
            . AgentDiet is an independent open-source project and is not
            affiliated with Anthropic, OpenAI, Google, Microsoft or Cursor.
          </p>
          <p className="font-mono text-[11px] text-faint">
            {site.tagline}
          </p>
        </div>
      </div>
    </footer>
  );
}

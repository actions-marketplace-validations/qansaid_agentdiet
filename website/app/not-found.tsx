import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonPrimary, buttonSecondary } from "@/lib/ui";
import { links } from "@/lib/site";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-[1180px] flex-col justify-center px-5 py-24 sm:px-8">
      <p className="eyebrow mb-4">404</p>
      <h1 className="max-w-[20ch] text-[clamp(1.8rem,3.6vw,2.5rem)] leading-[1.08] font-semibold tracking-[-0.03em]">
        That page is not on the menu.
      </h1>
      <p className="mt-4 max-w-[52ch] text-[14px] leading-[1.65] text-muted">
        The link may be stale, or the page may have moved. The documentation and
        the repository are both one click away.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className={buttonPrimary}>
          Back to overview
        </Link>
        <Link href="/docs" className={buttonSecondary}>
          Documentation
          <ArrowRight className="size-[15px]" aria-hidden="true" />
        </Link>
        <a
          href={links.repo}
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex h-10 items-center px-2 text-[13px] text-muted underline decoration-line-strong underline-offset-4 hover:text-fg hover:decoration-accent"
        >
          GitHub repository
        </a>
      </div>
    </div>
  );
}

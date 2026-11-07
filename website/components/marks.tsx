import type { SVGProps } from "react";

/**
 * The mark is three instruction lines with the fat trimmed off: what is left is
 * the lean context. The shortest bar carries the accent so the mark reads as a
 * result, not as a hamburger menu.
 */
export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <rect x="2.5" y="5" width="19" height="2.6" rx="1.3" fill="currentColor" />
      <rect
        x="2.5"
        y="10.7"
        width="13"
        height="2.6"
        rx="1.3"
        fill="currentColor"
        opacity="0.55"
      />
      <rect
        x="2.5"
        y="16.4"
        width="6.5"
        height="2.6"
        rx="1.3"
        fill="var(--accent)"
      />
    </svg>
  );
}

export function GitHubMark({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M12 .5C5.73.5.9 5.48.9 11.62c0 4.91 3.29 9.07 7.86 10.54.57.1.78-.24.78-.54 0-.27-.01-1.16-.02-2.1-3.2.68-3.88-1.33-3.88-1.33-.52-1.3-1.28-1.65-1.28-1.65-1.05-.7.08-.69.08-.69 1.16.08 1.77 1.17 1.77 1.17 1.03 1.72 2.7 1.22 3.36.93.1-.73.4-1.22.73-1.5-2.55-.28-5.24-1.25-5.24-5.57 0-1.23.45-2.24 1.19-3.03-.12-.28-.52-1.43.11-2.98 0 0 .97-.3 3.18 1.16a11.3 11.3 0 0 1 5.79 0c2.2-1.46 3.17-1.16 3.17-1.16.63 1.55.23 2.7.11 2.98.74.79 1.19 1.8 1.19 3.03 0 4.33-2.7 5.29-5.26 5.56.41.35.78 1.03.78 2.08 0 1.5-.01 2.71-.01 3.08 0 .3.2.65.79.54 4.56-1.48 7.85-5.63 7.85-10.54C23.1 5.48 18.27.5 12 .5Z" />
    </svg>
  );
}

import { SectionHeading } from "@/components/section-heading";
import { faq, links } from "@/lib/site";

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-[1180px] px-5 py-20 sm:px-8 sm:py-24">
        <SectionHeading
          index="08"
          kicker="FAQ"
          title="Questions developers actually ask"
          lede="Answers describe what the code does today. Where the tool is approximate, it says so."
        />

        <div className="mt-12 grid gap-x-12 lg:grid-cols-[minmax(0,0.4fr)_minmax(0,1fr)]">
          <div className="mb-6 lg:mb-0">
            <p className="max-w-[30ch] text-[12.5px] leading-[1.65] text-muted">
              Something missing? Open a discussion. The question that is asked
              twice becomes a section here.
            </p>
            <a
              href={links.discussions}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] text-fg underline decoration-line-strong underline-offset-4 hover:decoration-accent"
            >
              Ask on GitHub
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <div className="border-t border-line">
            {faq.map((item) => (
              <details key={item.q} className="group border-b border-line">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-4 text-[13.5px] font-medium text-fg transition-colors hover:text-accent [&::-webkit-details-marker]:hidden">
                  <span>{item.q}</span>
                  <span
                    aria-hidden="true"
                    className="faq-toggle relative size-3.5 shrink-0 text-faint"
                  >
                    <span className="absolute top-1/2 left-0 h-px w-full -translate-y-1/2 bg-current" />
                    <span className="absolute top-0 left-1/2 h-full w-px -translate-x-1/2 bg-current" />
                  </span>
                </summary>
                <div className="max-w-[72ch] pb-5 text-[13px] leading-[1.7] text-muted">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

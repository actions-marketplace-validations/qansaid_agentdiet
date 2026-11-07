import type { Metadata } from "next";
import { Hero } from "@/components/hero";
import { Problem } from "@/components/problem";
import { Solution } from "@/components/solution";
import { HowItWorks } from "@/components/how-it-works";
import { Example } from "@/components/example";
import { DeveloperExperience } from "@/components/developer-experience";
import { GithubIntegration } from "@/components/github-integration";
import { OpenSource } from "@/components/open-source";
import { Faq } from "@/components/faq";
import { FinalCta } from "@/components/final-cta";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const agents = [
  "Claude Code",
  "Codex",
  "Cursor",
  "Gemini CLI",
  "GitHub Copilot",
  "Windsurf",
  "Cline",
  "Goose",
  "Jules",
  "Roo Code",
  "Continue",
];

function SupportedStrip() {
  return (
    <div className="border-y border-line bg-surface/30">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-3 px-5 py-5 sm:flex-row sm:items-center sm:gap-8 sm:px-8">
        <p className="eyebrow shrink-0">Reads the files loaded by</p>
        <ul className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {agents.map((agent) => (
            <li
              key={agent}
              className="font-mono text-[11px] tracking-[-0.01em] text-muted"
            >
              {agent}
            </li>
          ))}
        </ul>
        <p className="font-mono text-[10px] text-faint sm:ml-auto">
          by file convention · no runtime integration
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <SupportedStrip />
      <Problem />
      <Solution />
      <HowItWorks />
      <Example />
      <DeveloperExperience />
      <GithubIntegration />
      <OpenSource />
      <Faq />
      <FinalCta />
    </>
  );
}

import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { site, links } from "@/lib/site";

const title = "AgentDiet: your AI agent deserves a leaner context";
const description = site.description;

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: title,
    template: `%s · ${site.name}`,
  },
  description,
  applicationName: site.name,
  authors: [{ name: site.org, url: links.org }],
  creator: site.org,
  publisher: site.org,
  keywords: [
    "AI coding agent",
    "context window",
    "token budget",
    "AGENTS.md",
    "CLAUDE.md",
    "cursorrules",
    "MCP servers",
    "developer tooling",
    "Go CLI",
    "open source",
    "AgentDiet",
    "Qansa",
  ],
  alternates: { canonical: "/" },
  category: "technology",
  openGraph: {
    type: "website",
    url: site.url,
    siteName: site.name,
    title,
    description,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#08090a" },
    { media: "(prefers-color-scheme: light)", color: "#fcfcfb" },
  ],
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
};

const themeScript = `(function(){try{var t=localStorage.getItem("agentdiet-theme");if(t==="light"){document.documentElement.classList.remove("dark")}}catch(e){}})();`;

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "AgentDiet",
  applicationCategory: "DeveloperApplication",
  applicationSubCategory: "AI coding agent tooling",
  operatingSystem: "Linux, macOS, Windows",
  description:
    "A static Go binary that measures the context an AI coding agent loads on every request: always-on instruction files, duplicated rules, oversize files and declared MCP tool surface, and enforces a token budget in CI.",
  url: site.url,
  downloadUrl: links.releases,
  codeRepository: links.repo,
  license: links.license,
  programmingLanguage: "Go",
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  author: {
    "@type": "Organization",
    name: "Qansa",
    url: links.org,
  },
  maintainer: {
    "@type": "Organization",
    name: "Qansa",
    url: links.org,
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`dark ${GeistSans.variable} ${GeistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          // Runs before paint so a stored light preference never flashes dark.
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-dvh bg-bg text-fg antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-[13px] focus:font-medium focus:text-accent-ink"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

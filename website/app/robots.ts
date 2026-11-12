import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

// Static export cannot run a request-time handler, so this route is emitted at
// build time.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${site.url}/sitemap.xml`,
    host: new URL(site.url).host,
  };
}

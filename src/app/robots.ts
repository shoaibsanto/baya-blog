import type { MetadataRoute } from "next";
import { SITE } from "@/config/site.config";

/**
 * RULE 26: Robots — SEO-critical pages not blocked.
 * RULE 59: Duplicate URL protection — disallow filtered variants.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/search",      // RULE 59: search results not indexable
        "/api/",        // internal API routes
      ],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}

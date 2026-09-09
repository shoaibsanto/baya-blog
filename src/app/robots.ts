import type { MetadataRoute } from "next";
import { SITE } from "@/config/site.config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/search"],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}

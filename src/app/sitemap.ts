import type { MetadataRoute } from "next";
import { SITE, HUBS } from "@/config/site.config";
import { SAMPLE_ARTICLES } from "@/content/sample-articles";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, changeFrequency: "daily", priority: 1 },
    ...HUBS.map((hub) => ({
      url: `${SITE.url}/${hub.slug}/`,
      changeFrequency: "daily" as const,
      priority: 0.8,
    })),
  ];

  const articleEntries: MetadataRoute.Sitemap = SAMPLE_ARTICLES.map((article) => ({
    url: `${SITE.url}/${article.hub}/${article.slug}/`,
    lastModified: article.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticEntries, ...articleEntries];
}

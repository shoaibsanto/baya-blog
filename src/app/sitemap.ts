import type { MetadataRoute } from "next";
import { SITE, CATEGORIES } from "@/config/site.config";
import { ALL_ARTICLES } from "@/content/articles";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, changeFrequency: "hourly", priority: 1 },
    ...CATEGORIES.map((cat) => ({
      url: `${SITE.url}/category/${cat.slug}/`,
      changeFrequency: "hourly" as const,
      priority: 0.8,
    })),
  ];

  const articleEntries: MetadataRoute.Sitemap = ALL_ARTICLES.map((article) => ({
    url: `${SITE.url}/${article.slug}/`,
    lastModified: article.updatedAt,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticEntries, ...articleEntries];
}

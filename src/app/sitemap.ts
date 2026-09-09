import type { MetadataRoute } from "next";
import { SITE, CATEGORIES } from "@/config/site.config";
import { SAMPLE_ARTICLES } from "@/content/sample-articles";
import { listOrganizations, listQualifications } from "@/lib/content/articles";

/**
 * RULE 27: Sitemap architecture — comprehensive sitemap.
 * RULE 28: Automatic sitemap update on publish.
 *
 * Includes: homepage, categories, organizations, qualifications,
 * articles, about, contact.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE.url}/about/`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE.url}/contact/`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${SITE.url}/organization/`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE.url}/qualification/`, changeFrequency: "weekly", priority: 0.6 },
    ...CATEGORIES.map((cat) => ({
      url: `${SITE.url}/category/${cat.slug}/`,
      changeFrequency: "hourly" as const,
      priority: 0.8,
    })),
  ];

  const orgEntries: MetadataRoute.Sitemap = listOrganizations().map((org) => ({
    url: `${SITE.url}/organization/${org.slug}/`,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const qualEntries: MetadataRoute.Sitemap = listQualifications()
    .filter((q) => q.articleCount >= 2)
    .map((q) => ({
      url: `${SITE.url}/qualification/${q.slug}/`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));

  const articleEntries: MetadataRoute.Sitemap = SAMPLE_ARTICLES.map((article) => ({
    url: `${SITE.url}/${article.slug}/`,
    lastModified: article.updatedAt,
    changeFrequency: "daily",
    priority: 0.7,
  }));

  return [...staticEntries, ...orgEntries, ...qualEntries, ...articleEntries];
}

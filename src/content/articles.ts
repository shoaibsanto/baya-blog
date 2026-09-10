import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import type { Article } from "@/types";

const JOBS_DIR = join(process.cwd(), "content-data", "jobs");

function loadAllArticles(): Article[] {
  const files = readdirSync(JOBS_DIR).filter((f) => f.endsWith(".json"));
  return files.map((file) => {
    const raw = readFileSync(join(JOBS_DIR, file), "utf-8");
    return JSON.parse(raw) as Article;
  });
}

/**
 * Loaded once per server process/build from content-data/jobs/*.json — one file per article.
 * New articles are added as new files (by the discovery pipeline or by hand), never by editing
 * a shared array, so automated commits never collide with manual edits.
 */
export const ALL_ARTICLES: Article[] = loadAllArticles();

export function getArticleBySlug(slug: string): Article | undefined {
  return ALL_ARTICLES.find((a) => a.slug === slug);
}

export function listArticlesByCategory(categorySlug: string): Article[] {
  return ALL_ARTICLES.filter(
    (a) => a.category === categorySlug || a.additionalCategories?.includes(categorySlug as never)
  );
}

export function listLatestArticles(limit = 20): Article[] {
  return [...ALL_ARTICLES].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1)).slice(0, limit);
}

export function listRelated(article: Article, limit = 4): Article[] {
  return ALL_ARTICLES.filter((a) => a.id !== article.id && a.primaryTopic === article.primaryTopic)
    .concat(ALL_ARTICLES.filter((a) => a.id !== article.id && a.category === article.category))
    .filter((a, i, arr) => arr.findIndex((x) => x.id === a.id) === i)
    .slice(0, limit);
}

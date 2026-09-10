import { ALL_ARTICLES } from "@/content/articles";
import { getDeadlineStatus } from "@/lib/content/articles";
import { getCategory } from "@/config/site.config";
import type { Article } from "@/types";

export interface JobContext {
  slug: string;
  url: string;
  title: string;
  category: string;
  organization?: string;
  deadline?: string;
  deadlineStatus: "closing_soon" | "active" | "expired" | "unknown";
  totalVacancy?: string;
  applicationFee?: string;
  educationRequirement?: string;
  excerpt: string;
}

const STOPWORDS = new Set([
  "the", "a", "an", "is", "are", "for", "in", "of", "to", "and", "or",
  "কি", "কী", "এর", "এবং", "আছে", "কোন", "কোনো", "চাই", "জানতে", "জানাও",
  "সম্পর্কে", "আমি", "আমার", "তথ্য", "কেমন", "করে", "করবো", "করব",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

function scoreArticle(article: Article, queryTokens: string[]): number {
  const category = getCategory(article.category);
  const haystack = [
    article.title,
    article.excerpt,
    category?.name ?? "",
    article.job?.organization.name ?? "",
    ...(article.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;
  for (const token of queryTokens) {
    if (haystack.includes(token)) score += 1;
  }
  return score;
}

function toJobContext(article: Article): JobContext {
  const category = getCategory(article.category);
  return {
    slug: article.slug,
    url: `https://baya.blog/${article.slug}`,
    title: article.title,
    category: category?.name ?? article.category,
    organization: article.job?.organization.name,
    deadline: article.job?.deadline,
    deadlineStatus: article.job?.deadline ? getDeadlineStatus(article.job.deadline) : "unknown",
    totalVacancy: article.job?.totalVacancy,
    applicationFee: article.job?.applicationFee,
    educationRequirement: article.job?.educationRequirement,
    excerpt: article.excerpt,
  };
}

/**
 * Keyword-overlap retrieval over the site's own job posts — this is what keeps the
 * chatbot grounded in real, published circulars instead of the model guessing at jobs.
 * No embeddings/vector DB: the corpus is small (tens to low hundreds of posts), so a
 * plain token-overlap score is enough and needs no extra infrastructure.
 */
export function findRelevantJobs(query: string, limit = 5): JobContext[] {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) {
    return ALL_ARTICLES.filter((a) => a.job && getDeadlineStatus(a.job.deadline) !== "expired")
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
      .slice(0, limit)
      .map(toJobContext);
  }

  return ALL_ARTICLES.map((article) => ({ article, score: scoreArticle(article, queryTokens) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ article }) => toJobContext(article));
}

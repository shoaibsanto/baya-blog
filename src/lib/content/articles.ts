/**
 * Data access layer for BAYA Blog articles.
 *
 * This module is the single entry point for all article queries.
 * Currently backed by sample data; swap to database/API when ready.
 *
 * RULE 62: Content source and frontend rendering must be separate.
 * Frontend never scrapes — pipeline normalizes data into this layer.
 */

import type { Article } from "@/types";
import type { CategorySlug } from "@/config/site.config";
import { SAMPLE_ARTICLES } from "@/content/sample-articles";
import { QUALIFICATIONS } from "@/config/site.config";

// ─── Helpers ────────────────────────────────────────────────────────────

function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86_400_000);
}

// ─── Queries ────────────────────────────────────────────────────────────

/** All published articles, sorted newest-first. */
export function listAllArticles(): Article[] {
  return [...SAMPLE_ARTICLES].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

/** Latest N articles. */
export function listLatestArticles(count: number): Article[] {
  return listAllArticles().slice(0, count);
}

/** Articles by a single category (including additionalCategories). */
export function listArticlesByCategory(slug: CategorySlug): Article[] {
  return listAllArticles().filter(
    (a) => a.category === slug || a.additionalCategories?.includes(slug),
  );
}

/** Article by exact slug. */
export function getArticleBySlug(slug: string): Article | undefined {
  return SAMPLE_ARTICLES.find((a) => a.slug === slug);
}

// ─── Organizations ──────────────────────────────────────────────────────

export interface OrganizationSummary {
  slug: string;
  name: string;
  articleCount: number;
  articles: Article[];
}

export function listOrganizations(): OrganizationSummary[] {
  const map = new Map<string, { name: string; articles: Article[] }>();

  for (const article of listAllArticles()) {
    const orgName = article.job?.organization.name;
    if (!orgName) continue;
    const slug = slugify(orgName);
    const entry = map.get(slug) ?? { name: orgName, articles: [] };
    entry.articles.push(article);
    map.set(slug, entry);
  }

  return Array.from(map.entries())
    .map(([slug, { name, articles }]) => ({ slug, name, articleCount: articles.length, articles }))
    .sort((a, b) => b.articleCount - a.articleCount);
}

export function getOrganizationBySlug(slug: string): OrganizationSummary | undefined {
  return listOrganizations().find((o) => o.slug === slug);
}

// ─── Qualifications ─────────────────────────────────────────────────────

export interface QualificationSummary {
  slug: string;
  label: string;
  articleCount: number;
  articles: Article[];
}

export function listQualifications(): QualificationSummary[] {
  const map = new Map<string, { label: string; articles: Article[] }>();

  for (const article of listAllArticles()) {
    const levels = article.job?.qualificationLevels ?? [];
    for (const level of levels) {
      const qual = QUALIFICATIONS.find((q) => q.value === level);
      if (!qual) continue;
      const entry = map.get(level) ?? { label: qual.label, articles: [] };
      entry.articles.push(article);
      map.set(level, entry);
    }
  }

  return Array.from(map.entries())
    .map(([slug, { label, articles }]) => ({ slug, label, articleCount: articles.length, articles }))
    .sort((a, b) => b.articleCount - a.articleCount);
}

export function getQualificationBySlug(slug: string): QualificationSummary | undefined {
  return listQualifications().find((q) => q.slug === slug);
}

// ─── Related articles ───────────────────────────────────────────────────

/**
 * Find related articles for a given article.
 * Priority: same org > same category > same qualification > same tags.
 *
 * RULE 14: Related content engine — match by org, category, qualification,
 * salary, location, experience, job type, deadline proximity, keywords.
 */
export function listRelated(article: Article, count = 6): Article[] {
  const all = listAllArticles().filter((a) => a.id !== article.id);

  const scored = all.map((a) => {
    let score = 0;
    if (a.job?.organization.name === article.job?.organization.name) score += 10;
    if (a.category === article.category) score += 5;
    const overlap = a.additionalCategories?.filter((c) =>
      article.additionalCategories?.includes(c),
    );
    if (overlap && overlap.length > 0) score += overlap.length * 2;
    const qualOverlap = a.job?.qualificationLevels?.filter((q) =>
      article.job?.qualificationLevels?.includes(q),
    );
    if (qualOverlap && qualOverlap.length > 0) score += qualOverlap.length * 2;
    const tagOverlap = a.tags?.filter((t) => article.tags?.includes(t));
    if (tagOverlap && tagOverlap.length > 0) score += tagOverlap.length;
    if (a.job?.deadline && article.job?.deadline) {
      const diffDays = Math.abs(
        (new Date(a.job.deadline).getTime() - new Date(article.job.deadline).getTime()) / 86_400_000,
      );
      if (diffDays <= 7) score += 2;
      else if (diffDays <= 30) score += 1;
    }
    return { article: a, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((s) => s.article);
}

// ─── Deadline intelligence ──────────────────────────────────────────────

/**
 * RULE 39: Deadline intelligence — classify jobs by deadline status.
 */
export type DeadlineStatus = "closing_soon" | "active" | "expired";

export function getDeadlineStatus(deadline: string): DeadlineStatus {
  const days = daysUntil(deadline);
  if (days < 0) return "expired";
  if (days <= 3) return "closing_soon";
  return "active";
}

// ─── Content status helpers ─────────────────────────────────────────────

/**
 * RULE 55: Content statuses.
 */
export type ContentStatus =
  | "discovered"
  | "verifying"
  | "verified"
  | "draft"
  | "quality_check"
  | "ready"
  | "published"
  | "updated"
  | "expired"
  | "archived"
  | "failed"
  | "review_required";

/**
 * RULE 56: Build statuses.
 */
export type BuildStatus = "generated" | "regeneration_pending" | "regenerated" | "generation_failed";

// ─── Internal link graph ────────────────────────────────────────────────

export interface LinkNode {
  slug: string;
  incomingLinks: string[];
  outgoingLinks: string[];
}

/**
 * RULE 11: Internal link graph — build the full bidirectional link map.
 * RULE 10: No orphan page policy — every article must have incoming links.
 */
export function buildLinkGraph(): LinkNode[] {
  const all = listAllArticles();
  const graph: LinkNode[] = all.map((a) => ({
    slug: a.slug,
    incomingLinks: [],
    outgoingLinks: [],
  }));

  const graphMap = new Map(graph.map((n) => [n.slug, n]));

  for (const article of all) {
    const node = graphMap.get(article.slug)!;
    const related = article.relatedArticles?.map((r) => r.slug) ?? listRelated(article).map((r) => r.slug);
    for (const target of related) {
      node.outgoingLinks.push(target);
      const targetNode = graphMap.get(target);
      if (targetNode) targetNode.incomingLinks.push(article.slug);
    }
  }

  return graph;
}

/**
 * RULE 93: Orphan detection — find articles with no incoming internal links.
 */
export function findOrphanArticles(): Article[] {
  const graph = buildLinkGraph();
  const orphanSlugs = graph.filter((n) => n.incomingLinks.length === 0).map((n) => n.slug);
  return orphanSlugs.map((s) => getArticleBySlug(s)!).filter(Boolean);
}

// ─── Slug helpers ───────────────────────────────────────────────────────

/** Map Bengali organization names to stable English slugs. */
const ORG_SLUG_MAP: Record<string, string> = {
  "বাংলাদেশ কৃষি ব্যাংক": "bangladesh-krishi-bank",
  "সোনালী ব্যাংক পিএলসি": "sonali-bank",
  "স্কয়ার গ্রুপ": "square-group",
  "ব্র্যাক": "brac",
  "রাজশাহী বিশ্ববিদ্যালয়": "rajshahi-university",
  "বাংলাদেশ ব্যাংক": "bangladesh-bank",
};

/** Convert Bengali org name to a stable URL slug. */
export function slugify(text: string): string {
  // Check explicit mapping first
  if (ORG_SLUG_MAP[text]) return ORG_SLUG_MAP[text];
  // Fall back to standard slugify for English text
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

import type { CategorySlug } from "@/config/site.config";

// Maps bdgovtjob.net's WordPress category slugs (discovery signal only) to our own
// CategorySlug taxonomy in src/config/site.config.ts. Categories not listed here are
// non-job content (assignments, admit cards, exam dates, notices, etc.) that this
// pipeline intentionally skips — the automation only ever republishes job-circular
// facts, never their editorial notices/assignments/admit-card posts.
const SOURCE_CATEGORY_TO_OURS: Record<string, CategorySlug> = {
  "government-jobs-circular": "government-jobs",
  "bank-jobs": "bank-jobs",
  "private-jobs": "private-jobs",
  "ngo-job-circular": "ngo-jobs",
  "pharmaceuticals-job-circular": "pharma-jobs",
  "group-of-company-job-circular": "group-of-company-jobs",
  "university-job-circular": "university-jobs",
  "defence-job-circular": "defence-jobs",
  "teletalk-application": "teletalk-application",
  "hot-jobs": "hot-jobs",
};

export interface MappedCategories {
  category: CategorySlug;
  additionalCategories?: CategorySlug[];
}

/**
 * Given the source post's category slugs, returns { category, additionalCategories }
 * in our taxonomy, or null if none of the source categories map to a job category
 * (i.e. this post should be skipped entirely — it's a notice/assignment/etc.).
 */
export function mapCategories(sourceCategorySlugs: string[]): MappedCategories | null {
  const mapped = sourceCategorySlugs
    .map((slug) => SOURCE_CATEGORY_TO_OURS[slug])
    .filter((c): c is CategorySlug => Boolean(c));

  if (mapped.length === 0) return null;

  const primary: CategorySlug = mapped.includes("government-jobs") ? "government-jobs" : mapped[0];
  const additional = [...new Set(mapped.filter((c) => c !== primary))];

  return { category: primary, additionalCategories: additional.length ? additional : undefined };
}

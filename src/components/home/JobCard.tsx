import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { DeadlineBadge } from "@/components/ui/DeadlineBadge";
import { getCategory } from "@/config/site.config";
import { formatBnDate, daysRemaining, toBnNumber } from "@/lib/format";
import { slugify } from "@/lib/content/articles";
import type { Article } from "@/types";

/**
 * Job card component for homepage and category listings.
 * RULE 18: Organization connectivity — links to org page.
 * RULE 39: Deadline intelligence — visual status badges.
 */
export function JobCard({ article }: { article: Article }) {
  const category = getCategory(article.category);
  const job = article.job;
  const remaining = job ? daysRemaining(job.deadline) : null;
  const orgSlug = job ? slugify(job.organization.name) : null;

  return (
    <article className="flex h-full flex-col rounded-md border border-border p-4 transition hover:border-brand">
      <div className="flex flex-wrap items-center gap-1.5">
        {category && <Badge>{category.shortName}</Badge>}
        {article.additionalCategories?.includes("hot-jobs") && (
          <Badge tone="muted">🔥 হট জব</Badge>
        )}
        {job?.deadline && <DeadlineBadge deadline={job.deadline} />}
        <time dateTime={article.updatedAt} className="ml-auto text-xs text-muted">
          {formatBnDate(article.updatedAt)}
        </time>
      </div>

      <h2 className="mt-2 text-base font-bold leading-snug text-foreground">
        <Link href={`/${article.slug}`} className="hover:text-brand-dark">
          {article.title}
        </Link>
      </h2>

      {job && (
        <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-3">
          <div>
            <dt className="text-muted">পদের ক্যাটাগরি</dt>
            <dd className="font-semibold text-foreground">{toBnNumber(job.positionCategoryCount)}</dd>
          </div>
          <div>
            <dt className="text-muted">পদসংখ্যা</dt>
            <dd className="font-semibold text-foreground">{toBnNumber(job.totalVacancy)}</dd>
          </div>
          <div>
            <dt className="text-muted">আবেদনের শেষ তারিখ</dt>
            <dd className="font-semibold text-foreground">{formatBnDate(job.deadline)}</dd>
          </div>
        </dl>
      )}

      {remaining && (
        <p className="mt-2 text-xs font-medium text-accent">{remaining}</p>
      )}

      {/* RULE 18: Organization connectivity — link to org page */}
      {orgSlug && job?.organization.name && (
        <Link
          href={`/organization/${orgSlug}`}
          className="mt-2 text-xs text-muted hover:text-brand-dark"
        >
          {job.organization.name}
        </Link>
      )}

      <Link
        href={`/${article.slug}`}
        className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-dark hover:underline"
      >
        বিস্তারিত পড়ুন →
      </Link>
    </article>
  );
}

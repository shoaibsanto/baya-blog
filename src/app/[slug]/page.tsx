import { notFound } from "next/navigation";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { TableOfContents } from "@/components/article/TableOfContents";
import { ArticleMeta } from "@/components/article/ArticleMeta";
import { FAQBlock } from "@/components/article/FAQBlock";
import { RelatedArticles } from "@/components/article/RelatedArticles";
import { ShareButtons } from "@/components/article/ShareButtons";
import { JobSummaryBox } from "@/components/article/JobSummaryBox";
import { JobSummaryTable } from "@/components/article/JobSummaryTable";
import { OrganizationInfoBox } from "@/components/article/OrganizationInfoBox";
import { PositionsTable } from "@/components/article/PositionsTable";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCategory } from "@/config/site.config";
import { getArticleBySlug, listRelated, SAMPLE_ARTICLES } from "@/content/sample-articles";
import { renderBlocks, extractHeadings } from "@/lib/render/renderBlocks";
import { generateArticleMetadata, generateCanonical } from "@/lib/seo/metadata";
import {
  generateArticleSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  generateJobPostingSchema,
} from "@/lib/seo/schema";

export const revalidate = 3600;

export function generateStaticParams() {
  return SAMPLE_ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};
  return generateArticleMetadata(article);
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const category = getCategory(article.category);
  const headings = extractHeadings(article.body);
  const related = article.relatedArticles?.length
    ? article.relatedArticles
    : listRelated(article).map((a) => ({ slug: a.slug, title: a.title }));
  const jobPostingSchema = generateJobPostingSchema(article);
  const canonicalUrl = generateCanonical(article.slug);

  return (
    <Container className="py-8">
      <JsonLd data={generateArticleSchema(article)} />
      {jobPostingSchema && <JsonLd data={jobPostingSchema} />}
      <JsonLd
        data={generateBreadcrumbSchema([
          { label: "হোম", href: "/" },
          ...(category ? [{ label: category.name, href: `/category/${category.slug}` }] : []),
          { label: article.title, href: `/${article.slug}` },
        ])}
      />
      {article.faq && article.faq.length > 0 && (
        <JsonLd data={generateFAQSchema(article.faq) as object} />
      )}

      <Breadcrumb
        items={[
          { label: "হোম", href: "/" },
          ...(category ? [{ label: category.name, href: `/category/${category.slug}` }] : []),
          { label: article.title },
        ]}
      />

      <article className="prose-baya mt-3">
        <div className="flex flex-wrap gap-1.5">
          {category && <Badge>{category.name}</Badge>}
        </div>

        <h1 className="mt-2 text-2xl font-extrabold leading-snug text-foreground sm:text-3xl">
          {article.title}
        </h1>
        <p className="mt-3 text-[0.98rem] leading-7 text-muted">{article.excerpt}</p>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <ArticleMeta
            author={article.author}
            updatedAt={article.updatedAt}
            lastVerifiedAt={article.lastVerifiedAt}
          />
          <ShareButtons url={canonicalUrl} title={article.title} />
        </div>

        {article.job && <JobSummaryBox job={article.job} />}

        {article.featuredImage && (
          <div className="relative mt-5 aspect-[1200/630] w-full overflow-hidden rounded-md">
            <Image
              src={article.featuredImage.src}
              alt={article.featuredImage.alt}
              fill
              sizes="(max-width: 768px) 100vw, 640px"
              className="object-cover"
              priority
            />
          </div>
        )}

        <TableOfContents headings={headings} />

        {article.job && (
          <>
            <h2 id="job-summary">এক নজরে {article.job.organization.name} নিয়োগ বিজ্ঞপ্তি</h2>
            <JobSummaryTable article={article} />
          </>
        )}

        {renderBlocksWithJobData(article)}

        {article.job?.requiredDocuments && article.job.requiredDocuments.length > 0 && (
          <>
            <h2 id="required-documents">প্রয়োজনীয় কাগজপত্র</h2>
            <ul className="my-5 list-disc space-y-1 pl-6">
              {article.job.requiredDocuments.map((doc) => (
                <li key={doc}>{doc}</li>
              ))}
            </ul>
          </>
        )}

        {article.job?.organization && (
          <>
            <h2 id="organization-info">প্রতিষ্ঠানের তথ্য</h2>
            <OrganizationInfoBox org={article.job.organization} />
          </>
        )}

        {article.faq && <FAQBlock items={article.faq} />}

        <div className="my-8">
          <ShareButtons url={canonicalUrl} title={article.title} />
        </div>

        <RelatedArticles items={related} />
      </article>
    </Container>
  );
}

/** Renders the free-form body blocks, inserting the positions table right after the "positions" heading when job data exists. */
function renderBlocksWithJobData(article: (typeof SAMPLE_ARTICLES)[number]) {
  const blocks = renderBlocks(article.body);
  if (!article.job?.positions?.length) return blocks;

  const positionsHeadingIndex = article.body.findIndex(
    (b) => b.type === "heading" && b.id === "positions"
  );
  if (positionsHeadingIndex === -1) return blocks;

  const withTable = [...blocks];
  withTable.splice(
    positionsHeadingIndex + 1,
    0,
    <PositionsTable key="positions-table" positions={article.job.positions} />
  );
  return withTable;
}

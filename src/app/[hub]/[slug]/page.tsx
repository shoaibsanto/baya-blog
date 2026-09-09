import { notFound } from "next/navigation";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { TableOfContents } from "@/components/article/TableOfContents";
import { ArticleMeta } from "@/components/article/ArticleMeta";
import { FAQBlock } from "@/components/article/FAQBlock";
import { RelatedArticles } from "@/components/article/RelatedArticles";
import { JsonLd } from "@/components/seo/JsonLd";
import { getHub } from "@/config/site.config";
import { getArticleBySlug, listRelated, SAMPLE_ARTICLES } from "@/content/sample-articles";
import { renderBlocks, extractHeadings } from "@/lib/render/renderBlocks";
import { generateArticleMetadata } from "@/lib/seo/metadata";
import { generateArticleSchema, generateBreadcrumbSchema, generateFAQSchema } from "@/lib/seo/schema";

export function generateStaticParams() {
  return SAMPLE_ARTICLES.map((a) => ({ hub: a.hub, slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ hub: string; slug: string }>;
}) {
  const { hub, slug } = await params;
  const article = getArticleBySlug(hub, slug);
  if (!article) return {};
  return generateArticleMetadata(article);
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ hub: string; slug: string }>;
}) {
  const { hub: hubSlug, slug } = await params;
  const hub = getHub(hubSlug);
  const article = getArticleBySlug(hubSlug, slug);
  if (!hub || !article) notFound();

  const headings = extractHeadings(article.body);
  const related = article.relatedArticles?.length ? article.relatedArticles : listRelated(article).map((a) => ({
    slug: a.slug,
    hub: a.hub,
    title: a.title,
  }));

  return (
    <Container className="py-8">
      <JsonLd data={generateArticleSchema(article)} />
      <JsonLd
        data={generateBreadcrumbSchema([
          { label: "হোম", href: "/" },
          { label: hub.name, href: `/${hub.slug}` },
          { label: article.title, href: `/${hub.slug}/${article.slug}` },
        ])}
      />
      {article.faq && article.faq.length > 0 && (
        <JsonLd data={generateFAQSchema(article.faq) as object} />
      )}

      <Breadcrumb
        items={[
          { label: "হোম", href: "/" },
          { label: hub.name, href: `/${hub.slug}` },
          { label: article.title },
        ]}
      />

      <article className="prose-baya mt-3">
        <h1 className="text-2xl font-extrabold leading-snug text-foreground sm:text-3xl">
          {article.title}
        </h1>
        <p className="mt-3 text-[0.98rem] leading-7 text-muted">{article.excerpt}</p>

        <div className="mt-4">
          <ArticleMeta
            author={article.author}
            updatedAt={article.updatedAt}
            lastVerifiedAt={article.lastVerifiedAt}
          />
        </div>

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

        {renderBlocks(article.body)}

        {article.faq && <FAQBlock items={article.faq} />}
        <RelatedArticles items={related} />
      </article>
    </Container>
  );
}

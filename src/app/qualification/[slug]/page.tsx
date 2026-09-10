import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JobCard } from "@/components/home/JobCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { listQualifications, getQualificationBySlug } from "@/lib/content/articles";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema } from "@/lib/seo/schema";
import { toBnNumber } from "@/lib/format";

export const revalidate = 3600;

/**
 * RULE 19: Qualification connectivity — generate taxonomy pages.
 * RULE 21: Taxonomy quality rule — only create when sufficient content.
 */
export function generateStaticParams() {
  return listQualifications()
    .filter((q) => q.articleCount >= 2) // RULE 21: minimum useful content
    .map((q) => ({ slug: q.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const qual = getQualificationBySlug(slug);
  if (!qual) return {};
  return generatePageMetadata({
    title: `${qual.label} চাকরি`,
    description: `${qual.label} শিক্ষাগত যোগ্যতার জন্য উপযোগী সকল নিয়োগ বিজ্ঞপ্তি। ${qual.articleCount}টি চাকরি পাওয়া গেছে।`,
    path: `/qualification/${slug}`,
  });
}

export default async function QualificationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const qual = getQualificationBySlug(slug);
  if (!qual) notFound();

  return (
    <Container className="py-8">
      <JsonLd
        data={generateBreadcrumbSchema([
          { label: "হোম", href: "/" },
          { label: "শিক্ষাগত যোগ্যতা", href: "/qualification" },
          { label: qual.label, href: `/qualification/${qual.slug}` },
        ])}
      />

      <Breadcrumb
        items={[
          { label: "হোম", href: "/" },
          { label: "শিক্ষাগত যোগ্যতা", href: "/qualification" },
          { label: qual.label },
        ]}
      />

      <h1 className="mt-3 text-2xl font-extrabold text-foreground">
        {qual.label} চাকরি
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
        {qual.label} শিক্ষাগত যোগ্যতার জন্য উপযোগী সকল নিয়োগ বিজ্ঞপ্তি। মোট {toBnNumber(qual.articleCount)}টি চাকরি পাওয়া গেছে।
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground">
          {qual.label} শিক্ষাগত যোগ্যতার চাকরি
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {qual.articles.map((article) => (
            <li key={article.id}>
              <JobCard article={article} />
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-8">
        <Link href="/" className="text-sm font-semibold text-brand-dark hover:underline">
          ← হোমপেজে ফিরুন
        </Link>
      </div>
    </Container>
  );
}

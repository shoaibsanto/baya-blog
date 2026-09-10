import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JobCard } from "@/components/home/JobCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { listOrganizations, getOrganizationBySlug } from "@/lib/content/articles";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema } from "@/lib/seo/schema";
import { getCategory } from "@/config/site.config";
import { toBnNumber } from "@/lib/format";

export const revalidate = 3600;

/**
 * RULE 18: Organization connectivity — generate pages for each organization.
 * RULE 8: Clean URL architecture — /organization/[slug]
 */
export function generateStaticParams() {
  return listOrganizations().map((o) => ({ slug: o.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const org = getOrganizationBySlug(slug);
  if (!org) return {};
  return generatePageMetadata({
    title: `${org.name} — নিয়োগ বিজ্ঞপ্তি`,
    description: `${org.name}-এর সকল সাম্প্রতিক নিয়োগ বিজ্ঞপ্তি একসাথে দেখুন। ${org.articleCount}টি বিজ্ঞপ্তি পাওয়া গেছে।`,
    path: `/organization/${slug}`,
  });
}

export default async function OrganizationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const org = getOrganizationBySlug(slug);
  if (!org) notFound();

  return (
    <Container className="py-8">
      <JsonLd
        data={generateBreadcrumbSchema([
          { label: "হোম", href: "/" },
          { label: "প্রতিষ্ঠান", href: "/organization" },
          { label: org.name, href: `/organization/${org.slug}` },
        ])}
      />

      <Breadcrumb
        items={[
          { label: "হোম", href: "/" },
          { label: "প্রতিষ্ঠান", href: "/organization" },
          { label: org.name },
        ]}
      />

      <h1 className="mt-3 text-2xl font-extrabold text-foreground">
        {org.name}
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
        {org.name}-এর সকল নিয়োগ বিজ্ঞপ্তি। মোট {toBnNumber(org.articleCount)}টি বিজ্ঞপ্তি পাওয়া গেছে।
      </p>

      {/* RULE 18: Organization → Articles connectivity */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground">
          {org.name}-এর সকল চাকরি
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          {org.articles.map((article) => (
            <li key={article.id}>
              <JobCard article={article} />
            </li>
          ))}
        </ul>
      </section>

      {/* RULE 16: Category connectivity — link back to categories */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground">সম্পর্কিত ক্যাটাগরি</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {[...new Set(org.articles.map((a) => a.category))].map((cat) => (
            <Link
              key={cat}
              href={`/category/${cat}`}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:border-brand hover:text-brand-dark"
            >
              {getCategory(cat)?.name ?? cat.replace(/-/g, " ")}
            </Link>
          ))}
        </div>
      </section>

      {/* RULE 17: Homepage connectivity */}
      <div className="mt-8">
        <Link href="/" className="text-sm font-semibold text-brand-dark hover:underline">
          ← হোমপেজে ফিরুন
        </Link>
      </div>
    </Container>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JobCard } from "@/components/home/JobCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { listOrganizations, getOrganizationBySlug, listQualifications } from "@/lib/content/articles";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema, generateItemListSchema, generateFAQSchema } from "@/lib/seo/schema";
import { getCategory, SITE } from "@/config/site.config";
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
    title: `${org.name} নিয়োগ বিজ্ঞপ্তি — সাম্প্রতিক চাকরির খবর`,
    description: `${org.name}-এর সকল সাম্প্রতিক নিয়োগ বিজ্ঞপ্তি একসাথে দেখুন। মোট ${org.articleCount}টি বিজ্ঞপ্তি পাওয়া গেছে — যাচাইকৃত তথ্য, আবেদন পদ্ধতিসহ।`,
    path: `/organization/${slug}`,
  });
}

function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86_400_000);
}

export default async function OrganizationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const org = getOrganizationBySlug(slug);
  if (!org) notFound();

  const qualifications = listQualifications();
  const activeArticles = org.articles.filter((a) => a.job && daysUntil(a.job.deadline) >= 0);
  const expiredArticles = org.articles.filter((a) => a.job && daysUntil(a.job.deadline) < 0);

  // Collect qualification levels from all articles
  const qualSet = new Set<string>();
  for (const a of org.articles) {
    for (const q of a.job?.qualificationLevels ?? []) qualSet.add(q);
  }

  const faqs = [
    {
      question: `${org.name}-এ কী কী পদে নিয়োগ হচ্ছে?`,
      answer: `${org.name} সাম্প্রতিক সময়ে বিভিন্ন পদে নিয়োগ বিজ্ঞপ্তি প্রকাশ করেছে। বর্তমানে ${toBnNumber(org.articles.length)}টি নিয়োগ বিজ্ঞপ্তি পাওয়া গেছে। নির্দিষ্ট পদ, যোগ্যতা ও আবেদনের নিয়ম জানতে সংশ্লিষ্ট বিজ্ঞপ্তির পাতা দেখুন।`,
    },
    {
      question: `${org.name}-এ আবেদন করার নিয়ম কী?`,
      answer: `${org.name}-এর নিয়োগ বিজ্ঞপ্তির পাতায় বিস্তারিত আবেদন পদ্ধতি ও ধাপে ধাপে নির্দেশনা দেওয়া থাকে। অনেক ক্ষেত্রে অনলাইন আবেদন বা অফিসে সরাসরি আবেদন করতে হয়।`,
    },
    {
      question: `${org.name}-এর বিজ্ঞপ্তি কি যাচাইকৃত?`,
      answer: `BAYA Blog প্রতিটি নিয়োগ বিজ্ঞপ্তি অফিসিয়াল সোর্স থেকে যাচাই করে প্রকাশ করে। প্রতিটি বিজ্ঞপ্তির সাথে সোর্স, প্রকাশের তারিখ ও শেষ যাচাইয়ের তারিখ উল্লেখ থাকে।`,
    },
  ];

  const itemList = generateItemListSchema(
    org.articles.map((a) => ({
      name: a.title,
      url: `${SITE.url}/${a.slug}`,
      description: a.excerpt,
    })),
    `${org.name} নিয়োগ বিজ্ঞপ্তি`,
  );

  return (
    <Container className="py-8">
      <JsonLd
        data={generateBreadcrumbSchema([
          { label: "হোম", href: "/" },
          { label: "প্রতিষ্ঠান", href: "/organization" },
          { label: org.name, href: `/organization/${org.slug}` },
        ])}
      />
      {itemList && <JsonLd data={itemList} />}
      {faqs.length > 0 && <JsonLd data={generateFAQSchema(faqs) as object} />}

      <Breadcrumb
        items={[
          { label: "হোম", href: "/" },
          { label: "প্রতিষ্ঠান", href: "/organization" },
          { label: org.name },
        ]}
      />

      <h1 className="mt-3 text-2xl font-extrabold text-foreground">
        {org.name} নিয়োগ বিজ্ঞপ্তি
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
        {org.name}-এর সকল সাম্প্রতিক নিয়োগ বিজ্ঞপ্তি একসাথে দেখুন। মোট {toBnNumber(org.articleCount)}টি বিজ্ঞপ্তি পাওয়া গেছে।
      </p>

      {/* Active jobs section */}
      {activeArticles.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-foreground">
            চলমান নিয়োগ বিজ্ঞপ্তি ({toBnNumber(activeArticles.length)}টি)
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {activeArticles.map((article) => (
              <li key={article.id}>
                <JobCard article={article} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Expired jobs section */}
      {expiredArticles.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-foreground">
            অতীত নিয়োগ বিজ্ঞপ্তি ({toBnNumber(expiredArticles.length)}টি)
          </h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {expiredArticles.map((article) => (
              <li key={article.id}>
                <JobCard article={article} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Category connectivity */}
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

      {/* Qualification links */}
      {qualSet.size > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-foreground">যোগ্যতা অনুযায়ী</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {qualifications
              .filter((q) => qualSet.has(q.slug))
              .map((q) => (
                <Link
                  key={q.slug}
                  href={`/qualification/${q.slug}`}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:border-brand hover:text-brand-dark"
                >
                  {q.label} চাকরি
                </Link>
              ))}
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-foreground">{org.name} সম্পর্কে প্রশ্নোত্তর</h2>
        <div className="mt-4 space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-md border border-border p-4">
              <h3 className="font-semibold text-foreground">{faq.question}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Homepage connectivity */}
      <div className="mt-8">
        <Link href="/" className="text-sm font-semibold text-brand-dark hover:underline">
          ← হোমপেজে ফিরুন
        </Link>
      </div>
    </Container>
  );
}

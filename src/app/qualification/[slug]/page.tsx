import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JobCard } from "@/components/home/JobCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { listQualifications, getQualificationBySlug, listOrganizations } from "@/lib/content/articles";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema, generateItemListSchema, generateFAQSchema } from "@/lib/seo/schema";
import { CATEGORIES } from "@/config/site.config";
import { SITE } from "@/config/site.config";
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
    title: `${qual.label} পাশের চাকরির খবর — নিয়োগ বিজ্ঞপ্তি ২০২৬`,
    description: `${qual.label} শিক্ষাগত যোগ্যতার জন্য উপযোগী সরকারি, ব্যাংক, বেসরকারি ও এনজিও চাকরির সাম্প্রতিক নিয়োগ বিজ্ঞপ্তি। মোট ${qual.articleCount}টি চাকরি পাওয়া গেছে।`,
    path: `/qualification/${slug}`,
  });
}

/** Qualification-specific FAQ — unique per qualification level. */
function getQualificationFAQ(qualLabel: string, slug: string, articleCount: number) {
  const faqs: { question: string; answer: string }[] = [
    {
      question: `${qualLabel} পাশে কোন কোন চাকরির জন্য আবেদন করা যায়?`,
      answer: `${qualLabel} পাশে প্রার্থীরা সরকারি চাকরি, ব্যাংক চাকরি, বেসরকারি চাকরি, এনজিও চাকরি এবং বিভিন্ন স্বায়ত্তশাসিত প্রতিষ্ঠানের নিয়োগ বিজ্ঞপ্তিতে আবেদন করতে পারেন। নির্দিষ্ট পদের জন্য সাধারণত অতিরিক্ত যোগ্যতা বা অভিজ্ঞতার প্রয়োজন হতে পারে।`,
    },
    {
      question: `${qualLabel} পাশের জন্য সরকারি চাকরি কী কী?`,
      answer: `সরকারি চাকরিতে ${qualLabel} পাশের প্রার্থীদের জন্য বিভিন্ন ধরনের পদ থাকে — যেমন সহকারী কর্মকর্তা, সহকারী হিসাবরক্ষক, কনিষ্ঠ সহকারী, ডেটা এন্ট্রি অপারেটর ইত্যাদি। প্রতিটি নিয়োগ বিজ্ঞপ্তিতে নির্দিষ্ট পদের যোগ্যতা ও বয়সসীমা উল্লেখ থাকে।`,
    },
    {
      question: `BAYA Blog-এর চাকরির খবর কি বিশ্বস্ত?`,
      answer: `BAYA Blog প্রতিটি নিয়োগ বিজ্ঞপ্তি অফিসিয়াল সোর্স থেকে যাচাই করে প্রকাশ করে। প্রতিটি বিজ্ঞপ্তির সাথে সোর্স, প্রকাশের তারিখ ও শেষ যাচাইয়ের তারিখ উল্লেখ থাকে।`,
    },
  ];

  // Add qualification-specific FAQ
  if (slug === "ssc") {
    faqs.push({
      question: "SSC পাশে কি সরাসরি সরকারি চাকরিতে আবেদন করা যায়?",
      answer: "SSC পাশে সরাসরি সরকারি চাকরিতে আবেদন করা যায় — বিশেষ করে দপ্তর সহকারী, নাইট গার্ড, সিপাহী (জিডি), এলএসডি, কারিগর পদে। বেশিরভাগ এই পদের জন্য SSC পাশই যথেষ্ট।",
    });
  }
  if (slug === "hsc") {
    faqs.push({
      question: "HSC পাশে কি ব্যাংক চাকরিতে আবেদন করা যায়?",
      answer: "HSC পাশে সাধারণত ব্যাংকের নন-অফিসার (কনিষ্ঠ সহকারী) পদে আবেদন করা যায়। তবে কিছু ব্যাংকে অফিসার পদের জন্য স্নাতক বা তার বেশি শিক্ষাগত যোগ্যতা প্রয়োজন হতে পারে।",
    });
  }
  if (slug === "graduate" || slug === "masters") {
    faqs.push({
      question: "স্নাতক/স্নাতকোত্তর পাশে কি বিসিএসে আবেদন করা যায়?",
      answer: "হ্যাঁ, স্নাতক বা তার বেশি যোগ্যতাধারীরা বিসিএস (Bangladesh Civil Service) পরীক্ষায় অংশগ্রহণ করতে পারেন। বিসিএস-এর জন্য আলাদা লিখিত ও মৌখিক পরীক্ষা পাশ করতে হয়।",
    });
  }

  return faqs;
}

export default async function QualificationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const qual = getQualificationBySlug(slug);
  if (!qual) notFound();

  const allQualifications = listQualifications();
  const organizations = listOrganizations().slice(0, 8);
  const faqs = getQualificationFAQ(qual.label, slug, qual.articleCount);

  const itemList = generateItemListSchema(
    qual.articles.map((a) => ({
      name: a.title,
      url: `${SITE.url}/${a.slug}`,
      description: a.excerpt,
    })),
    `${qual.label} চাকরি`,
  );

  // Find categories most represented in this qualification's articles
  const categoryCounts = new Map<string, number>();
  for (const a of qual.articles) {
    categoryCounts.set(a.category, (categoryCounts.get(a.category) ?? 0) + 1);
  }
  const topCategories = [...categoryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([catSlug]) => catSlug);

  return (
    <Container className="py-8">
      <JsonLd
        data={generateBreadcrumbSchema([
          { label: "হোম", href: "/" },
          { label: "শিক্ষাগত যোগ্যতা", href: "/qualification" },
          { label: qual.label, href: `/qualification/${qual.slug}` },
        ])}
      />
      {itemList && <JsonLd data={itemList} />}
      {faqs.length > 0 && <JsonLd data={generateFAQSchema(faqs) as object} />}

      <Breadcrumb
        items={[
          { label: "হোম", href: "/" },
          { label: "শিক্ষাগত যোগ্যতা", href: "/qualification" },
          { label: qual.label },
        ]}
      />

      <h1 className="mt-3 text-2xl font-extrabold text-foreground">
        {qual.label} পাশের চাকরির খবর
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
        {qual.label} শিক্ষাগত যোগ্যতার জন্য উপযোগী সরকারি, ব্যাংক, বেসরকারি ও এনজিও চাকরির সাম্প্রতিক নিয়োগ বিজ্ঞপ্তি। মোট {toBnNumber(qual.articleCount)}টি চাকরি পাওয়া গেছে।
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

      {/* SEO: Category navigation for this qualification */}
      {topCategories.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-foreground">{qual.label} পাশের জন্য জনপ্রিয় ক্যাটাগরি</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {topCategories.map((catSlug) => {
              const cat = CATEGORIES.find((c) => c.slug === catSlug);
              if (!cat) return null;
              return (
                <Link
                  key={catSlug}
                  href={`/category/${catSlug}`}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:border-brand hover:text-brand-dark"
                >
                  {cat.name}
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* SEO: Other qualifications cross-linking */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground">অন্যান্য যোগ্যতা</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {allQualifications
            .filter((q) => q.slug !== slug)
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

      {/* SEO: Related organizations */}
      {organizations.length > 0 && (
        <section className="mt-8">
          <h2 className="text-lg font-bold text-foreground">জনপ্রিয় প্রতিষ্ঠান</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {organizations.map((org) => (
              <Link
                key={org.slug}
                href={`/organization/${org.slug}`}
                className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:border-brand hover:text-brand-dark"
              >
                {org.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* SEO: FAQ */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-foreground">{qual.label} পাশের চাকরি সম্পর্কে প্রশ্নোত্তর</h2>
        <div className="mt-4 space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-md border border-border p-4">
              <h3 className="font-semibold text-foreground">{faq.question}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <Link href="/" className="text-sm font-semibold text-brand-dark hover:underline">
          ← হোমপেজে ফিরুন
        </Link>
      </div>
    </Container>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JobCard } from "@/components/home/JobCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { CATEGORIES, getCategory, QUALIFICATIONS } from "@/config/site.config";
import { listArticlesByCategory } from "@/content/articles";
import { listQualifications } from "@/lib/content/articles";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema, generateItemListSchema, generateFAQSchema } from "@/lib/seo/schema";
import { SITE } from "@/config/site.config";

export const revalidate = 3600;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  const articles = listArticlesByCategory(category.slug);
  return generatePageMetadata({
    title: `${category.name} — নিয়োগ বিজ্ঞপ্তি ২০২৬`,
    description: `${category.description}। মোট ${articles.length}টি চাকরির খবর পাওয়া গেছে — যাচাইকৃত তথ্য, সহজ ভাষায়।`,
    path: `/category/${category.slug}`,
  });
}

/** Category-specific FAQ — only shown when there are actual articles in the category. */
function getCategoryFAQ(categoryName: string, articleCount: number) {
  return [
    {
      question: `${categoryName}-এর সাম্প্রতিক নিয়োগ বিজ্ঞপ্তি কোথায় পাবেন?`,
      answer: `BAYA Blog-এ ${categoryName} বিভাগে মোট ${articleCount}টি সাম্প্রতিক নিয়োগ বিজ্ঞপ্তি প্রকাশিত হয়েছে। প্রতিটি বিজ্ঞপ্তি যাচাই করে প্রকাশ করা হয় এবং প্রতিটির সাথে আবেদন পদ্ধতি, যোগ্যতা ও গুরুত্বপূর্ণ তারিখ উল্লেখ করা থাকে।`,
    },
    {
      question: `${categoryName}-এ আবেদন করার নিয়ম কী?`,
      answer: `প্রতিটি নিয়োগ বিজ্ঞপ্তির পাতায় বিস্তারিত আবেদন পদ্ধতি ও ধাপে ধাপে নির্দেশনা দেওয়া থাকে। অনেক ক্ষেত্রে অনলাইন আবেদন বা টেলিটকের মাধ্যমে আবেদন করতে হয়। নির্দিষ্ট নিয়ম জানতে সংশ্লিষ্ট বিজ্ঞপ্তির পাতা দেখুন।`,
    },
    {
      question: `BAYA Blog-এর ${categoryName} বিজ্ঞপ্তি কি বিশ্বস্ত?`,
      answer: `BAYA Blog প্রতিটি নিয়োগ বিজ্ঞপ্তি সরকারি বা অফিসিয়াল সোর্স থেকে যাচাই করে প্রকাশ করে। প্রতিটি বিজ্ঞপ্তির সাথে সোর্স লিংক, প্রকাশের তারিখ ও শেষ যাচাইয়ের তারিখ উল্লেখ থাকে।`,
    },
  ];
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const articles = listArticlesByCategory(category.slug);
  const qualifications = listQualifications();
  const faqs = getCategoryFAQ(category.name, articles.length);

  const itemList = generateItemListSchema(
    articles.map((a) => ({
      name: a.title,
      url: `${SITE.url}/${a.slug}`,
      description: a.excerpt,
    })),
    category.name,
  );

  return (
    <Container className="py-8">
      <JsonLd
        data={generateBreadcrumbSchema([
          { label: "হোম", href: "/" },
          { label: category.name, href: `/category/${category.slug}` },
        ])}
      />
      {itemList && <JsonLd data={itemList} />}
      {faqs.length > 0 && <JsonLd data={generateFAQSchema(faqs) as object} />}

      <Breadcrumb items={[{ label: "হোম", href: "/" }, { label: category.name }]} />
      <h1 className="mt-3 text-2xl font-extrabold text-foreground">{category.name}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">{category.description}</p>

      <div className="mt-8">
        {articles.length === 0 ? (
          <p className="text-sm text-muted">এই ক্যাটাগরিতে শীঘ্রই নতুন বিজ্ঞপ্তি যুক্ত করা হবে।</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {articles.map((article) => (
              <li key={article.id}>
                <JobCard article={article} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* SEO: Qualification-based navigation links */}
      {qualifications.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-foreground">যোগ্যতা অনুযায়ী চাকরি</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {qualifications.map((q) => (
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

      {/* SEO: Cross-category navigation */}
      <section className="mt-8">
        <h2 className="text-lg font-bold text-foreground">অন্যান্য ক্যাটাগরি</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {CATEGORIES.filter((c) => c.slug !== category.slug).map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:border-brand hover:text-brand-dark"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* SEO: FAQ section */}
      <section className="mt-10">
        <h2 className="text-lg font-bold text-foreground">{category.name} সম্পর্কে প্রশ্নোত্তর</h2>
        <div className="mt-4 space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-md border border-border p-4">
              <h3 className="font-semibold text-foreground">{faq.question}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </Container>
  );
}

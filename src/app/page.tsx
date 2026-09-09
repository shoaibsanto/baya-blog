import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { JobCard } from "@/components/home/JobCard";
import { FilterBar } from "@/components/home/FilterBar";
import { JsonLd } from "@/components/seo/JsonLd";
import { CATEGORIES } from "@/config/site.config";
import { listLatestArticles } from "@/content/sample-articles";
import { filterArticles } from "@/lib/jobFilters";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateOrganizationSchema, generateWebSiteSchema } from "@/lib/seo/schema";

export const revalidate = 3600;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const hasFilter = Boolean(params.category || params.qualification || params.deadline);
  return generatePageMetadata({
    title: "BAYA Blog — সরকারি, বেসরকারি ও ব্যাংক চাকরির খবর",
    description:
      "বাংলাদেশের সরকারি, বেসরকারি, ব্যাংক ও এনজিও চাকরির সবচেয়ে হালনাগাদ নিয়োগ বিজ্ঞপ্তি — যাচাইকৃত তথ্য, সহজ ভাষায়।",
    path: "/",
    absoluteTitle: true,
    noindex: hasFilter,
  });
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const allArticles = listLatestArticles(100);
  const filtered = filterArticles(allArticles, {
    category: params.category,
    qualification: params.qualification,
    deadline: params.deadline,
  });

  return (
    <Container className="py-8">
      <JsonLd data={generateOrganizationSchema()} />
      <JsonLd data={generateWebSiteSchema()} />

      <section className="rounded-lg bg-brand-light px-6 py-8 text-center sm:py-10">
        <h1 className="text-2xl font-extrabold text-brand-dark sm:text-3xl">
          বাংলাদেশের চাকরির খবর, এক জায়গায়
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-foreground/80 sm:text-base">
          সরকারি, বেসরকারি, ব্যাংক ও এনজিও চাকরির যাচাইকৃত নিয়োগ বিজ্ঞপ্তি প্রতিদিন হালনাগাদ হয়।
        </p>
      </section>

      <div className="mt-5 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:border-brand hover:text-brand-dark sm:text-sm"
          >
            {cat.name}
          </Link>
        ))}
      </div>

      <div className="mt-5">
        <FilterBar
          defaultCategory={params.category}
          defaultQualification={params.qualification}
          defaultDeadline={params.deadline}
        />
      </div>

      <section aria-labelledby="listing-heading" className="mt-6">
        <h2 id="listing-heading" className="sr-only">
          চাকরির তালিকা
        </h2>
        {filtered.length === 0 ? (
          <p className="rounded-md border border-border p-6 text-center text-sm text-muted">
            আপনার নির্বাচিত ফিল্টার অনুযায়ী কোনো চাকরি পাওয়া যায়নি। ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন।
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {filtered.map((article) => (
              <li key={article.id}>
                <JobCard article={article} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </Container>
  );
}

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { HUBS, getHub } from "@/config/site.config";
import { listLatestArticles } from "@/content/sample-articles";
import { formatBnDate } from "@/lib/format";
import { generatePageMetadata } from "@/lib/seo/metadata";

export const metadata = generatePageMetadata({
  title: "BAYA Blog — বাংলাদেশ সরকারি চাকরি, শিক্ষা ও সেবা তথ্য",
  description:
    "বাংলাদেশ সরকারি চাকরির বিজ্ঞপ্তি, SSC/HSC ফলাফল, NID, পাসপোর্ট ও অন্যান্য সরকারি সেবা সম্পর্কিত নির্ভরযোগ্য তথ্য এক জায়গায়।",
  path: "/",
  absoluteTitle: true,
});

export default function HomePage() {
  const latest = listLatestArticles(6);

  return (
    <Container className="py-8">
      <section className="rounded-lg bg-brand-light px-6 py-10 text-center sm:py-14">
        <h1 className="text-2xl font-extrabold text-brand-dark sm:text-3xl">
          বাংলাদেশের সরকারি তথ্য ও সেবা, এক জায়গায়
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-foreground/80 sm:text-base">
          চাকরির বিজ্ঞপ্তি, পরীক্ষার ফলাফল, NID, পাসপোর্ট ও অন্যান্য সরকারি সেবা সম্পর্কিত হালনাগাদ তথ্য।
        </p>
        <form action="/search" className="mx-auto mt-6 flex max-w-md items-center gap-2">
          <label htmlFor="q" className="sr-only">
            অনুসন্ধান করুন
          </label>
          <input
            id="q"
            name="q"
            type="search"
            placeholder="যেমন: SSC রেজাল্ট, পাসপোর্ট নবায়ন..."
            className="h-11 flex-1 rounded-md border border-border bg-background px-4 text-sm outline-none focus:border-brand"
          />
          <button
            type="submit"
            className="h-11 rounded-md bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            খুঁজুন
          </button>
        </form>
      </section>

      <section aria-labelledby="categories-heading" className="mt-10">
        <h2 id="categories-heading" className="mb-4 text-lg font-bold text-foreground">
          জনপ্রিয় বিভাগ
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {HUBS.map((hub) => (
            <Link
              key={hub.slug}
              href={`/${hub.slug}`}
              className="rounded-md border border-border p-4 text-center text-sm font-medium text-foreground hover:border-brand hover:text-brand-dark"
            >
              {hub.name}
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="latest-heading" className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="latest-heading" className="text-lg font-bold text-foreground">
            সাম্প্রতিক আপডেট
          </h2>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {latest.map((article) => {
            const hub = getHub(article.hub);
            return (
              <li key={article.id}>
                <Link
                  href={`/${article.hub}/${article.slug}`}
                  className="block rounded-md border border-border p-4 hover:border-brand"
                >
                  <div className="mb-2 flex items-center gap-2">
                    {hub && <Badge>{hub.shortName}</Badge>}
                    <span className="text-xs text-muted">{formatBnDate(article.updatedAt)}</span>
                  </div>
                  <p className="font-semibold text-foreground">{article.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{article.excerpt}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </Container>
  );
}

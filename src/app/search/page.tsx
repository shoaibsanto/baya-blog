import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SAMPLE_ARTICLES } from "@/content/sample-articles";
import { getHub } from "@/config/site.config";
import { generatePageMetadata } from "@/lib/seo/metadata";

export const metadata = generatePageMetadata({
  title: "অনুসন্ধান",
  description: "BAYA Blog-এ আর্টিকেল খুঁজুন।",
  path: "/search",
  noindex: true,
});

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim().toLowerCase();

  const results = query
    ? SAMPLE_ARTICLES.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.excerpt.toLowerCase().includes(query) ||
          a.tags?.some((t) => t.toLowerCase().includes(query))
      )
    : [];

  return (
    <Container className="py-8">
      <h1 className="text-xl font-bold text-foreground">অনুসন্ধান</h1>
      <form action="/search" className="mt-4 flex max-w-md items-center gap-2">
        <label htmlFor="q" className="sr-only">
          অনুসন্ধান করুন
        </label>
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={q}
          placeholder="কী খুঁজছেন?"
          className="h-11 flex-1 rounded-md border border-border bg-background px-4 text-sm outline-none focus:border-brand"
        />
        <button
          type="submit"
          className="h-11 rounded-md bg-brand px-5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          খুঁজুন
        </button>
      </form>

      <div className="mt-6">
        {query && results.length === 0 && (
          <p className="text-sm text-muted">&ldquo;{q}&rdquo;-এর জন্য কোনো ফলাফল পাওয়া যায়নি।</p>
        )}
        {results.length > 0 && (
          <ul className="grid gap-4 sm:grid-cols-2">
            {results.map((article) => {
              const hub = getHub(article.hub);
              return (
                <li key={article.id}>
                  <Link
                    href={`/${article.hub}/${article.slug}`}
                    className="block rounded-md border border-border p-4 hover:border-brand"
                  >
                    <span className="text-xs text-muted">{hub?.shortName}</span>
                    <p className="mt-1 font-semibold text-foreground">{article.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted">{article.excerpt}</p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Container>
  );
}

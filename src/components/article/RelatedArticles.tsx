import Link from "next/link";
import type { RelatedArticleRef } from "@/types";

export function RelatedArticles({ items }: { items: RelatedArticleRef[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="related-heading" className="my-8">
      <h2 id="related-heading" className="mb-4 text-xl font-bold text-foreground">
        সম্পর্কিত আর্টিকেল
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item.slug}>
            <Link
              href={`/${item.hub}/${item.slug}`}
              className="block rounded-md border border-border p-4 text-sm font-medium text-foreground hover:border-brand hover:text-brand-dark"
            >
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

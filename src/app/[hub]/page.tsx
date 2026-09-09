import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { HUBS, getHub } from "@/config/site.config";
import { listArticlesByHub } from "@/content/sample-articles";
import { formatBnDate } from "@/lib/format";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema } from "@/lib/seo/schema";

export function generateStaticParams() {
  return HUBS.map((hub) => ({ hub: hub.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ hub: string }> }) {
  const { hub: hubSlug } = await params;
  const hub = getHub(hubSlug);
  if (!hub) return {};
  return generatePageMetadata({
    title: hub.name,
    description: hub.description,
    path: `/${hub.slug}`,
  });
}

export default async function HubPage({ params }: { params: Promise<{ hub: string }> }) {
  const { hub: hubSlug } = await params;
  const hub = getHub(hubSlug);
  if (!hub) notFound();

  const articles = listArticlesByHub(hub.slug);
  const breadcrumbItems = [{ label: "হোম", href: "/" }, { label: hub.name }];

  return (
    <Container className="py-8">
      <JsonLd
        data={generateBreadcrumbSchema([
          { label: "হোম", href: "/" },
          { label: hub.name, href: `/${hub.slug}` },
        ])}
      />
      <Breadcrumb items={breadcrumbItems} />
      <h1 className="mt-3 text-2xl font-extrabold text-foreground">{hub.name}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">{hub.description}</p>

      <div className="mt-8">
        {articles.length === 0 ? (
          <p className="text-sm text-muted">এই বিভাগে শীঘ্রই আর্টিকেল যুক্ত করা হবে।</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {articles.map((article) => (
              <li key={article.id}>
                <Link
                  href={`/${hub.slug}/${article.slug}`}
                  className="block rounded-md border border-border p-4 hover:border-brand"
                >
                  <span className="text-xs text-muted">{formatBnDate(article.updatedAt)}</span>
                  <p className="mt-1 font-semibold text-foreground">{article.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{article.excerpt}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Container>
  );
}

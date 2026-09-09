import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JobCard } from "@/components/home/JobCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { CATEGORIES, getCategory } from "@/config/site.config";
import { listArticlesByCategory } from "@/content/sample-articles";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema } from "@/lib/seo/schema";

export const revalidate = 3600;

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return {};
  return generatePageMetadata({
    title: category.name,
    description: `${category.description} — সর্বশেষ নিয়োগ বিজ্ঞপ্তি একসাথে দেখুন।`,
    path: `/category/${category.slug}`,
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const articles = listArticlesByCategory(category.slug);

  return (
    <Container className="py-8">
      <JsonLd
        data={generateBreadcrumbSchema([
          { label: "হোম", href: "/" },
          { label: category.name, href: `/category/${category.slug}` },
        ])}
      />
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
    </Container>
  );
}

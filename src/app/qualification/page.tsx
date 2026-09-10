import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { listQualifications } from "@/lib/content/articles";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema } from "@/lib/seo/schema";
import { toBnNumber } from "@/lib/format";

export const metadata = generatePageMetadata({
  title: "শিক্ষাগত যোগ্যতা অনুযায়ী চাকরি",
  description: "শিক্ষাগত যোগ্যতা অনুযায়ী চাকরি খুঁজুন — JSC, SSC, HSC, ডিপ্লোমা, স্নাতক, স্নাতকোত্তর।",
  path: "/qualification",
});

export default function QualificationIndexPage() {
  const quals = listQualifications();

  return (
    <Container className="py-8">
      <JsonLd
        data={generateBreadcrumbSchema([
          { label: "হোম", href: "/" },
          { label: "শিক্ষাগত যোগ্যতা" },
        ])}
      />
      <Breadcrumb items={[{ label: "হোম", href: "/" }, { label: "শিক্ষাগত যোগ্যতা" }]} />

      <h1 className="mt-3 text-2xl font-extrabold text-foreground">
        শিক্ষাগত যোগ্যতা অনুযায়ী চাকরি
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
        আপনার শিক্ষাগত যোগ্যতা অনুযায়ী চাকরি খুঁজুন।
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {quals.map((q) => (
          <a
            key={q.slug}
            href={`/qualification/${q.slug}`}
            className="rounded-lg border border-border p-4 hover:border-brand hover:shadow-sm transition"
          >
            <h2 className="text-base font-bold text-foreground">{q.label}</h2>
            <p className="mt-1 text-sm text-muted">{toBnNumber(q.articleCount)}টি চাকরি</p>
          </a>
        ))}
      </div>
    </Container>
  );
}

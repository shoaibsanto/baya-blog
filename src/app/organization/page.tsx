import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { listOrganizations } from "@/lib/content/articles";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema } from "@/lib/seo/schema";

export const metadata = generatePageMetadata({
  title: "প্রতিষ্ঠান অনুযায়ী চাকরি",
  description: "বাংলাদেশের প্রতিষ্ঠান অনুযায়ী চাকরি খুঁজুন — ব্যাংক, সরকারি দপ্তর, এনজিও।",
  path: "/organization",
});

export default function OrganizationIndexPage() {
  const orgs = listOrganizations();

  return (
    <Container className="py-8">
      <JsonLd
        data={generateBreadcrumbSchema([
          { label: "হোম", href: "/" },
          { label: "প্রতিষ্ঠান" },
        ])}
      />
      <Breadcrumb items={[{ label: "হোম", href: "/" }, { label: "প্রতিষ্ঠান" }]} />

      <h1 className="mt-3 text-2xl font-extrabold text-foreground">
        প্রতিষ্ঠান অনুযায়ী চাকরি
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
        প্রতিষ্ঠান অনুযায়ী চাকরি খুঁজুন।
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {orgs.map((o) => (
          <a
            key={o.slug}
            href={`/organization/${o.slug}`}
            className="rounded-lg border border-border p-4 hover:border-brand hover:shadow-sm transition"
          >
            <h2 className="text-base font-bold text-foreground">{o.name}</h2>
            <p className="mt-1 text-sm text-muted">{o.articleCount}টি বিজ্ঞপ্তি</p>
          </a>
        ))}
      </div>
    </Container>
  );
}

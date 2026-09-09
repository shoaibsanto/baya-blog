import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { SITE } from "@/config/site.config";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema } from "@/lib/seo/schema";

export const metadata = generatePageMetadata({
  title: "যোগাযোগ",
  description: `BAYA Blog-এর সাথে যোগাযোগ করুন। প্রশ্ন, মতামত বা সহযোগিতার জন্য ই-মেইল করুন।`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <Container className="py-8 max-w-2xl">
      <JsonLd
        data={generateBreadcrumbSchema([
          { label: "হোম", href: "/" },
          { label: "যোগাযোগ" },
        ])}
      />
      <Breadcrumb items={[{ label: "হোম", href: "/" }, { label: "যোগাযোগ" }]} />

      <article className="prose-baya mt-4">
        <h1>যোগাযোগ</h1>
        <p>
          BAYA Blog-এর সাথে যোগাযোগ করতে নিচের মাধ্যমগুলো ব্যবহার করুন।
        </p>

        <h2>ই-মেইল</h2>
        <p>
          সাধারণ প্রশ্ন, মতামত বা সংশোধনের অনুরোধের জন্য:
          <br />
          <a href={`mailto:info@${SITE.url.replace("https://", "")}`}>
            info@{SITE.url.replace("https://", "")}
          </a>
        </p>

        <h2>বিষয়</h2>
        <ul>
          <li>নিয়োগ বিজ্ঞপ্তি সম্পর্কে প্রশ্ন</li>
          <li>ভুল তথ্য সংশোধনের অনুরোধ</li>
          <li>নতুন বিজ্ঞপ্তি যোগ করার অনুরোধ</li>
          <li>সহযোগিতা বা বিজ্ঞাপন</li>
        </ul>

        <h2>আমাদের নীতি</h2>
        <p>
          আমরা সর্বদা চেষ্টা করি সঠিক ও যাচাইকৃত তথ্য প্রদান করতে। কোনো ভুল
          তথ্য খুঁজে পেলে অনুগ্রহ করে আমাদের জানান।
        </p>
      </article>
    </Container>
  );
}

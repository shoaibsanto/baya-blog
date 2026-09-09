import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { JsonLd } from "@/components/seo/JsonLd";
import { CATEGORIES, SITE } from "@/config/site.config";
import { generatePageMetadata } from "@/lib/seo/metadata";
import { generateBreadcrumbSchema } from "@/lib/seo/schema";

export const metadata = generatePageMetadata({
  title: "BAYA Blog সম্পর্কে",
  description:
    "BAYA Blog বাংলাদেশের চাকরির খবরের একটি নির্ভরযোগ্য প্ল্যাটফর্ম। যাচাইকৃত তথ্য, সহজ ভাষায়।",
  path: "/about",
});

export default function AboutPage() {
  return (
    <Container className="py-8 max-w-3xl">
      <JsonLd
        data={generateBreadcrumbSchema([
          { label: "হোম", href: "/" },
          { label: "BAYA Blog সম্পর্কে" },
        ])}
      />
      <Breadcrumb items={[{ label: "হোম", href: "/" }, { label: "BAYA Blog সম্পর্কে" }]} />

      <article className="prose-baya mt-4">
        <h1>BAYA Blog সম্পর্কে</h1>

        <p>
          <strong>BAYA Blog</strong> বাংলাদেশের চাকরির খবরের একটি নির্ভরযোগ্য ডিজিটাল
          প্ল্যাটফর্ম। আমরা সরকারি, বেসরকারি, ব্যাংক ও এনজিও খাতের নিয়োগ বিজ্ঞপ্তি
          একত্রিত করে আপনার জন্য সাজিয়ে দিই — যাচাইকৃত তথ্য, সহজ ভাষায়।
        </p>

        <h2>আমাদের লক্ষ্য</h2>
        <ul>
          <li>
            <strong>যাচাইকৃত তথ্য:</strong> প্রতিটি নিয়োগ বিজ্ঞপ্তি মূল সূত্র (অফিসিয়াল
            ওয়েবসাইট, দৈনিক পত্রিকা) থেকে যাচাই করা হয়।
          </li>
          <li>
            <strong>সহজ ভাষা:</strong> জটিল নিয়মকানুন সহজ বাংলায় বোঝানো হয়।
          </li>
          <li>
            <strong>দ্রুত আপডেট:</strong> নতুন বিজ্ঞপ্তি পাওয়া মাত্রই আমরা পোস্ট করি।
          </li>
          <li>
            <strong>সম্পূর্ণ বিনামূল্যে:</strong> BAYA Blog সবার জন্য বিনামূল্যে।
          </li>
        </ul>

        <h2>কীভাবে কাজ করি</h2>
        <p>
          আমাদের দল প্রতিদিন সরকারি ওয়েবসাইট, দৈনিক পত্রিকা এবং অফিসিয়াল
          সূত্রগুলো অনুসন্ধান করে। নতুন বিজ্ঞপ্তি পেলে তথ্য যাচাই করে, সহজ
          ভাষায় লিখে এবং সঠিক তথ্যসহ প্রকাশ করি।
        </p>

        <h2>গুরুত্বপূর্ণ লিঙ্ক</h2>
        <ul>
          <li>
            <Link href="/">হোমপেজ</Link> — সকল চাকরির তালিকা
          </li>
          {CATEGORIES.slice(0, 4).map((cat) => (
            <li key={cat.slug}>
              <Link href={`/category/${cat.slug}`}>{cat.name}</Link> — {cat.description}
            </li>
          ))}
        </ul>

        <h2>যোগাযোগ</h2>
        <p>
          কোনো প্রশ্ন বা মতামত থাকলে{" "}
          <Link href="/contact">যোগাযোগ পৃষ্ঠা</Link> দেখুন।
        </p>

        <p className="text-sm text-muted">
          ⚠️ দায়িত্ব অস্বীকার: BAYA Blog-এর তথ্য শুধুমাত্র সহায়ক উদ্দেশ্যে। চূড়ান্ত
          সিদ্ধান্তের জন্য সংশ্লিষ্ট সরকারি ওয়েবসাইট দেখুন।
        </p>
      </article>
    </Container>
  );
}

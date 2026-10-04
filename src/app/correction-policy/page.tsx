import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { generatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Correction Policy",
  description: "BAYA Blog-এর সংশোধন নীতি — ভুল তথ্য জানানোর নিয়ম ও সংশোধন প্রক্রিয়া।",
  path: "/correction-policy",
});

export default function CorrectionPolicyPage() {
  return (
    <Container className="py-8">
      <Breadcrumb items={[{ label: "হোম", href: "/" }, { label: "Correction Policy" }]} />
      <article className="prose-baya mt-4 max-w-3xl">
        <h1 className="text-2xl font-extrabold text-foreground">Correction Policy</h1>
        <p className="mt-2 text-sm text-muted">সর্বশেষ হালনাগাদ: ৪ অক্টোবর ২০২৬</p>

        <h2>১. সংশোধনের ধরন</h2>
        <p>আমরা নিম্নলিখিত ক্ষেত্রে সংশোধন করি:
          ভুল তারিখ বা সময়,
          ভুল পদ বা যোগ্যতার তথ্য,
          অফিসিয়াল সোর্সের সাথে অসঙ্গতি,
          ভাঙা বা কার্যকর নয় এমন লিংক
        </p>

        <h2>২. কীভাবে সংশোধন করা হয়</h2>
        <p>যাচাই করে প্রমাণ সহ সংশোধন করা হয়। গুরুত্বপূর্ণ সংশোধনের ক্ষেত্রে "সংশোধিত" ব্যাজ বা সংশোধনের তারিখ উল্লেখ করা হতে পারে।</p>

        <h2>৩. কীভাবে জানাবেন</h2>
        <p>সংশোধনের অনুরোধ করতে <a href="/contact">Contact page</a> এ যোগাযোগ করুন। নিম্নলিখিত তথ্য দিন:
          কোন পাতায় ভুল আছে,
          কী ভুল আছে,
          সঠিক তথ্য কী (যদি জানা থাকে),
          সোর্স লিংক (যদি থাকে)
        </p>

        <h2>৪. সময়সীমা</h2>
        <p>আমরা সম্ভব সবচেয়ে দ্রুত সংশোধন করতে চাই। তবে যাচাই প্রক্রিয়ার কারণে কিছুটা সময় লাগতে পারে।</p>
      </article>
    </Container>
  );
}

import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { generatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Terms & Conditions",
  description: "BAYA Blog-এর ব্যবহারের শর্তাবলী — ব্যবহারকারীদের জন্য নির্দেশনা ও দায়িত্ব।",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <Container className="py-8">
      <Breadcrumb items={[{ label: "হোম", href: "/" }, { label: "Terms & Conditions" }]} />
      <article className="prose-baya mt-4 max-w-3xl">
        <h1 className="text-2xl font-extrabold text-foreground">Terms & Conditions</h1>
        <p className="mt-2 text-sm text-muted">সর্বশেষ হালনাগাদ: ৪ অক্টোবর ২০২৬</p>

        <h2>১. সেবা ব্যবহার</h2>
        <p>BAYA Blog একটি তথ্যভিত্তিক প্ল্যাটফর্ম যা বাংলাদেশের চাকরির খবর প্রকাশ করে। আমাদের ওয়েবসাইট ব্যবহার করে আপনি এই শর্তাবলী মেনে চলতে সম্মত হচ্ছেন।</p>

        <h2>২. তথ্যের যথাযথতা</h2>
        <p>আমরা প্রতিটি নিয়োগ বিজ্ঞপ্তি অফিসিয়াল সোর্স থেকে যাচাই করে প্রকাশ করি। তবে চূড়ান্ত তথ্যের জন্য সরকারি বিজ্ঞপ্তি বা অফিসিয়াল ওয়েবসাইট দেখার অনুরোধ করা হলো।</p>

        <h2>৩. ব্যবহারকারীর দায়িত্ব</h2>
        <p>ব্যবহারকারীদের আমাদের ওয়েবসাইটের কোনো অংশ অপব্যবহার করা বা ক্ষতি করা যাবে না।</p>

        <h2>৪. বহিঃসংযোগ</h2>
        <p>আমাদের সাইটে বিভিন্ন অফিসিয়াল ওয়েবসাইটের লিংক থাকতে পারে। ওই সাইটগুলোর বিষয়ে আমরা দায়ী নই।</p>

        <h2>৫. যোগাযোগ</h2>
        <p>এই শর্তাবলী সম্পর্কে যোগাযোগ করতে <a href="/contact">Contact page</a> দেখুন।</p>
      </article>
    </Container>
  );
}

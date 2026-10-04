import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { generatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Editorial Policy",
  description: "BAYA Blog-এর সম্পাদকীয় নীতি — কীভাবে নিয়োগ বিজ্ঞপ্তি যাচাই, সংগ্রহ ও প্রকাশ করা হয়।",
  path: "/editorial-policy",
});

export default function EditorialPolicyPage() {
  return (
    <Container className="py-8">
      <Breadcrumb items={[{ label: "হোম", href: "/" }, { label: "Editorial Policy" }]} />
      <article className="prose-baya mt-4 max-w-3xl">
        <h1 className="text-2xl font-extrabold text-foreground">Editorial Policy</h1>
        <p className="mt-2 text-sm text-muted">সর্বশেষ হালনাগাদ: ৪ অক্টোবর ২০২৬</p>

        <h2>১. আমাদের লক্ষ্য</h2>
        <p>BAYA Blog-এর লক্ষ্য হলো বাংলাদেশের চাকরির খবর সঠিক, সময়োপযোগী ও সহজ ভাষায় প্রকাশ করা।</p>

        <h2>২. উৎস নীতি</h2>
        <p>প্রতিটি নিয়োগ বিজ্ঞপ্তি সরকারি গেজেট, অফিসিয়াল ওয়েবসাইট বা বিশ্বস্ত সংবাদমাধ্যম থেকে সংগ্রহ করা হয়। প্রতিটি বিজ্ঞপ্তির সাথে সোর্স লিংক ও সোর্সের নাম উল্লেখ করা হয়।</p>

        <h2>৩. যাচাই প্রক্রিয়া</h2>
        <p>প্রকাশের আগে প্রতিটি বিজ্ঞপ্তি যাচাই করা হয় — যেমন:
          অফিসিয়াল সোর্সের সাথে মিলিয়ে দেখা,
          গুরুত্বপূর্ণ তারিখ ও শর্তাবলী যাচাই,
          সোর্স লিংক যাচাই
        </p>

        <h2>৪. সংশোধন নীতি</h2>
        <p>যদি কোনো বিজ্ঞপ্তিতে ত্রুটি পাওয়া যায়, তাহলে আমরা দ্রুত সংশোধন করি। গুরুত্বপূর্ণ সংশোধনের জন্য আমরা সংশোধনের তারিখ ও কারণ উল্লেখ করতে পারি।</p>

        <h2>৫. ভুল জানানোর ব্যবস্থা</h2>
        <p>যদি আপনি কোনো বিজ্ঞপ্তিতে ভুল তথ্য লক্ষ্য করেন, তাহলে অনুগ্রহ করে আমাদের জানান — <a href="/contact">Contact page</a> এর মাধ্যমে। আমরা যাচাই করে প্রয়োজনে সংশোধন করব।</p>

        <h2>৬. স্বাধীনতা</h2>
        <p>আমাদের সম্পাদকীয় সিদ্ধান্ত স্বাধীনভাবে নেওয়া হয়। আমরা কোনো বিজ্ঞপ্তি অনুসারে পক্ষপাত করি না।</p>
      </article>
    </Container>
  );
}

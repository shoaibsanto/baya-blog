import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { Breadcrumb } from "@/components/layout/Breadcrumb";
import { generatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "Privacy Policy",
  description: "BAYA Blog-এর গোপনীয়তা নীতি — কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার ও সুরক্ষা করা হয়।",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return (
    <Container className="py-8">
      <Breadcrumb items={[{ label: "হোম", href: "/" }, { label: "Privacy Policy" }]} />
      <article className="prose-baya mt-4 max-w-3xl">
        <h1 className="text-2xl font-extrabold text-foreground">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted">সর্বশেষ হালনাগাদ: ৪ অক্টোবর ২০২৬</p>

        <h2>১. তথ্য সংগ্রহ</h2>
        <p>BAYA Blog আপনার ব্যক্তিগত তথ্য সরাসরি সংগ্রহ করে না। আমরা শুধুমাত্র সেই তথ্য সংগ্রহ করি যা আপনি স্বেচ্ছায় আমাদের জানান — যেমন আপনি যদি আমাদের সাথে যোগাযোগ করেন।</p>

        <h2>২. কুকি ও অ্যানালিটিক্স</h2>
        <p>আমাদের ওয়েবসাইটে কুকি বা থার্ড-পার্টি অ্যানালিটিক্স টুল ব্যবহার হতে পারে যা সাইট ভিজিটর বিশ্লেষণে সহায়তা করে। এই তথ্য কোনো ব্যক্তিগত পরিচয়ের সাথে যুক্ত হয় না।</p>

        <h2>৩. তৃতীয় পক্ষের লিংক</h2>
        <p>আমাদের ওয়েবসাইটে বিভিন্ন অফিসিয়াল সোর্সের লিংক থাকতে পারে। এই লিংকগুলো আমাদের নিয়ন্ত্রণের বাইরে। অনুগ্রহ করে ওই সাইটের গোপনীয়তা নীতি পড়ে নিন।</p>

        <h2>৪. তথ্যের নিরাপত্তা</h2>
        <p>আমরা আপনার তথ্য সুরক্ষায় বাস্তবসম্মত কর্মপদ্ধতি অনুসরণ করি। তবে ইন্টারনেটে কোনো পদ্ধতিই সম্পূর্ণ নিরাপদ নয়।</p>

        <h2>৫. যোগাযোগ</h2>
        <p>এই নীতি সম্পর্কে কোনো প্রশ্ন থাকলে আমাদের সাথে যোগাযোগ করুন — <a href="/contact">Contact page</a> এর মাধ্যমে।</p>
      </article>
    </Container>
  );
}

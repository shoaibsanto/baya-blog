export type CategorySlug =
  | "government-jobs"
  | "bank-jobs"
  | "private-jobs"
  | "ngo-jobs"
  | "pharma-jobs"
  | "group-of-company-jobs"
  | "university-jobs"
  | "defence-jobs"
  | "teletalk-application"
  | "hot-jobs";

export interface CategoryConfig {
  slug: CategorySlug;
  name: string;
  shortName: string;
  description: string;
}

export const CATEGORIES: CategoryConfig[] = [
  {
    slug: "government-jobs",
    name: "সরকারি চাকরি",
    shortName: "সরকারি চাকরি",
    description: "সরকারি অধিদপ্তর, মন্ত্রণালয় ও স্বায়ত্তশাসিত প্রতিষ্ঠানের নিয়োগ বিজ্ঞপ্তি",
  },
  {
    slug: "bank-jobs",
    name: "ব্যাংক চাকরি",
    shortName: "ব্যাংক চাকরি",
    description: "সরকারি ও বেসরকারি ব্যাংক-বীমার নিয়োগ বিজ্ঞপ্তি",
  },
  {
    slug: "private-jobs",
    name: "প্রাইভেট চাকরি",
    shortName: "প্রাইভেট চাকরি",
    description: "বেসরকারি প্রতিষ্ঠান ও কোম্পানির নিয়োগ বিজ্ঞপ্তি",
  },
  {
    slug: "ngo-jobs",
    name: "এনজিও চাকরি",
    shortName: "এনজিও",
    description: "দেশি-বিদেশি এনজিও ও উন্নয়ন সংস্থার নিয়োগ বিজ্ঞপ্তি",
  },
  {
    slug: "pharma-jobs",
    name: "ফার্মাসিউটিক্যালস চাকরি",
    shortName: "ফার্মা",
    description: "ফার্মাসিউটিক্যাল কোম্পানির মেডিকেল প্রমোশন অফিসারসহ অন্যান্য নিয়োগ",
  },
  {
    slug: "group-of-company-jobs",
    name: "গ্রুপ অব কোম্পানি চাকরি",
    shortName: "গ্রুপ অব কোম্পানি",
    description: "বড় শিল্প গ্রুপ ও কনগ্লোমারেটের নিয়োগ বিজ্ঞপ্তি",
  },
  {
    slug: "university-jobs",
    name: "বিশ্ববিদ্যালয় চাকরি",
    shortName: "বিশ্ববিদ্যালয়",
    description: "পাবলিক ও প্রাইভেট বিশ্ববিদ্যালয়ের শিক্ষক ও কর্মকর্তা নিয়োগ",
  },
  {
    slug: "defence-jobs",
    name: "ডিফেন্স চাকরি",
    shortName: "ডিফেন্স",
    description: "সেনা, নৌ, বিমান বাহিনী ও প্রতিরক্ষা সংশ্লিষ্ট নিয়োগ বিজ্ঞপ্তি",
  },
  {
    slug: "teletalk-application",
    name: "টেলিটক অনলাইন আবেদন",
    shortName: "অনলাইনে আবেদন",
    description: "টেলিটকের মাধ্যমে অনলাইনে আবেদনযোগ্য সরকারি নিয়োগ বিজ্ঞপ্তি",
  },
  {
    slug: "hot-jobs",
    name: "হট জবস",
    shortName: "হট জবস",
    description: "আবেদনের শেষ সময় ঘনিয়ে আসা ও বেশি খোঁজা হচ্ছে এমন নিয়োগ বিজ্ঞপ্তি",
  },
];

export const QUALIFICATIONS = [
  { value: "jsc", label: "৮ম শ্রেণি পাস / JSC" },
  { value: "ssc", label: "এসএসসি / সমমান" },
  { value: "hsc", label: "এইচএসসি / সমমান" },
  { value: "diploma", label: "ডিপ্লোমা / সমমান" },
  { value: "graduate", label: "স্নাতক / সমমান" },
  { value: "masters", label: "স্নাতকোত্তর / সমমান" },
] as const;

export const SITE = {
  name: "BAYA Blog",
  url: "https://baya.blog",
  description:
    "বাংলাদেশের সরকারি, বেসরকারি, ব্যাংক ও এনজিও চাকরির সবচেয়ে হালনাগাদ নিয়োগ বিজ্ঞপ্তি — যাচাইকৃত তথ্য, সহজ ভাষায়।",
};

/** Default Open Graph / Twitter card image. Currently unset — logo/cover branding is on hold for now. */
export const DEFAULT_OG_IMAGE: { url: string; width: number; height: number; alt: string } | null = null;

export function getCategory(slug: string): CategoryConfig | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

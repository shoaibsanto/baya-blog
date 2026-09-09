export type HubSlug =
  | "jobs"
  | "education"
  | "nid"
  | "passport"
  | "birth-registration"
  | "government-services"
  | "forms"
  | "benefits"
  | "expat-services"
  | "other";

export interface HubConfig {
  slug: HubSlug;
  name: string;
  shortName: string;
  description: string;
}

export const HUBS: HubConfig[] = [
  {
    slug: "jobs",
    name: "চাকরি",
    shortName: "চাকরি",
    description: "সরকারি চাকরির বিজ্ঞপ্তি, আবেদন প্রক্রিয়া, প্রবেশপত্র ও ফলাফল",
  },
  {
    slug: "education",
    name: "শিক্ষা ও ফলাফল",
    shortName: "শিক্ষা",
    description: "SSC, HSC, ভর্তি পরীক্ষা, রুটিন, প্রবেশপত্র ও ফলাফল",
  },
  {
    slug: "nid",
    name: "এনআইডি",
    shortName: "এনআইডি",
    description: "জাতীয় পরিচয়পত্র সংশোধন, ডাউনলোড ও পুনঃইস্যু সংক্রান্ত তথ্য",
  },
  {
    slug: "passport",
    name: "পাসপোর্ট",
    shortName: "পাসপোর্ট",
    description: "ই-পাসপোর্ট আবেদন, নবায়ন, ফি ও অ্যাপয়েন্টমেন্ট",
  },
  {
    slug: "birth-registration",
    name: "জন্মনিবন্ধন ও নাগরিক সনদ",
    shortName: "জন্মনিবন্ধন",
    description: "জন্মনিবন্ধন যাচাই, সংশোধন ও নাগরিক সনদ সংক্রান্ত তথ্য",
  },
  {
    slug: "government-services",
    name: "সরকারি সেবা",
    shortName: "সরকারি সেবা",
    description: "ট্রেড লাইসেন্স, টিন, land record সহ অন্যান্য সরকারি সেবা",
  },
  {
    slug: "forms",
    name: "সরকারি ফরম ও আবেদন",
    shortName: "ফরম",
    description: "প্রয়োজনীয় সরকারি ফরম ও আবেদন প্রক্রিয়ার নির্দেশনা",
  },
  {
    slug: "benefits",
    name: "ভাতা ও সুবিধা",
    shortName: "ভাতা",
    description: "সরকারি ভাতা, অনুদান ও সুবিধা সংক্রান্ত তথ্য",
  },
  {
    slug: "expat-services",
    name: "প্রবাসী সেবা",
    shortName: "প্রবাসী",
    description: "প্রবাসীদের জন্য ভিসা, রেমিট্যান্স ও দূতাবাস সংক্রান্ত সেবা",
  },
  {
    slug: "other",
    name: "অন্যান্য",
    shortName: "অন্যান্য",
    description: "অন্যান্য গুরুত্বপূর্ণ সরকারি তথ্য ও সেবা",
  },
];

export const SITE = {
  name: "BAYA Blog",
  url: "https://baya.blog",
  description:
    "বাংলাদেশ সরকারি চাকরি, শিক্ষা, ফলাফল ও নাগরিক সেবা সংক্রান্ত নির্ভরযোগ্য তথ্যের প্ল্যাটফর্ম।",
};

/** Default Open Graph / Twitter card image, used whenever a page has no image of its own. */
export const DEFAULT_OG_IMAGE = {
  url: "/brand/og-image.jpg",
  width: 1200,
  height: 630,
  alt: SITE.name,
};

export function getHub(slug: string): HubConfig | undefined {
  return HUBS.find((h) => h.slug === slug);
}

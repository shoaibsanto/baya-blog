import type { Article } from "@/types";

export const SAMPLE_ARTICLES: Article[] = [
  {
    id: "ssc-result",
    slug: "ssc-result",
    hub: "education",
    title: "SSC রেজাল্ট দেখার নিয়ম ও প্রয়োজনীয় তথ্য",
    excerpt:
      "SSC পরীক্ষার ফলাফল অনলাইনে ও SMS-এর মাধ্যমে কীভাবে দেখবেন, তার সম্পূর্ণ ধাপে ধাপে নির্দেশনা।",
    contentType: "result",
    author: { id: "editorial", name: "BAYA Blog সম্পাদকীয় দল" },
    publishedAt: "2026-05-01",
    updatedAt: "2026-09-01",
    lastVerifiedAt: "2026-09-01",
    officialSource: {
      name: "শিক্ষা বোর্ড ফলাফল পোর্টাল",
      url: "https://www.educationboardresults.gov.bd/",
    },
    featuredImage: {
      src: "/images/placeholder-education.svg",
      alt: "SSC পরীক্ষার্থীরা ফলাফল দেখছে",
    },
    primaryTopic: "ssc",
    tags: ["SSC", "Result", "শিক্ষা বোর্ড"],
    body: [
      {
        type: "callout",
        variant: "info",
        title: "গুরুত্বপূর্ণ তথ্য",
        text: "ফলাফল প্রকাশের দিন educationboardresults.gov.bd ওয়েবসাইট ও Google-এর মাধ্যমে ফলাফল দেখা যাবে।",
      },
      {
        type: "heading",
        level: 2,
        text: "অনলাইনে ফলাফল দেখার নিয়ম",
        id: "online-result",
      },
      {
        type: "steps",
        steps: [
          { title: "ওয়েবসাইটে প্রবেশ", text: "educationboardresults.gov.bd ভিজিট করুন।" },
          { title: "তথ্য প্রদান", text: "পরীক্ষার নাম, বছর, বোর্ড, রোল ও রেজিস্ট্রেশন নম্বর দিন।" },
          { title: "ফলাফল দেখুন", text: "Submit বাটনে ক্লিক করে ফলাফল দেখুন ও প্রয়োজনে প্রিন্ট করুন।" },
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "SMS-এর মাধ্যমে ফলাফল",
        id: "sms-result",
      },
      {
        type: "table",
        headers: ["ধাপ", "নির্দেশনা"],
        rows: [
          ["১", "SSC <স্পেস> বোর্ডের প্রথম ৩ অক্ষর <স্পেস> রোল নম্বর <স্পেস> বছর লিখুন"],
          ["২", "16222 নম্বরে পাঠান"],
        ],
      },
      {
        type: "official-source",
        source: {
          name: "শিক্ষা বোর্ড ফলাফল পোর্টাল",
          url: "https://www.educationboardresults.gov.bd/",
        },
      },
    ],
    faq: [
      {
        question: "SSC রেজাল্ট কবে দেওয়া হয়?",
        answer:
          "সাধারণত পরীক্ষা শেষ হওয়ার প্রায় ২-৩ মাস পর শিক্ষা মন্ত্রণালয় ফলাফল প্রকাশ করে। নির্দিষ্ট তারিখ ঘোষণা হলে এই পাতা আপডেট করা হবে।",
      },
      {
        question: "মার্কশিট কীভাবে পাওয়া যায়?",
        answer: "ফলাফলের ওয়েবসাইট থেকে বিস্তারিত মার্কশিট ডাউনলোড ও প্রিন্ট করা যায়।",
      },
    ],
    relatedArticles: [
      { slug: "ssc-routine", hub: "education", title: "SSC পরীক্ষার রুটিন" },
      { slug: "ssc-board-challenge", hub: "education", title: "SSC বোর্ড চ্যালেঞ্জ আবেদন নিয়ম" },
    ],
  },
  {
    id: "passport-renewal",
    slug: "passport-renewal",
    hub: "passport",
    title: "পাসপোর্ট নবায়ন করার নিয়ম, ফি ও প্রয়োজনীয় কাগজপত্র",
    excerpt:
      "ই-পাসপোর্ট নবায়নের জন্য অনলাইন আবেদন, ফি এবং প্রয়োজনীয় ডকুমেন্টের সম্পূর্ণ তালিকা।",
    contentType: "guide",
    author: { id: "editorial", name: "BAYA Blog সম্পাদকীয় দল" },
    publishedAt: "2026-04-10",
    updatedAt: "2026-08-20",
    lastVerifiedAt: "2026-08-20",
    officialSource: {
      name: "ই-পাসপোর্ট অনলাইন পোর্টাল",
      url: "https://www.epassport.gov.bd/",
    },
    featuredImage: {
      src: "/images/placeholder-passport.svg",
      alt: "পাসপোর্ট নবায়ন আবেদন ফরম",
    },
    primaryTopic: "passport",
    tags: ["Passport", "e-Passport"],
    body: [
      {
        type: "callout",
        variant: "warning",
        title: "সতর্কতা",
        text: "মেয়াদ শেষ হওয়ার অন্তত ৬ মাস আগে নবায়নের আবেদন করা উচিত, নইলে বিদেশ ভ্রমণে সমস্যা হতে পারে।",
      },
      {
        type: "heading",
        level: 2,
        text: "প্রয়োজনীয় কাগজপত্র",
        id: "documents",
      },
      {
        type: "list",
        ordered: false,
        items: [
          "পুরাতন পাসপোর্টের মূল কপি",
          "জাতীয় পরিচয়পত্র (NID)",
          "অনলাইন আবেদন ফরমের প্রিন্ট কপি",
          "ফি পরিশোধের রশিদ",
        ],
      },
      {
        type: "heading",
        level: 2,
        text: "পাসপোর্ট নবায়ন ফি",
        id: "fee",
      },
      {
        type: "table",
        headers: ["পাতা সংখ্যা", "মেয়াদ", "সাধারণ ফি"],
        rows: [
          ["৪৮ পাতা", "৫ বছর", "৪,০২৫ টাকা"],
          ["৪৮ পাতা", "১০ বছর", "৫,৭৫০ টাকা"],
          ["৬৪ পাতা", "৫ বছর", "৬,৩২৫ টাকা"],
        ],
      },
      {
        type: "official-source",
        source: { name: "ই-পাসপোর্ট অনলাইন পোর্টাল", url: "https://www.epassport.gov.bd/" },
      },
    ],
    faq: [
      {
        question: "পাসপোর্ট নবায়নে কত দিন সময় লাগে?",
        answer:
          "সাধারণ আবেদনে সাধারণত ১৫ কার্যদিবস এবং জরুরি আবেদনে ২-৭ কার্যদিবসের মধ্যে পাসপোর্ট হাতে পাওয়া যায়।",
      },
    ],
    relatedArticles: [
      { slug: "passport-fee", hub: "passport", title: "পাসপোর্ট ফি সম্পূর্ণ তালিকা" },
      { slug: "passport-application", hub: "passport", title: "নতুন পাসপোর্ট আবেদন নিয়ম" },
    ],
  },
  {
    id: "bank-job-circular",
    slug: "bangladesh-bank-job-circular",
    hub: "jobs",
    title: "বাংলাদেশ ব্যাংক নিয়োগ বিজ্ঞপ্তি: আবেদনের নিয়ম ও যোগ্যতা",
    excerpt: "বাংলাদেশ ব্যাংকের সাম্প্রতিক নিয়োগ বিজ্ঞপ্তি, আবেদনের যোগ্যতা ও শেষ তারিখ।",
    contentType: "job-circular",
    author: { id: "editorial", name: "BAYA Blog সম্পাদকীয় দল" },
    publishedAt: "2026-09-01",
    updatedAt: "2026-09-05",
    lastVerifiedAt: "2026-09-05",
    officialSource: { name: "বাংলাদেশ ব্যাংক", url: "https://www.bb.org.bd/" },
    featuredImage: { src: "/images/placeholder-jobs.svg", alt: "বাংলাদেশ ব্যাংক ভবন" },
    primaryTopic: "bangladesh-bank",
    tags: ["Bank Job", "বাংলাদেশ ব্যাংক"],
    body: [
      {
        type: "callout",
        variant: "info",
        title: "আবেদনের শেষ তারিখ",
        text: "অনলাইনে আবেদন করা যাবে আগামী ৩০ সেপ্টেম্বর পর্যন্ত।",
      },
      { type: "heading", level: 2, text: "শিক্ষাগত যোগ্যতা", id: "eligibility" },
      {
        type: "list",
        ordered: false,
        items: ["স্বীকৃত বিশ্ববিদ্যালয় থেকে স্নাতক/স্নাতকোত্তর ডিগ্রি", "বয়সসীমা: ৩০ বছরের মধ্যে"],
      },
      {
        type: "official-source",
        source: { name: "বাংলাদেশ ব্যাংক", url: "https://www.bb.org.bd/" },
      },
    ],
    relatedArticles: [
      { slug: "bank-job-admit-card", hub: "jobs", title: "ব্যাংক জবের প্রবেশপত্র ডাউনলোড নিয়ম" },
    ],
  },
];

export function getArticleBySlug(hub: string, slug: string): Article | undefined {
  return SAMPLE_ARTICLES.find((a) => a.hub === hub && a.slug === slug);
}

export function listArticlesByHub(hub: string): Article[] {
  return SAMPLE_ARTICLES.filter((a) => a.hub === hub);
}

export function listLatestArticles(limit = 6): Article[] {
  return [...SAMPLE_ARTICLES]
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
    .slice(0, limit);
}

export function listRelated(article: Article, limit = 4): Article[] {
  return SAMPLE_ARTICLES.filter(
    (a) => a.id !== article.id && a.primaryTopic === article.primaryTopic
  )
    .concat(SAMPLE_ARTICLES.filter((a) => a.id !== article.id && a.hub === article.hub))
    .filter((a, i, arr) => arr.findIndex((x) => x.id === a.id) === i)
    .slice(0, limit);
}

import type { HubSlug } from "@/config/site.config";

export type ContentType =
  | "news"
  | "job-circular"
  | "result"
  | "routine"
  | "admit-card"
  | "guide"
  | "how-to"
  | "service"
  | "notice"
  | "explainer";

export interface Author {
  id: string;
  name: string;
  title?: string;
}

export interface OfficialSource {
  name: string;
  url: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface DownloadItem {
  label: string;
  url: string;
  fileType: string;
}

export type ContentBlock =
  | { type: "heading"; level: 2 | 3; text: string; id: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | {
      type: "table";
      caption?: string;
      headers: string[];
      rows: string[][];
    }
  | { type: "callout"; variant: "info" | "warning" | "success"; title?: string; text: string }
  | { type: "steps"; steps: { title: string; text: string }[] }
  | { type: "official-source"; source: OfficialSource };

export interface RelatedArticleRef {
  slug: string;
  hub: HubSlug;
  title: string;
}

export interface Article {
  id: string;
  slug: string;
  hub: HubSlug;
  title: string;
  excerpt: string;
  contentType: ContentType;
  author: Author;
  publishedAt: string;
  updatedAt: string;
  lastVerifiedAt?: string;
  officialSource?: OfficialSource;
  featuredImage?: { src: string; alt: string };
  body: ContentBlock[];
  faq?: FAQItem[];
  downloads?: DownloadItem[];
  relatedArticles?: RelatedArticleRef[];
  primaryTopic?: string;
  tags?: string[];
}

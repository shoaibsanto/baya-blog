import type { CategorySlug } from "@/config/site.config";

export type ContentType =
  | "job-circular"
  | "job-result"
  | "admit-card"
  | "guide"
  | "notice";

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
  | { type: "checklist"; items: string[] }
  | { type: "official-source"; source: OfficialSource };

export interface RelatedArticleRef {
  slug: string;
  title: string;
}

/** One advertised position within a circular. */
export interface JobPosition {
  name: string;
  vacancy: string;
  salary?: string;
  qualification?: string;
  otherRequirements?: string;
}

export interface OrganizationInfo {
  name: string;
  website?: string;
  address?: string;
  phone?: string;
  email?: string;
}

/** Structured fields specific to a job-circular / job-result post, used for the summary box, summary table, and JobPosting schema. */
export interface JobCircularMeta {
  organization: OrganizationInfo;
  jobLocation: string;
  positionCategoryCount: string;
  totalVacancy: string;
  jobType: string;
  educationRequirement: string;
  /** Normalized qualification tags for filtering — see QUALIFICATIONS in site.config. Distinct from the free-text educationRequirement shown to readers. */
  qualificationLevels?: string[];
  ageLimit?: string;
  applicationFee?: string;
  applicationMethod: string;
  source?: string;
  noticeDate?: string;
  publishDate: string;
  deadline: string;
  positions?: JobPosition[];
  requiredDocuments?: string[];
  employmentType?:
    | "FULL_TIME"
    | "PART_TIME"
    | "CONTRACTOR"
    | "TEMPORARY"
    | "INTERN"
    | "OTHER";
}

export interface Article {
  id: string;
  slug: string;
  category: CategorySlug;
  /** Secondary categories this post also appears under (mirrors multi-category tagging on job boards). */
  additionalCategories?: CategorySlug[];
  title: string;
  excerpt: string;
  contentType: ContentType;
  author: Author;
  publishedAt: string;
  updatedAt: string;
  lastVerifiedAt?: string;
  officialSource?: OfficialSource;
  featuredImage?: { src: string; alt: string };
  circularImage?: { src: string; alt: string };
  body: ContentBlock[];
  faq?: FAQItem[];
  downloads?: DownloadItem[];
  relatedArticles?: RelatedArticleRef[];
  primaryTopic?: string;
  tags?: string[];
  job?: JobCircularMeta;
}

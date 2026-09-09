import { SITE } from "@/config/site.config";
import type { Article, FAQItem } from "@/types";
import { generateCanonical } from "./metadata";

const ORG_ID = `${SITE.url}/#organization`;
const WEBSITE_ID = `${SITE.url}/#website`;

/** Sitewide Organization schema — include once, in the root layout. */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
  };
}

/** Sitewide WebSite schema (enables the sitelinks searchbox) — include once, in the root layout. */
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE.url,
    name: SITE.name,
    publisher: { "@id": ORG_ID },
    inLanguage: "bn-BD",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function generateBreadcrumbSchema(items: { label: string; href?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: item.href ? generateCanonical(item.href) : undefined,
    })),
  };
}

export function generateArticleSchema(article: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.excerpt,
    author: { "@type": "Organization", name: article.author.name, "@id": ORG_ID },
    publisher: { "@id": ORG_ID },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    image: article.featuredImage ? [`${SITE.url}${article.featuredImage.src}`] : undefined,
    mainEntityOfPage: generateCanonical(article.slug),
    isPartOf: { "@id": WEBSITE_ID },
  };
}

/** JobPosting schema — the structured data type Google Jobs actually looks for on a circular page. */
export function generateJobPostingSchema(article: Article) {
  const job = article.job;
  if (!job) return null;

  const positions = job.positions?.length
    ? job.positions.map((p) => p.name).join(", ")
    : undefined;

  const isNationwide = /সারাদেশ|nationwide/i.test(job.jobLocation);
  const website = job.organization.website
    ? job.organization.website.startsWith("http")
      ? job.organization.website
      : `https://${job.organization.website}`
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: article.title,
    description: article.excerpt,
    identifier: {
      "@type": "PropertyValue",
      name: job.organization.name,
      value: article.slug,
    },
    datePosted: job.publishDate,
    validThrough: job.deadline,
    employmentType: job.employmentType ?? "OTHER",
    hiringOrganization: {
      "@type": "Organization",
      name: job.organization.name,
      sameAs: website,
    },
    // Nationwide branch-network postings: country-level Place, no fabricated city/addressLocality.
    jobLocation: {
      "@type": "Place",
      address: isNationwide
        ? { "@type": "PostalAddress", addressCountry: "BD" }
        : { "@type": "PostalAddress", addressLocality: job.jobLocation, addressCountry: "BD" },
    },
    totalJobOpenings: /^\d+$/.test(job.totalVacancy) ? Number(job.totalVacancy) : undefined,
    educationRequirements: job.educationRequirement,
    qualifications: positions,
    directApply: false,
  };
}

export function generateFAQSchema(items: FAQItem[]) {
  if (items.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

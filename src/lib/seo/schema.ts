import { SITE } from "@/config/site.config";
import type { Article, FAQItem } from "@/types";
import { generateCanonical } from "./metadata";

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
    author: { "@type": "Organization", name: article.author.name },
    publisher: { "@type": "Organization", name: SITE.name, url: SITE.url },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    image: article.featuredImage ? [`${SITE.url}${article.featuredImage.src}`] : undefined,
    mainEntityOfPage: generateCanonical(`${article.hub}/${article.slug}`),
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

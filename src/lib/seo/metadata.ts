import type { Metadata } from "next";
import { SITE, DEFAULT_OG_IMAGE } from "@/config/site.config";
import type { Article } from "@/types";

export function generateCanonical(path: string): string {
  const clean = path === "/" ? "/" : `/${path.replace(/^\/|\/$/g, "")}/`;
  return `${SITE.url}${clean}`;
}

export function generatePageMetadata({
  title,
  description,
  path,
  noindex = false,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  /** Set true only for the homepage: bypasses the "%s | BAYA Blog" template so the title isn't duplicated. */
  absoluteTitle?: boolean;
}): Metadata {
  const canonical = generateCanonical(path);
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE.name,
      locale: "bn_BD",
      type: "website",
      images: DEFAULT_OG_IMAGE ? [DEFAULT_OG_IMAGE] : undefined,
    },
    twitter: {
      card: DEFAULT_OG_IMAGE ? "summary_large_image" : "summary",
      images: DEFAULT_OG_IMAGE ? [DEFAULT_OG_IMAGE.url] : undefined,
    },
  };
}

export function generateArticleMetadata(article: Article): Metadata {
  const canonical = generateCanonical(article.slug);
  const image = article.featuredImage
    ? { url: article.featuredImage.src, alt: article.featuredImage.alt }
    : DEFAULT_OG_IMAGE;
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: canonical,
      siteName: SITE.name,
      locale: "bn_BD",
      type: "article",
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      images: image ? [image.url] : undefined,
    },
  };
}

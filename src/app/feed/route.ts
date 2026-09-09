/**
 * RSS/Atom feed — RULE 28: RSS/feed update on publish.
 * RULE 27: Sitemap architecture — feeds as discovery channels.
 */
import type { NextRequest } from "next/server";
import { listAllArticles } from "@/lib/content/articles";
import { SITE } from "@/config/site.config";
import { getCategory } from "@/config/site.config";

export const revalidate = 3600;

export async function GET() {
  const articles = listAllArticles().slice(0, 50);

  const items = articles
    .map(
      (a) => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${SITE.url}/${a.slug}/</link>
      <guid isPermaLink="true">${SITE.url}/${a.slug}/</guid>
      <description><![CDATA[${a.excerpt}]]></description>
      <category>${getCategory(a.category)?.name ?? a.category}</category>
      <pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
      <lastBuildDate>${new Date(a.updatedAt).toUTCString()}</lastBuildDate>
    </item>`,
    )
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${SITE.name}</title>
    <link>${SITE.url}</link>
    <description>${SITE.description}</description>
    <language>bn</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

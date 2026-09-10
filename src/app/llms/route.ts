/**
 * llms.txt — RULE (ARCHITECTURE.md): AI-crawler-specific accessibility.
 * Provides clean machine-readable summary for LLM crawlers.
 */
import { listAllArticles } from "@/lib/content/articles";
import { SITE } from "@/config/site.config";

export const revalidate = 3600;

export async function GET() {
  const articles = listAllArticles().slice(0, 30);

  const lines = [
    `# ${SITE.name}`,
    `> ${SITE.description}`,
    "",
    `URL: ${SITE.url}`,
    `Language: Bengali (bn-BD)`,
    `Type: Job information platform — Bangladeshi government, bank, private, and NGO job circulars`,
    "",
    "## Sections",
    "",
    "- Homepage: All latest job circulars with filters",
    "- Government Jobs: /category/government-jobs/",
    "- Bank Jobs: /category/bank-jobs/",
    "- Private Jobs: /category/private-jobs/",
    "- NGO Jobs: /category/ngo-jobs/",
    "- About: /about/",
    "- Contact: /contact/",
    "",
    "## Recent Job Circulars",
    "",
  ];

  for (const a of articles) {
    lines.push(`- [${a.title}](${SITE.url}/${a.slug}/) — ${a.excerpt}`);
  }

  lines.push("");
  lines.push("## About");
  lines.push(`BAYA Blog provides verified, original content about job circulars in Bangladesh.`);
  lines.push(`All information is sourced from official websites and verified against primary sources.`);
  lines.push(`No scraping — all content is independently created.`);

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

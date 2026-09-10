#!/usr/bin/env node
// Discovers new job-circular posts on bdgovtjob.net (used purely as a "a new circular
// exists" signal — see ARCHITECTURE.md "Pivot v2 / Automation" for why), extracts the
// structured facts from their page (numbers/dates/tables — not prose), generates
// original Bengali article content grounded in those facts, and writes one new JSON
// file per article under content-data/jobs/. Nothing here ever copies their sentences.
//
// Usage:
//   node scripts/discover-and-generate.mjs            # real run, calls Claude, writes files
//   node scripts/discover-and-generate.mjs --dry-run   # no API calls, no files written — just logs

import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { listLatestPosts, getPostContent, getCategorySlugMap } from "./lib/bdgovtjobClient.mjs";
import { extractFacts } from "./lib/extractFacts.mjs";
import { mapCategories } from "./lib/categoryMap.mjs";
import { generateArticleContent } from "./lib/generateArticle.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const JOBS_DIR = join(ROOT, "content-data", "jobs");
const STATE_FILE = join(ROOT, "content-data", ".discovery-state.json");
const DRY_RUN = process.argv.includes("--dry-run");
const MAX_STATE_IDS = 500;

function loadState() {
  if (!existsSync(STATE_FILE)) return { seenPostIds: [] };
  return JSON.parse(readFileSync(STATE_FILE, "utf-8"));
}

function saveState(state) {
  const trimmed = { seenPostIds: state.seenPostIds.slice(-MAX_STATE_IDS) };
  writeFileSync(STATE_FILE, JSON.stringify(trimmed, null, 2) + "\n", "utf-8");
}

function existingSlugs() {
  return new Set(readdirSync(JOBS_DIR).map((f) => f.replace(/\.json$/, "")));
}

function uniqueSlug(base, taken) {
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

/** Minimal, non-LLM stand-in for --dry-run so the pipeline's plumbing can be tested without an API key. */
function templateBody(facts) {
  return {
    title: `${facts.organization.name ?? "প্রতিষ্ঠান"} নিয়োগ বিজ্ঞপ্তি (dry-run খসড়া)`,
    excerpt: `${facts.organization.name ?? "প্রতিষ্ঠান"}-এ নিয়োগ বিজ্ঞপ্তি প্রকাশিত হয়েছে।`,
    tags: [],
    primaryTopic: (facts.organization.name ?? "org").toLowerCase().replace(/\s+/g, "-"),
    qualificationLevels: [],
    employmentType: "OTHER",
    requiredDocuments: [],
    body: [
      { type: "heading", level: 2, text: "পদ ও পদসংখ্যা", id: "positions" },
      { type: "official-source", source: { name: facts.organization.name, url: facts.organization.website } },
    ],
    faq: [],
  };
}

async function processPost(post, categorySlugMap, taken) {
  const sourceCategorySlugs = post.categories.map((id) => categorySlugMap.get(id)).filter(Boolean);
  const mapped = mapCategories(sourceCategorySlugs);
  if (!mapped) {
    console.log(`  skip (no job category): ${post.slug}`);
    return null;
  }

  const html = await getPostContent(post.id);
  const facts = extractFacts(html);

  if (!facts.organization.name || !facts.totalVacancy || !facts.deadline || !facts.publishDate) {
    console.log(`  skip (missing mandatory facts): ${post.slug}`);
    return null;
  }

  const slug = uniqueSlug(post.slug, taken);
  taken.add(slug);

  const generated = DRY_RUN ? templateBody(facts) : await generateArticleContent(facts, mapped.category);

  const article = {
    id: slug,
    slug,
    category: mapped.category,
    additionalCategories: mapped.additionalCategories,
    title: generated.title,
    excerpt: generated.excerpt,
    contentType: "job-circular",
    author: { id: "editorial", name: "BAYA Blog সম্পাদকীয় দল" },
    publishedAt: facts.publishDate,
    updatedAt: facts.publishDate,
    lastVerifiedAt: facts.publishDate,
    officialSource: facts.organization.website
      ? { name: facts.organization.name, url: facts.organization.website }
      : undefined,
    primaryTopic: generated.primaryTopic,
    tags: generated.tags,
    job: {
      organization: {
        name: facts.organization.name,
        website: facts.organization.website ?? undefined,
        address: facts.organization.address ?? undefined,
        phone: facts.organization.phone ?? undefined,
        email: facts.organization.email ?? undefined,
      },
      jobLocation: facts.jobLocation ?? "অনির্দিষ্ট",
      positionCategoryCount: facts.positionCategoryCount ?? String(facts.positions.length || 1),
      totalVacancy: facts.totalVacancy,
      jobType: mapped.category,
      educationRequirement: facts.educationRequirement ?? "বিজ্ঞপ্তি দেখুন",
      qualificationLevels: generated.qualificationLevels,
      ageLimit: facts.ageLimit ?? undefined,
      applicationFee: facts.applicationFee ?? undefined,
      applicationMethod: facts.applicationMethod ?? "বিজ্ঞপ্তি দেখুন",
      source: facts.source ?? undefined,
      memoNumber: facts.memoNumber ?? undefined,
      noticeDate: facts.noticeDate ?? undefined,
      publishDate: facts.publishDate,
      deadline: facts.deadline,
      employmentType: generated.employmentType,
      positions: facts.positions.length ? facts.positions : undefined,
      requiredDocuments: generated.requiredDocuments?.length ? generated.requiredDocuments : undefined,
    },
    body: generated.body,
    faq: generated.faq?.length ? generated.faq : undefined,
    automation: {
      discoveredFrom: post.link,
      discoveredAt: new Date().toISOString(),
      reviewed: false,
    },
  };

  return article;
}

async function main() {
  console.log(`Discovery run started${DRY_RUN ? " (--dry-run)" : ""} at ${new Date().toISOString()}`);

  const state = loadState();
  const seenIds = new Set(state.seenPostIds);
  const taken = existingSlugs();

  const [posts, categorySlugMap] = await Promise.all([listLatestPosts(20), getCategorySlugMap()]);

  const newPosts = posts.filter((p) => !seenIds.has(p.id));
  console.log(`Fetched ${posts.length} latest posts, ${newPosts.length} not seen before.`);

  let created = 0;
  for (const post of newPosts) {
    console.log(`Processing: ${post.title.rendered} (id ${post.id})`);
    try {
      const article = await processPost(post, categorySlugMap, taken);
      if (article) {
        if (!DRY_RUN) {
          writeFileSync(join(JOBS_DIR, `${article.slug}.json`), JSON.stringify(article, null, 2) + "\n", "utf-8");
        }
        console.log(`  ${DRY_RUN ? "[dry-run] would create" : "created"}: ${article.slug}.json`);
        created++;
      }
    } catch (err) {
      console.error(`  error processing post ${post.id}: ${err.message}`);
    }
    seenIds.add(post.id);
  }

  if (!DRY_RUN) saveState({ seenPostIds: [...seenIds] });
  console.log(`Done. ${created} article(s) ${DRY_RUN ? "would be " : ""}created.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

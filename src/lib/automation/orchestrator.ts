import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { randomUUID } from "node:crypto";
import { listLatestPosts, getPostContent, getCategorySlugMap, type SourcePost } from "./bdgovtjobClient";
import { extractFacts } from "./extractFacts";
import { mapCategories } from "./categoryMap";
import { generateArticleContent } from "./generateArticle";
import { commitFiles, type FileWrite } from "./githubCommit";
import type { Article } from "@/types";

const JOBS_DIR = join(process.cwd(), "content-data", "jobs");
const STATE_PATH = "content-data/.discovery-state.json";

interface DiscoveryState {
  /** postId -> last-seen state, used both to skip already-processed posts and to
   *  detect in-place edits to already-published circulars (deadline extensions etc.). */
  posts: Record<string, { slug: string; modified: string }>;
  generationSessionId: string | null;
}

function loadState(): DiscoveryState {
  const abs = join(process.cwd(), STATE_PATH);
  if (!existsSync(abs)) return { posts: {}, generationSessionId: null };
  const parsed = JSON.parse(readFileSync(abs, "utf-8"));
  // Older state files (before per-post modified-tracking) only had a flat
  // seenPostIds array — treat that as "no per-post tracking yet" rather than
  // crashing; the adopt-existing-slug safety net in runDiscovery repopulates
  // `posts` for anything that already has a content file.
  return {
    posts: parsed.posts ?? {},
    generationSessionId: parsed.generationSessionId ?? null,
  };
}

function existingSlugs(): Set<string> {
  if (!existsSync(JOBS_DIR)) return new Set();
  return new Set(readdirSync(JOBS_DIR).map((f) => f.replace(/\.json$/, "")));
}

function readExistingArticle(slug: string): Article | null {
  const path = join(JOBS_DIR, `${slug}.json`);
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf-8"));
}

function uniqueSlug(base: string, taken: Set<string>): string {
  if (!taken.has(base)) return base;
  let i = 2;
  while (taken.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

export interface RunResult {
  createdSlugs: string[];
  updatedSlugs: string[];
  skipped: { slug: string; reason: string }[];
  commitSha: string | null;
  timedOut: boolean;
}

/**
 * One full run: discover new + changed posts on bdgovtjob.net, generate/refresh
 * original content, and push everything as one commit. `timeBudgetMs` is the point
 * after which the loop stops *starting* new posts — Vercel's 300s Hobby-plan
 * ceiling is a hard `FUNCTION_INVOCATION_TIMEOUT` (no commit at all that run) if
 * exceeded, so this has to leave room for the single slowest remaining post PLUS
 * the final git commit step, not just "some" margin. Each post's own network calls
 * are capped too (20s for bdgovtjob.net, 110s for the LLM call — see
 * bdgovtjobClient.ts / generateArticle.ts), so 130,000ms here is sized as
 * (130s budget) + (~130s worst-case single post) + (~40s commit) ≈ 300s, not
 * padding pulled from nowhere. Anything not reached this run gets picked up the
 * next scheduled run, since state is only updated for posts actually processed.
 */
export async function runDiscovery({
  timeBudgetMs = 130_000,
  perPage = 50,
  dryRun = false,
}: { timeBudgetMs?: number; perPage?: number; dryRun?: boolean } = {}): Promise<RunResult> {
  const githubToken = process.env.GITHUB_TOKEN;
  if (!dryRun && !githubToken) throw new Error("GITHUB_TOKEN is not set — cannot commit results.");

  const startedAt = Date.now();
  const timeLeft = () => timeBudgetMs - (Date.now() - startedAt);

  const state = loadState();
  const taken = existingSlugs();
  const sessionId = state.generationSessionId ?? `baya-blog-discovery-${randomUUID()}`;

  const [posts, categorySlugMap] = await Promise.all([listLatestPosts(perPage), getCategorySlugMap()]);

  const createdSlugs: string[] = [];
  const updatedSlugs: string[] = [];
  const skipped: { slug: string; reason: string }[] = [];
  const filesToWrite: FileWrite[] = [];
  let timedOut = false;

  for (const post of posts) {
    if (timeLeft() < 0) {
      timedOut = true;
      break;
    }

    const seen = state.posts[String(post.id)];

    // Safety net for state files from before per-post modified-tracking existed
    // (or any other reason a post's file already exists but isn't tracked yet):
    // adopt the existing file as the tracked baseline instead of regenerating it
    // under a "-2" suffixed slug, which would otherwise duplicate the article.
    if (!seen && taken.has(post.slug)) {
      state.posts[String(post.id)] = { slug: post.slug, modified: post.modified };
      continue;
    }

    const isNew = !seen;
    const isModified = seen && seen.modified !== post.modified;
    if (!isNew && !isModified) continue; // unchanged, nothing to do

    try {
      const result = await processPost(post, categorySlugMap, taken, sessionId, seen?.slug);
      if (!result) {
        skipped.push({ slug: post.slug, reason: "no job category or missing mandatory facts" });
        continue;
      }
      filesToWrite.push({
        path: `content-data/jobs/${result.slug}.json`,
        content: JSON.stringify(result, null, 2) + "\n",
      });
      taken.add(result.slug);
      state.posts[String(post.id)] = { slug: result.slug, modified: post.modified };
      if (isNew) createdSlugs.push(result.slug);
      else updatedSlugs.push(result.slug);
    } catch (err) {
      skipped.push({ slug: post.slug, reason: (err as Error).message });
    }
  }

  state.generationSessionId = sessionId;

  let commitSha: string | null = null;
  if (filesToWrite.length > 0 && !dryRun) {
    filesToWrite.push({ path: STATE_PATH, content: JSON.stringify(state, null, 2) + "\n" });
    const summary = [...createdSlugs.map((s) => `+${s}`), ...updatedSlugs.map((s) => `~${s}`)].join(", ");
    commitSha = await commitFiles(
      githubToken!,
      filesToWrite,
      `chore: discover ${createdSlugs.length} new / ${updatedSlugs.length} updated job circular(s) [automated]\n\n${summary}\n\nCo-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`
    );
  }

  return { createdSlugs, updatedSlugs, skipped, commitSha, timedOut };
}

async function processPost(
  post: SourcePost,
  categorySlugMap: Map<number, string>,
  taken: Set<string>,
  sessionId: string,
  existingSlug: string | undefined
): Promise<Article | null> {
  const sourceCategorySlugs = post.categories.map((id) => categorySlugMap.get(id)).filter((s): s is string => Boolean(s));
  const mapped = mapCategories(sourceCategorySlugs);
  if (!mapped) return null;

  const html = await getPostContent(post.id);
  const facts = extractFacts(html);

  if (!facts.organization.name || !facts.totalVacancy || !facts.deadline || !facts.publishDate) {
    return null;
  }

  const existing = existingSlug ? readExistingArticle(existingSlug) : null;
  const slug = existing ? existing.slug : uniqueSlug(post.slug, taken);

  const generated = await generateArticleContent(facts, mapped.category, sessionId);

  const article: Article = {
    id: slug,
    slug,
    category: mapped.category,
    additionalCategories: mapped.additionalCategories,
    title: generated.title,
    excerpt: generated.excerpt,
    contentType: "job-circular",
    author: { id: "editorial", name: "BAYA Blog সম্পাদকীয় দল" },
    publishedAt: existing?.publishedAt ?? facts.publishDate,
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
    body: generated.body as Article["body"],
    faq: generated.faq?.length ? generated.faq : undefined,
    automation: {
      discoveredFrom: post.link,
      discoveredAt: existing?.automation?.discoveredAt ?? new Date().toISOString(),
      reviewed: false,
    },
  };

  return article;
}

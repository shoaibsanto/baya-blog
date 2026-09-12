# BAYA Blog — Architecture Proposal (Phase 1)

Status: **superseded by the Pivot v2 note below.** Phase 1 (§1 onward) documents the original 10-hub
"broad government information platform" concept and is kept for history — do not use it to justify the
current taxonomy or URL scheme; the Pivot v2 section is authoritative.
Domain: baya.blog · Stack: Next.js (App Router) + TypeScript + Tailwind CSS

---

## Pivot v2 — Job-Circular Platform (current, authoritative)

**Decision (approved 2026-09-09):** BAYA Blog pivoted from the original 10-hub "broad government services"
concept to a **job-circular-focused platform**, modeled on bdgovtjob.net's category taxonomy and per-post
content template, but built to be meaningfully better on UI/UX, structured data, and AI/crawler-friendliness
than the source site (which the user explicitly asked to exceed, not just match).

**What changed from Phase 1:**
- The 10-hub taxonomy (Jobs/Education/NID/Passport/Birth-Registration/etc.) is retired. Replaced by a
  **10-category job taxonomy** in `src/config/site.config.ts` (`CATEGORIES`): সরকারি চাকরি, ব্যাংক চাকরি,
  প্রাইভেট চাকরি, এনজিও চাকরি, ফার্মাসিউটিক্যালস চাকরি, গ্রুপ অব কোম্পানি চাকরি, বিশ্ববিদ্যালয় চাকরি, ডিফেন্স
  চাকরি, টেলিটক অনলাইন আবেদন, হট জবস. A post can belong to one primary `category` plus `additionalCategories`
  (mirrors bdgovtjob.net's multi-category tagging, e.g. a govt bank job also tagged হট জবস + টেলিটক).
- URLs are now **flat**: `/[slug]/` for articles (no category prefix, exactly like bdgovtjob.net's
  `/brdb-job-circular/`), `/category/[slug]/` for category archives. The old `/[hub]/[slug]/` structure is gone.
- Content model (`src/types/index.ts`) gained a `JobCircularMeta` (`job` field on `Article`): organization
  info, position table, vacancy/age/fee/deadline, required documents, qualification levels (for filtering).
  `ContentType` narrowed to job-relevant types only (`job-circular`, `job-result`, `admit-card`, `guide`,
  `notice`).
- Homepage (`src/app/page.tsx`) now has a **real, server-rendered filter bar** (category / qualification /
  deadline-window) via GET query params — filtered views are `noindex,follow` (canonical stays `/`) to avoid
  duplicate-content bloat, exactly the kind of thing rule "avoid thin/duplicate pages" is for.
- **Schema markup deliberately goes further than the source site**: bdgovtjob.net's job posts carry only
  Article + BreadcrumbList (verified by inspection 2026-09-09) — no JobPosting, no FAQPage, despite having FAQ
  content. BAYA Blog emits all four on every job-circular post: `Article`, `JobPosting` (proper Google-for-Jobs
  markup — `generateJobPostingSchema` in `src/lib/seo/schema.ts`), `BreadcrumbList`, and `FAQPage` when FAQ
  content exists. Sitewide `Organization` + `WebSite` (with `SearchAction`) schema renders once, on the
  homepage.
- **No star-rating/review widgets** were replicated from the source (it shows a "4.3/5 — 89 votes" widget with
  no visible review mechanism) — fabricating `AggregateRating` schema without real reviews is exactly the kind
  of fake-review pattern this project's own rules (§23, §41) forbid.
- **Share buttons** (Facebook, WhatsApp, X, Messenger, copy-link) were added on every article — the source site
  has none; the user explicitly asked for this regardless.
- **Logo is intentionally not used anywhere right now** (header is text-only "BAYA Blog") per explicit user
  request — brand assets from the earlier session remain in `public/brand/` for when the user wants them back.
  `DEFAULT_OG_IMAGE` in `site.config.ts` is `null`; featured/OG images are per-article-optional, used only when
  they'd actually help sharing/SEO, not forced.
- Sample content (`src/content/sample-articles.ts`) is **original placeholder text** demonstrating the full
  template (Krishi Bank, Sonali Bank, Square Group, BRAC, Rajshahi University) — organization names are real
  public institutions, but the circular details/numbers are invented examples, not copied from bdgovtjob.net's
  actual postings. Real content ingestion is still a future step.

**Still open / not yet done:**
- An Age Calculator utility (bdgovtjob.net has one) was scoped out of this pass — flagged as a nice-to-have,
  not core to the pivot.
- AI-crawler-specific accessibility (llms.txt / clean-markdown endpoints, per the `ai-markdown-rendering`
  skill) has not been added yet — worth doing given the user's "AI বট" friendliness ask.

*(Custom domain `baya.blog` is now connected to the Vercel project and live — resolved 2026-09-09.)*

---

## Automation Pipeline — Discovery + Original Generation (added 2026-09-10)

**Decision:** rather than manually publishing every job circular, a scheduled pipeline discovers new
postings on bdgovtjob.net and republishes an original, more complete BAYA Blog version automatically.

**Why bdgovtjob.net content is never copied, only used as a discovery signal:** bdgovtjob.net's own
prose/write-up is their copyrighted editorial content. Automatically scraping and "expanding" their
sentences at scale would be derivative use with real legal exposure, and it wouldn't actually make content
better — it would just be their content, padded. Instead, the pipeline treats bdgovtjob.net purely as *"a
new circular exists"* signal, and pulls only **structured facts** (organization name, vacancy counts,
dates, salary, position tables) out of their page — facts are not copyright-protected, only the specific
expression of them is. All prose (org description, eligibility explanation, prep tips, FAQ) is generated
fresh, grounded strictly in those facts, with an explicit instruction to the model to never invent a
number/date/name that wasn't supplied.

**Runs on Vercel Cron, not GitHub Actions (revised 2026-09-12).** The original design used a GitHub Actions
workflow on a 10-minute cron. In practice it failed intermittently (email notifications piling up for the
user) and the user explicitly asked to drop GitHub Actions entirely and run this the way Vercel's own free
Hobby-plan cron works instead: **once a day, at a fixed time**, doing a full day's worth of discovery +
generation + existing-content-refresh in one batch. Vercel Hobby allows up to **300 seconds per function
invocation** (checked directly against Vercel's docs before building this — see "Vercel Hobby function
limits" below), which is enough for a daily batch of a reasonable size but is a real ceiling: this is why the
design below is careful about time budgeting and about not losing partial progress.

**How it works (`src/lib/automation/*.ts`, invoked by `src/app/api/cron/discover-jobs/route.ts`, scheduled
in `vercel.json` at `0 15 * * *` = 21:00 Bangladesh time daily — change that cron string if a different time
is wanted, it's a one-line edit):**
1. **Discover** — bdgovtjob.net runs WordPress with a fully open REST API (`/wp-json/wp/v2/posts`,
   `/wp-json/wp/v2/categories`) — far more reliable than HTML scraping. `bdgovtjobClient.ts` lists the latest
   50 posts (covers a full day's volume with margin) including each post's `modified` timestamp.
2. **New vs. updated vs. unchanged** — `orchestrator.ts` compares each post against
   `content-data/.discovery-state.json`, which tracks `{ [postId]: { slug, modified } }`. Not seen before →
   new. Seen, but `modified` changed → **existing-content update** (e.g. a deadline extension edited into the
   original post) — re-extract and regenerate that article in place, preserving its original `publishedAt`
   and slug. Seen and unchanged → skipped, no API calls spent. There's also a one-time safety net: if a post
   isn't tracked yet but a content file with its slug already exists (state file predates per-post tracking,
   or any other reason), it's adopted as the tracked baseline instead of being regenerated under a `-2`
   suffixed slug — that dedup check matters, without it a stale state file would silently duplicate content.
3. **Category-gate** — `categoryMap.ts` maps their category slugs to ours (`government-jobs-circular` →
   `government-jobs`, etc.). Posts with no mapped job category (assignments, admit-card notices, exam-date
   posts, multi-circular roundup posts) are skipped entirely.
4. **Extract facts** — `extractFacts.ts` (cheerio) parses their `<table class="jc-table">` key/value markup
   (a WordPress custom template used consistently across their job-circular posts) to pull organization info,
   the summary table, and the per-position table as plain data. **Important gotcha found and fixed:** their
   HTML mixes NFC/NFD Unicode normalization for some Bengali conjuncts (e.g. "অফিশিয়াল"), which silently
   breaks exact-string label matching unless both the HTML and the label maps are `.normalize("NFC")`-ed
   first — done at the top of `extractFacts()`.
5. **Mandatory-fact gate** — if organization name, vacancy count, deadline, or publish date can't be
   extracted, the post is skipped rather than published with guessed data (verified against the live site:
   roughly 8 of the latest 20 posts have the full `jc-table` format at any given time; the rest are
   roundup/notice posts that correctly get skipped).
6. **Generate** — `generateArticle.ts` calls **OpenCode Go** (`opencode.ai/zen/go/v1`, model `mimo-v2.5`)
   with the extracted facts and a strict system prompt: never invent facts not given, never reuse
   bdgovtjob.net's sentences, and add sections they don't have (a "who this job suits" analysis, prep tips, an
   expanded 4–6 question FAQ) — this is what makes the result "1.5–2x" richer, not padding.
7. **Commit as one batch** — `githubCommit.ts` builds ONE git commit via the GitHub Git Data API (create
   blobs → tree → commit → move the `main` ref) covering every new/updated article file plus the refreshed
   state file, and pushes it. One commit per run (not one per file) means the day's batch triggers exactly
   one Vercel deployment, matching "সব একবারে আপডেট". This also sidesteps a real constraint: Vercel
   serverless functions have a read-only, ephemeral filesystem, so there's no local git checkout to commit
   from — writing has to go through GitHub's API directly, which is what this module does.

**Time budget — revised after a real `FUNCTION_INVOCATION_TIMEOUT` in production (2026-09-12).** The first
live test against `https://baya.blog/api/cron/discover-jobs` (once real env vars were set) worked correctly
— HTTP 200, one article created and committed, `timedOut: true` reported honestly because a backlog had
built up while the pipeline was broken. The *second* live run, clearing more of that backlog, got a genuine
504 `FUNCTION_INVOCATION_TIMEOUT` from Vercel — the original design only checked the time budget *between*
posts (`timeLeft() < 20_000`), so a single slow `generateArticleContent` call starting near the edge of the
240s internal budget could still run the whole invocation past Vercel's hard 300s ceiling, and a timeout kill
means **no commit at all** for that run, losing more progress than a plain early-stop would have. Fixed by
budgeting for the worst case explicitly rather than assuming calls are fast:
- `generateArticleContent()`'s fetch now has `signal: AbortSignal.timeout(110_000)` — the longest successful
  call observed in testing was ~90s; past 110s it's presumed hung and aborted, so the post gets caught by
  `processPost`'s try/catch and recorded in `skipped` instead of holding the function hostage.
- `bdgovtjobClient.ts`'s fetches get a 20s timeout too — a slow/hung request to the *source* site shouldn't
  be able to eat the run either.
- `timeBudgetMs` (when the loop stops *starting* new posts) dropped from 240,000 to **130,000ms** — sized as
  130s (budget) + ~130s (one worst-case remaining post: 20s fetch + 110s generation) + ~40s (commit) ≈ 300s,
  not an arbitrary smaller number.

Anything not reached in the window simply stays untouched in state and gets picked up on the *next* day's
run — nothing is lost, it's just delayed a day in an unusually busy news cycle (or while clearing an
accumulated backlog, as happened here). If a `FUNCTION_INVOCATION_TIMEOUT` shows up again, the fix is *not*
"raise timeBudgetMs" — it's "find which call has no timeout yet."

**LLM provider: OpenCode Go, deliberately, despite the fit not being perfect (2026-09-10 decision).**
OpenCode Go is the user's own personal $10/mo subscription, meant for interactive coding-agent sessions —
their docs state "traffic is monitored for abuse that degrades the experience for other users," which
describes a 10-minute unattended cron job pretty precisely. The user was told this explicitly (risk: the
subscription itself could get flagged/suspended) and chose to proceed anyway — respect that choice if asked
to touch this again, don't silently swap providers. Mitigations in place: a single stable
`x-opencode-session` ID is generated once and persisted in `content-data/.discovery-state.json`
(`generationSessionId`), reused across every run rather than minted fresh per call, and the User-Agent
(`baya-blog-discovery-bot/1.0`) identifies real bot traffic rather than disguising it.

**Model-specific quirks found during integration (mimo-v2.5 is a reasoning model):**
- It burns a large, variable number of tokens on hidden `reasoning` content before the actual answer —
  `max_tokens: 6000` truncated mid-generation (`finish_reason: "length"`) on a real facts payload;
  `max_tokens: 16000` completed reliably (used ~9.5k of it). `generateArticleContent()` treats any
  `finish_reason` other than `"stop"` as a hard failure (skip this post, don't publish truncated JSON).
- `temperature: 0` is required — without it, one test came back as a generic Persian-language tutorial on
  "how to create a JSON file," completely ignoring the actual instruction. With `temperature: 0` and a clear
  English-structured schema block, output has been reliable and well-grounded in testing (verified against
  real bdgovtjob.net facts: it correctly left `requiredDocuments` generic rather than inventing specifics
  the FACTS block didn't contain, and got every number/date right).
- Full model catalog available through this endpoint: `GET https://opencode.ai/zen/go/v1/models` — model
  IDs are lowercase (`mimo-v2.5`, not `MiMo-V2.5` as advertised on the marketing page).

**Setup required — three Vercel project environment variables (Settings → Environment Variables), none of
which any MCP tool available in this session could set directly, so this needs the user to add them by
hand:**
- `OPENCODE_API_KEY` — same OpenCode Go key as before (it had been stored as a GitHub Actions secret, which
  was deleted 2026-09-12 since Actions is no longer used at all here).
- `GITHUB_TOKEN` — a token with `contents: read/write` on `shoaibsanto/baya-blog`, used by `githubCommit.ts`
  to push the daily batch. A fresh fine-grained PAT scoped to just this repo is the cleaner option over
  reusing a broader-scope token.
- `CRON_SECRET` — any random string. Vercel automatically sends it as `Authorization: Bearer <value>` on
  cron-triggered requests once this env var exists; the route handler checks that header and 401s otherwise,
  which is what keeps `/api/cron/discover-jobs` from being a public "regenerate content" button for anyone
  who finds the URL.

**Vercel Hobby function limits (verified directly against Vercel's docs 2026-09-12, not assumed):** 300
seconds is both the default *and* the maximum duration on Hobby — there is no way to request more on this
plan (Pro/Enterprise get up to 800s standard, 1800s in beta). `maxDuration = 300` is set on the route.

**Local testing:** `npm run discover:local` runs the exact same `src/lib/automation/*` modules the deployed
route uses (not a separate reimplementation) — dry-run by default (no GitHub commit, but *does* call the
real LLM if `OPENCODE_API_KEY` is set, so it still costs real API usage — use it deliberately, not as a cheap
smoke test). Pass `--live` to also commit for real, exactly like production.

**Content provenance:** every auto-generated article carries an `automation: { discoveredFrom, discoveredAt,
reviewed: false }` field (not rendered to readers) — a hook for an editorial-review workflow later, and an
audit trail of what was auto-published vs. hand-written.

---

## Parallel-session merge (2026-09-10)

A separate session worked on this same repo concurrently with the automation-pipeline work above and pushed
directly to `main` before this session's push landed. That work was pulled in and reconciled rather than
overwritten — merge conflicts were in `src/content/sample-articles.ts` (their 9 expanded articles, since
converted into `content-data/jobs/*.json` — see "Content storage" above), `src/app/[slug]/page.tsx`, and
`src/app/sitemap.ts`. What that session added, now merged in:

- **Organization pages** (`/organization/`, `/organization/[slug]/`) and **qualification pages**
  (`/qualification/`, `/qualification/[slug]/`, only generated when ≥2 articles share a qualification level)
  — both backed by `src/lib/content/articles.ts`, a richer query layer (related-content scoring, link-graph /
  orphan detection, deadline-status classification) that sits on top of the `content-data/jobs/*.json` loader
  in `src/content/articles.ts`. Two content modules now exist on purpose: `@/content/articles` is the raw
  per-file loader (what the discovery pipeline writes to), `@/lib/content/articles` is the higher-level
  query layer built on it — don't collapse them into one without checking every consumer.
- **RSS feed** at `/feed` and an **llms.txt** (`public/llms.txt` static + `/llms` dynamic route) — the
  AI-crawler-accessibility item this doc had flagged as still-open.
- Font switched from Hind Siliguri to **SolaimanLipi** (loaded via `fonts.maateen.me`).
- All 5 original sample articles expanded to 800–1,200 words each; 4 new articles added covering the
  `job-result`, `admit-card`, and `guide`/`notice` content types (which the type system already supported).
- `about`/`contact` pages, a `DeadlineBadge` component, and stable Bengali→English org-slug mapping
  (`ORG_SLUG_MAP` in `src/lib/content/articles.ts` — extend this map by hand for any organization name that
  doesn't romanize cleanly; don't rely purely on the slugify fallback for Bengali names).
- Two small display bugs fixed during the merge: article/organization counts rendered in Latin digits instead
  of Bengali (`toBnNumber()` was missing in a few spots), and one page showed a raw category slug instead of
  its Bengali name.

---

## Phase 1 (historical — superseded, kept for reference only)

**Approved decisions (Phase 1, no longer in effect):**
- Slugs are English/transliterated (`/education/ssc-result/`); all visible titles, UI copy, and content stay Bengali.
- 10-hub taxonomy from §1 is locked, including the merged শিক্ষা ও ফলাফল hub and the new প্রবাসী সেবা hub.

---

## 1. Recommended Information Architecture

Ten top-level hubs instead of thirteen thin ones — merged by search-intent overlap and to keep the header navigation short (rule #31/#54: no tag/category spam):

1. **চাকরি** (Jobs) — circulars, application guides, admit cards, job results, org-specific pages (BPSC, Bank Jobs, Primary Teacher, etc.)
2. **শিক্ষা ও ফলাফল** (Education & Results) — merges "শিক্ষা" + "পরীক্ষার ফলাফল" + "পরীক্ষার রুটিন" + "Admit Card" for education, because SSC/HSC result, routine, and admit card share one audience and one topic tree (SSC hub, HSC hub, University Admission hub)
3. **এনআইডি** (NID)
4. **পাসপোর্ট** (Passport)
5. **জন্মনিবন্ধন ও নাগরিক সনদ** (Birth Registration & Certificates)
6. **সরকারি সেবা** (Government Services — catch-all for services not big enough to be their own hub: trade license, TIN, land records, etc.)
7. **সরকারি ফরম ও আবেদন** (Forms & Application Guides)
8. **ভাতা ও সুবিধা** (Allowances & Benefits)
9. **প্রবাসী সেবা** (Expatriate/NRB services — visa, remittance, embassy — high search volume for BD, not in the original list but a natural cluster; flag for approval, can be deferred to "অন্যান্য" if out of scope)
10. **অন্যান্য** (Other)

Each hub = a **Topic Hub page** (`/jobs/`, `/education/`, `/nid/`, `/passport/`, …) that is a real content page (intro, latest articles, sub-topic links, FAQ), not a bare archive. Sub-topics (SSC, HSC, BPSC, individual boards) get their own hub page one level under the parent only when there is enough recurring content to justify it (rule #54) — otherwise they stay as tags/filters inside the parent hub, non-indexable until they earn a dedicated page.

**Decision needed from you:** confirm the 10-hub list above (esp. merging Education+Results+Routine+AdmitCard into one hub, and adding/dropping "প্রবাসী সেবা") before it's frozen — URLs derived from it are meant to be permanent (rule #7).

## 2. Recommended URL Architecture

```
/                                    homepage
/jobs/                                topic hub
/jobs/bpsc/                           sub-topic hub (only when volume justifies it)
/jobs/bangladesh-bank-job-circular-2026/   article
/education/                          topic hub
/education/ssc-result/               article (evergreen, updated in place year over year — see §11)
/education/hsc-routine-2026/         article
/nid/nid-correction/                 article
/passport/passport-renewal/          article
/birth-registration/                 topic hub
/government-services/                topic hub
/forms/                              topic hub
/benefits/                           topic hub
/search/?q=...                       search (noindex, see §9)
/category/[hub]/page/[n]/            pagination
```

Rules applied: flat `/hub/slug/` (2 levels max, per rule #7), no dates in URL, slugs in **Bengali-friendly transliteration or English** (decision needed — see risks), one canonical URL per concept — a result page for "SSC Result 2026" reuses the same `/education/ssc-result/` URL every year rather than spawning `ssc-result-2026`, `ssc-result-2026-new`, etc. (rule #42).

## 3. Content Model

Core entity: **Article**

| Field | Notes |
|---|---|
| id, slug, title, excerpt | slug immutable once published |
| contentType | `news` \| `job-circular` \| `result` \| `routine` \| `admit-card` \| `guide` \| `how-to` \| `service` \| `notice` \| `explainer` — each renders via a type-specific template, not one generic layout (rule #8) |
| category (hub), subTopic | subTopic optional, only for hubs with sub-pages |
| tags[] | entity tags only (org names, exam names) — not auto-generated per keyword (rule #55) |
| primaryTopic, relatedTopics[] | drives the content-graph (§5) |
| author, publishedAt, updatedAt, lastVerifiedAt | freshness system (§11) |
| officialSource { name, url } | required for anything result/circular/service-related (rule #41) |
| featuredImage { src, alt, ogImage } | |
| body | structured content blocks, see §6 |
| toc (derived from H2/H3), faq[], relatedArticleIds[], downloads[] | |
| status | draft → review → published → updated → archived (rule #44) |

Supporting entities: **Category/Hub**, **Author**, **Organization** (BPSC, Ministry of X — reusable across articles for the content graph), **Exam** (SSC, HSC, BCS — links results/routines/admit-cards for the same exam together).

## 4. Internal Linking Architecture

Three link layers, all required (rule #18 explicitly forbids relying only on a related-posts widget):

1. **Structural** — Homepage → Hub → (Sub-topic) → Article, and breadcrumb back-links, guaranteed by navigation + sitemap generation.
2. **Contextual in-body links** — content blocks can embed inline links to sibling articles by `primaryTopic`/`Exam`/`Organization` id (e.g., an SSC Result article's body auto-suggests slots for "SSC Marksheet", "Board Challenge", "Result by SMS" links; editors fill them in — not auto-injected without review, to avoid rule #21's "duplicate/keyword-stuffed" trap).
3. **Related Articles component** — algorithmic, see §20 of the brief: same `primaryTopic` > same `Exam`/`Organization` > same category > shared tags > manual override.

A **link-graph validator** (dev script) walks every published article and flags: orphans (zero inbound links), dead internal links, articles with fewer than N outbound contextual links. Runs locally now, wired into CI later (rule #49/#50).

## 5. Topic/Entity Model

Graph nodes: `Article`, `Hub/Topic`, `Organization`, `Exam`, `Service`. Edges: `belongsTo` (article→hub), `partOf` (sub-topic→hub), `sameExam`/`sameOrg` (article↔article via shared entity id), `relatedTo` (manual/algorithmic), `supersedes` (updated article → old version, for redirects instead of duplicate pages).

Practically: `Exam` and `Organization` are just typed lookup tables that articles reference by id — this is what lets "all SSC-related articles" or "all BPSC-related articles" be queried and cross-linked without hardcoding lists per page.

## 6. SEO Architecture

- Centralized `lib/seo/` utilities: `generateMetadata()`, `generateArticleMetadata()`, `generateBreadcrumbSchema()`, `generateArticleSchema()`, `generateFAQSchema()`, `generateCanonical()` — every page calls these, nothing hardcoded per-route (rule #48).
- Canonical rules: strip query params/pagination noise, enforce single trailing-slash convention, force https + apex-or-www (pick one, stays fixed).
- JSON-LD: `Article`/`NewsArticle` (by contentType), `BreadcrumbList` on every indexable page, `FAQPage` only when the visible FAQ block is non-empty, `WebSite`+`Organization` sitewide, `ItemList` on hub pages.
- Sitemaps: segmented (`sitemap-posts-N.xml`, `sitemap-hubs.xml`) behind a `sitemap-index.xml`, generated from the same content source used to render pages (no drift). Search (`/search/`) and thin tag pages excluded/noindexed.
- Freshness fields (`updatedAt`, `lastVerifiedAt`) feed both the UI ("সর্বশেষ আপডেট") and `dateModified` in schema.

## 7. Component Architecture

```
components/
  layout/        Header, Footer, MobileNav, Breadcrumb
  article/        ArticleHeader, TOC, ArticleBody (renderer), FAQBlock, RelatedArticles,
                  InfoBox(Important/Warning/OfficialSource), StepByStep, InfoTable,
                  ComparisonTable, Checklist, DownloadCard, KeyInfoBox
  hub/            HubIntro, HubArticleList, HubTopicLinks
  home/           Hero+Search, LatestByCategory, PopularGuides
  ui/             Button, Card, Badge, Alert, Table (design-system primitives, §33)
```

Content renderer (`lib/render/renderBlocks.tsx`) maps structured content blocks → semantic HTML, so one engine serves every contentType template instead of one monolithic article component (rule #36).

## 8. Recommended Next.js Folder Structure

```
baya-blog/
  src/
    app/
      (site)/
        page.tsx                     home
        [hub]/page.tsx                hub listing + intro
        [hub]/[slug]/page.tsx         article
        [hub]/page/[page]/page.tsx    pagination
        search/page.tsx
        sitemap.xml/route.ts (or sitemap.ts using next's sitemap API)
        robots.ts
      not-found.tsx
    components/        (as above)
    content/            content-source adapter layer (see §9)
    lib/
      seo/
      render/
      linking/            related-articles algorithm, link-graph validator
      content/            data-access functions (getArticle, getHubArticles, ...)
    data/               local content during early build (MDX or JSON) until CMS lands
    types/              Article, Hub, Author, Organization, Exam, SEOMeta, ContentBlock, FAQ, Table, Media, Source
    config/             site.config.ts (nav, hub list, taxonomy)
```

Everything for this project stays inside this one `baya-blog/` folder, as requested — no files touch the rest of `Desktop/AA`.

## 9. Database/CMS Abstraction Strategy

`content/` is the only layer allowed to know where data physically lives. It exposes a fixed interface (`getArticleBySlug`, `listArticlesByHub`, `listRelated`, `search`, …) that `app/` and `components/` call. Phase 1 build uses local MDX/JSON files behind this interface; swapping to a headless CMS (Sanity/Strapi) or a database later means rewriting only `content/`, not the UI or SEO layers (rule #35).

## 10. Homepage Wireframe

```
[ Header: logo | Jobs Education NID Passport ... | search icon ]
[ Hero: short tagline + prominent search bar ]
[ Latest / Important updates strip (3-4 cards, freshness-sensitive content first) ]
[ Popular categories grid (10 hub cards) ]
[ Latest Job Circulars  →  see all ]
[ Latest Education/Results  →  see all ]
[ Popular Guides (evergreen: passport, NID, birth reg.) ]
[ Recently updated articles ]
[ Footer: hub links, about, contact, sitemap link ]
```

## 11. Article Page Wireframe

```
Breadcrumb: হোম > হাব > আর্টিকেল
H1
Key Info Box (critical facts: date/fee/deadline — above the fold)
Meta: প্রকাশ/আপডেট/যাচাই তারিখ · লেখক · reading time
Table of Contents (mobile: collapsible)
Body (headings, tables, steps, callouts, contextual internal links)
Official Source block
FAQ
Related Articles
"সর্বশেষ আপডেট" footer strip
```

## 12. Mobile UX Strategy

Mobile-first Tailwind breakpoints tested at 320/360/375/390/412/768/1024/1280. Sticky elements (TOC toggle, header) capped in height and never obstruct content. Tables wrap in a horizontally-scrollable container with visible scroll affordance, never shrunk to unreadable font sizes. Touch targets ≥44px. No hover-dependent UI.

## 13. Performance Strategy

Server Components by default; client components only for interactive leaves (TOC scroll-spy, mobile menu, search box). Static generation for hub/article pages with ISR for freshness-sensitive content types (job circulars, results). Images via `next/image`, lazy-loaded except the featured image. No heavy UI kit — Tailwind + hand-built primitives only. Fonts: one Bengali variable font + system fallback, `font-display: swap`, minimal weights.

## 14. Scalability Strategy

Adding articles never requires new routes or redesign because routing is `[hub]/[slug]` generically, not per-topic hardcoded pages. New hubs are additive config (`config/site.config.ts` taxonomy entry), not new route trees. Programmatic pages (rule #56, e.g. "SSC Result by Board") are generated from a data table + one template — only enabled once real per-board content exists, not mass-stubbed. Link-graph and SEO-quality-gate scripts scale by walking the content index, not the file tree size.

## 15. Development Roadmap

1. **Architecture** (this document) — approve taxonomy, URL scheme, content model.
2. **Design system** — Tailwind config (colors/type/spacing), core UI primitives, article components (static, no real content yet).
3. **Core pages** — homepage, hub page, article page, search, 404 — wired to placeholder/local MDX content.
4. **SEO infrastructure** — metadata utils, sitemap, robots, JSON-LD, breadcrumbs, canonical handling.
5. **Content engine** — finalize Article/Hub/Author/Organization/Exam types, related-articles algorithm, content renderer, link-graph validator.
6. **QA** — mobile/desktop pass, Lighthouse, broken-link check, then first real content batch.

---

## Architectural Risks / Contradictions to Resolve Before Coding

1. ~~**Bengali vs. English slugs**~~ — **Resolved:** English/transliterated slugs, Bengali visible titles.
2. ~~**10 hubs vs. the brief's literal 13**~~ — **Resolved:** merged 10-hub taxonomy approved, including প্রবাসী সেবা.
3. **Search page indexability** — rule #17 wants a search UX; rule #21 forbids thin/duplicate pages. Resolution: `/search/` is `noindex,follow`, not in sitemap.
4. **Topic hub vs. tag threshold** — rule #54 says index topic pages "only when they represent meaningful search demand" — this requires an editorial decision per sub-topic, not a rule the code can fully automate. Recommend a manual `indexable: boolean` flag on sub-topics, defaulted `false` until content justifies it.
5. **CMS choice deferred** — brief explicitly wants CMS-agnostic architecture; no CMS decision is being made now, by design (§9).
6. **"প্রবাসী সেবা" hub** — not in the original 13, but a very high-volume BD search category (visa, remittance). Proposing to add it; tell me if it should be folded into "সরকারি সেবা" instead.

---

### What I need from you to move to Phase 2
- Sign off on the 10-hub taxonomy (§1) and the risk items above (especially #1 and #2, since URLs are meant to be permanent).
- Confirm project stays entirely inside `Desktop/AA/baya-blog/` (done — folder created).

Once approved, Phase 2 (design system) starts inside this same folder.

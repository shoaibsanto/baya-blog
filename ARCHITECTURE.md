# BAYA Blog — Architecture Proposal (Phase 1)

Status: **approved** — decisions below are locked. Phase 2 (design system) in progress.
Domain: baya.blog · Stack: Next.js (App Router) + TypeScript + Tailwind CSS

**Approved decisions:**
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

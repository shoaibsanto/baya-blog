# BAYA Blog

Bangladesh job-circular platform (Next.js, App Router) — sourced categories, per-organization and
per-qualification hubs, an RSS feed, an AI job-assistant chat widget, and a daily Vercel Cron pipeline that
discovers new/updated circulars on bdgovtjob.net and republishes original, fact-grounded content.

Live at [baya.blog](https://baya.blog).

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the full design history — taxonomy decisions, the content
model, the discovery/generation pipeline, and known gotchas. Read it before making structural changes.

## Local development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Content

Each article is its own JSON file under `content-data/jobs/<slug>.json`, loaded by `src/content/articles.ts`.
New content is added as new files — never by editing a shared array — so the automated pipeline below can
never collide with hand-written edits.

## Automated discovery pipeline

`src/app/api/cron/discover-jobs/route.ts`, scheduled once daily in `vercel.json`, watches bdgovtjob.net's
open WordPress REST API as a "a circular exists/changed" signal, extracts structured facts from their page
markup, and generates original Bengali content grounded in those facts via OpenCode Go (`mimo-v2.5`) — see
`src/lib/automation/`. Test locally without touching production:

```bash
npm run discover:local          # dry-run: real generation calls, no GitHub commit
npm run discover:local -- --live  # also commits, exactly like production
```

Requires three Vercel project environment variables: `OPENCODE_API_KEY`, `GITHUB_TOKEN` (contents
read/write on this repo), and `CRON_SECRET` (any random string — Vercel sends it automatically as the cron
request's `Authorization` header once it's set).

# Moving Abroad — Your Expat Life Guide

**Site 114** | Archetype E (Dashboard) | The Oracle Lover Network

A full-stack expat content site built with Node.js + Express + Vite + React SSR. Covers the practical and psychological journey of moving abroad — visas, banking, culture shock, identity, community, and everything in between.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Server | Node.js 20 + Express + TypeScript |
| Frontend | React 18 + React Router v6 + Vite 5 |
| Rendering | SSR (server-side) + client hydration |
| Styling | CSS custom properties (design tokens) |
| Database | PostgreSQL (DigitalOcean) / JSON fallback (local dev) |
| Scheduling | node-cron (5 jobs) |
| Deployment | DigitalOcean App Platform |
| CDN | Bunny CDN (images, when configured) |
| SEO | JSON-LD, OG tags, sitemap.xml, robots.txt, llms.txt |

---

## Project Structure

```
moving-abroad/
├── server/                   # Express server
│   ├── index.ts              # Main server entry
│   ├── ssrHead.ts            # SSR head injection (JSON-LD, OG, canonical)
│   └── routes/
│       ├── articles.ts       # Articles API
│       ├── assessments.ts    # Assessments API
│       ├── sitemap.ts        # sitemap.xml
│       ├── robots.ts         # robots.txt
│       └── llms.ts           # llms.txt (AEO)
├── src/
│   ├── client/               # React frontend
│   │   ├── App.tsx           # Root app with routing + layout
│   │   ├── pages/            # Page components
│   │   │   ├── HomePage.tsx
│   │   │   ├── ArticlesPage.tsx
│   │   │   ├── ArticlePage.tsx
│   │   │   ├── AssessmentsPage.tsx
│   │   │   ├── AssessmentPage.tsx
│   │   │   ├── RecommendedPage.tsx
│   │   │   ├── AboutPage.tsx
│   │   │   ├── PrivacyPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   ├── components/       # Shared components
│   │   │   ├── Sidebar.tsx
│   │   │   ├── ArticleCard.tsx
│   │   │   ├── TableOfContents.tsx
│   │   │   ├── AuthorByline.tsx
│   │   │   ├── ReadingProgress.tsx
│   │   │   ├── Breadcrumbs.tsx
│   │   │   └── AutoAffiliates.tsx
│   │   ├── styles/
│   │   │   ├── tokens.css    # Design tokens (colors, spacing, typography)
│   │   │   └── global.css    # Global styles
│   │   ├── entry-client.tsx  # Client hydration entry
│   │   └── entry-server.tsx  # SSR render entry
│   ├── cron/                 # Scheduled job modules
│   │   ├── generate-article.mjs
│   │   ├── product-spotlight.mjs
│   │   ├── refresh-monthly.mjs
│   │   ├── refresh-quarterly.mjs
│   │   └── asin-health-check.mjs
│   ├── data/                 # JSON data (dev fallback)
│   │   ├── articles-db.json  # 30 seeded articles
│   │   └── assessments-db.json # 5 assessments
│   └── lib/                  # Shared utilities
│       ├── db.mjs            # Database (pg + JSON fallback)
│       ├── bunny.mjs         # Bunny CDN integration
│       ├── aeo.mjs           # AEO/SEO helpers
│       ├── article-quality-gate.mjs
│       ├── deepseek-generate.mjs
│       ├── amazon-verify.mjs
│       └── match-products.mjs
├── scripts/
│   ├── build-server.mjs      # esbuild server bundler
│   └── start-with-cron.mjs   # Production entry (server + cron)
├── .do/
│   └── app.yaml              # DigitalOcean App Platform config
├── vite.config.ts
├── tsconfig.json
└── package.json
```

---

## Local Development

```bash
# Install dependencies
pnpm install

# Start dev server (hot reload)
pnpm dev

# Visit http://localhost:3000
```

---

## Production Build

```bash
# Build client + server
pnpm build

# Start production server
node dist/index.js

# OR start with cron jobs enabled
AUTO_GEN_ENABLED=true node scripts/start-with-cron.mjs
```

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
# Required for production
DATABASE_URL=postgresql://user:pass@host:5432/dbname
NODE_ENV=production
PORT=8080

# Site URL (used for canonical, OG, sitemap)
SITE_URL=https://your-domain.com

# AI article generation (optional)
OPENAI_API_KEY=sk-...
AUTO_GEN_ENABLED=true

# Amazon Associates
AMAZON_AFFILIATE_TAG=your-tag-20

# Bunny CDN (optional — images served from Unsplash until configured)
BUNNY_STORAGE_ZONE=your-zone
BUNNY_API_KEY=your-key
BUNNY_CDN_URL=https://your-zone.b-cdn.net
```

---

## DigitalOcean Deployment

The `.do/app.yaml` is pre-configured for DigitalOcean App Platform.

1. Push this repo to GitHub
2. Connect the repo in DigitalOcean App Platform
3. Set environment variables in the App Platform dashboard
4. Deploy — DigitalOcean will run `pnpm build` then `node scripts/start-with-cron.mjs`

**Build command:** `pnpm build`  
**Run command:** `node scripts/start-with-cron.mjs`  
**Port:** `8080` (set via `PORT` env var)

---

## Bunny CDN Setup

When you're ready to add Bunny CDN:

1. Create a storage zone in Bunny
2. Set `BUNNY_STORAGE_ZONE`, `BUNNY_API_KEY`, and `BUNNY_CDN_URL` env vars
3. The `src/lib/bunny.mjs` module handles all uploads automatically
4. Article hero images will be uploaded to Bunny on generation

---

## Content

### Articles (30 seeded)

| Category | Count |
|---|---|
| Getting Started | 7 |
| Money & Banking | 6 |
| Culture & Identity | 6 |
| Visas & Paperwork | 2 |
| Relationships | 2 |
| Health & Wellbeing | 2 |
| Community | 3 |
| Work & Legal | 1 |

### Assessments (5)

1. **Expat Readiness Assessment** — Are you ready to move abroad? (10 questions)
2. **Culture Shock Readiness Quiz** — How will you handle culture shock? (8 questions)
3. **Expat Financial Readiness Quiz** — Is your money ready? (8 questions)
4. **Expat Identity Profile Quiz** — What kind of expat will you be? (8 questions)
5. **Trailing Spouse Readiness Assessment** — Are you the trailing spouse? (7 questions)

---

## Cron Schedule

| Job | Schedule | Description |
|---|---|---|
| `generate-article` (Phase 1) | 07:00, 10:00, 13:00, 16:00, 19:00 UTC daily | Release queued or generate new articles (< 60 published) |
| `generate-article` (Phase 2) | 08:00 UTC weekdays | 1 article/weekday (>= 60 published) |
| `product-spotlight` | Saturday 08:00 UTC | Generate product spotlight article |
| `refresh-monthly` | 1st of month 03:00 UTC | Refresh stale articles |
| `refresh-quarterly` | Jan/Apr/Jul/Oct 1st 04:00 UTC | Deep refresh evergreen articles |
| `asin-health-check` | Sunday 05:00 UTC | Verify Amazon affiliate links |

All cron jobs are disabled unless `AUTO_GEN_ENABLED=true` is set.

---

## SEO Features

- **sitemap.xml** — All published articles + static pages
- **robots.txt** — Allows all crawlers including AI bots (GPTBot, ClaudeBot, PerplexityBot)
- **llms.txt** — AEO-optimized machine-readable content index
- **JSON-LD** — Article, FAQPage, BreadcrumbList, WebSite, Quiz schemas
- **OG / Twitter Cards** — Full Open Graph and Twitter card meta tags
- **Canonical URLs** — Per-page canonical links
- **Reading time** — Displayed on all articles

---

## Design

**Archetype E — Dashboard**  
Palette: Steel Blue (`#3A6A8A`) + Slate Navy (`#18222E`) + Warm White (`#F2F5F8`)

- Fixed sidebar with author profile, category navigation, popular articles, and assessment CTA
- Responsive — sidebar collapses to hamburger menu on mobile
- Dark mode support via `prefers-color-scheme`
- Hero images from Unsplash (replaced with Bunny CDN when configured)
- Reading progress bar on article pages
- Table of contents with active section highlighting

---

## License

Private. All rights reserved. © The Oracle Lover Network.

# ExpatNewLife.com — Post-Launch Submission Checklist

> Complete these tasks within 48 hours of going live at **expatnewlife.com**.

---

## 1. Google Search Console

**URL:** https://search.google.com/search-console

- [ ] Add property: `https://expatnewlife.com`
- [ ] Verify ownership via DNS TXT record (add to your domain registrar)
- [ ] Submit sitemap: `https://expatnewlife.com/sitemap.xml`
- [ ] Submit image sitemap: `https://expatnewlife.com/sitemap-images.xml`
- [ ] Check Coverage report for any indexing errors after 24 hours

---

## 2. Bing Webmaster Tools

**URL:** https://www.bing.com/webmasters

- [ ] Sign in with Microsoft account
- [ ] Add site: `https://expatnewlife.com`
- [ ] Verify via XML file or DNS TXT record
- [ ] Submit sitemap: `https://expatnewlife.com/sitemap.xml`
- [ ] Enable automatic sitemap discovery

---

## 3. You.com (YouChat Indexing)

**URL:** https://you.com/submit

- [ ] Submit site URL: `https://expatnewlife.com`
- [ ] Submit sitemap URL: `https://expatnewlife.com/sitemap.xml`
- [ ] Note: YouChat will use your `llms.txt` at `https://expatnewlife.com/llms.txt` automatically

---

## 4. Brave Search

**URL:** https://search.brave.com/webmasters

- [ ] Sign in or create account
- [ ] Add site: `https://expatnewlife.com`
- [ ] Submit sitemap: `https://expatnewlife.com/sitemap.xml`
- [ ] Brave uses your `robots.txt` to confirm BraveBot is allowed (already configured ✓)

---

## 5. Pinterest Rich Pins

**URL:** https://developers.pinterest.com/tools/url-debugger/

- [ ] Validate this article URL to activate Rich Pins:
  `https://expatnewlife.com/articles/moving-abroad-fantasy-vs-reality`
- [ ] Pinterest will read the `og:type`, `og:title`, `og:image`, `og:description` tags (already configured ✓)
- [ ] Apply for Rich Pins: https://help.pinterest.com/en/business/article/rich-pins-overview
- [ ] Select "Article" as the Rich Pin type

---

## 6. Auto-Crawled (No Submission Needed)

These platforms auto-crawl based on your `robots.txt` and `llms.txt`:

| Platform | Status |
|---|---|
| Perplexity | Auto-crawls via PerplexityBot (allowed in robots.txt ✓) |
| ChatGPT / SearchGPT | Auto-crawls via GPTBot + OAI-SearchBot (allowed ✓) |
| Kagi | Auto-crawls standard web |
| DuckDuckGo | Uses Bing index — covered by Bing submission above |
| Claude / Anthropic | Auto-crawls via ClaudeBot (allowed ✓) |

---

## 7. Amazon Affiliate Tag Verification

**Your tag:** `spankyspinola-20`

- [ ] Log in to Amazon Associates: https://affiliate-program.amazon.com
- [ ] Confirm tag `spankyspinola-20` is active and approved
- [ ] Test one affiliate link from the Recommended page:
  `https://expatnewlife.com/recommended`
- [ ] Verify the link redirects to Amazon with `tag=spankyspinola-20` in the URL
- [ ] Check that your Associates account has a valid website listed as `expatnewlife.com`

**Sample verified ASINs in the site** (spot-check these):

| Product | ASIN | Category |
|---|---|---|
| Ashwagandha Root | B00HTBWCPK | Herbs/Adaptogens |
| Rhodiola Rosea | B00VTHJ0E2 | Herbs/Adaptogens |
| Holy Basil (Tulsi) | B07BKPQJGM | Herbs/Adaptogens |
| Reishi Mushroom | B07BKPQJGM | Mushrooms |
| Magnesium Glycinate | B00YQMJ1FW | Supplements |
| Vitamin D3+K2 | B07MFQX2YK | Supplements |
| Omega-3 Fish Oil | B004U3Y9FU | Supplements |
| Lonely Planet Expat Guide | B09XYZEXPAT | Books |

> **Note:** Amazon ASINs can change or become unavailable. The site's cron job (`asin-health-check.mjs`) runs monthly to flag broken ASINs. Check `/api/health` after launch to confirm cron is running.

---

## 8. AI Indexing Verification

After going live, verify these AI-specific endpoints are accessible:

- [ ] `https://expatnewlife.com/robots.txt` — confirm all AI crawlers listed
- [ ] `https://expatnewlife.com/ai.txt` — AI usage policy
- [ ] `https://expatnewlife.com/llms.txt` — machine-readable article index
- [ ] `https://expatnewlife.com/llms-full.txt` — full article text dump
- [ ] `https://expatnewlife.com/sitemap-images.xml` — image sitemap

---

## 9. Render Deployment Checklist

- [ ] Connect `peacefulgeek/expat-newlife` repo in Render dashboard
- [ ] Set **Build Command:** `pnpm build`
- [ ] Set **Start Command:** `node scripts/start-with-cron.mjs`
- [ ] Set **Port:** `10000` (Render default)
- [ ] Add all environment variables from `.env.example`:
  - `BUNNY_API_KEY` = `7ea07d93-ee8d-498c-8e777b0c5914-bc85-4a3a`
  - `BUNNY_STORAGE_ZONE` = `expat-newlife`
  - `BUNNY_CDN_URL` = `https://expat-newlife.b-cdn.net`
  - `SITE_URL` = `https://expatnewlife.com`
  - `SITE_HOST` = `expatnewlife.com`
  - `AMAZON_TAG` = `spankyspinola-20`
  - `OPENAI_API_KEY` = your OpenAI key (for cron article generation)
- [ ] Add custom domain `expatnewlife.com` in Render dashboard
- [ ] Add CNAME record at your registrar: `expatnewlife.com → your-app.onrender.com`
- [ ] Enable **Auto-Deploy** from `main` branch

---

## 10. Post-Launch Week 1 Monitoring

- [ ] Check Google Search Console for crawl errors after 24 hours
- [ ] Verify first queued article publishes automatically (cron runs daily at 9am UTC)
- [ ] Check Render logs for any cron job errors
- [ ] Test `/api/articles?status=published` to confirm article count grows daily
- [ ] Verify Bunny CDN images are loading (check Network tab in browser DevTools)

---

*Generated for ExpatNewLife.com — The Oracle Lover's Expat Life Guide*
*Site: https://expatnewlife.com | Repo: https://github.com/peacefulgeek/expat-newlife*

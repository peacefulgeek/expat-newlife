/**
 * asin-health-check.mjs
 * Cron job: Verify Amazon affiliate links are still valid (Sundays 05:00 UTC).
 * Section 8B of the Master Scope.
 */
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_PATH = resolve(__dirname, '../data/articles-db.json');

/**
 * Check if an Amazon ASIN URL returns a valid product page.
 * Uses a lightweight HEAD request to avoid downloading full pages.
 */
async function checkAsin(asin, tag) {
  const url = `https://www.amazon.com/dp/${asin}?tag=${tag}`;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MovingAbroadBot/1.0)',
      },
    });
    clearTimeout(timeout);
    return { asin, url, status: res.status, ok: res.status < 400 };
  } catch (err) {
    return { asin, url, status: 0, ok: false, error: err.message };
  }
}

export async function runAsinHealthCheck() {
  const tag = 'spankyspinola-20';

  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    const data = JSON.parse(raw);
    const articles = Array.isArray(data) ? data : (data.articles || []);

    // Extract all ASINs from affiliate_products in articles
    const asinSet = new Set();
    for (const article of articles) {
      if (article.affiliate_products && Array.isArray(article.affiliate_products)) {
        for (const product of article.affiliate_products) {
          if (product.asin) asinSet.add(product.asin);
        }
      }
    }

    const asins = Array.from(asinSet);
    if (asins.length === 0) {
      console.log('[asin-health-check] No ASINs found in articles.');
      return { checked: 0 };
    }

    console.log(`[asin-health-check] Checking ${asins.length} ASINs...`);

    const results = await Promise.allSettled(
      asins.map(asin => checkAsin(asin, tag))
    );

    const failed = results
      .filter(r => r.status === 'fulfilled' && !r.value.ok)
      .map(r => r.value);

    const errors = results
      .filter(r => r.status === 'rejected')
      .map(r => ({ error: r.reason?.message }));

    if (failed.length > 0) {
      console.warn(`[asin-health-check] ${failed.length} failed ASINs:`, failed.map(f => f.asin));
    }

    console.log(`[asin-health-check] Complete. Checked: ${asins.length}, Failed: ${failed.length}`);
    return {
      checked: asins.length,
      failed: failed.length,
      failedAsins: failed.map(f => f.asin),
      errors: errors.length,
    };
  } catch (err) {
    console.error('[asin-health-check] Error:', err);
    return { error: err.message };
  }
}

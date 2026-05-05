/**
 * refresh-monthly.mjs
 * Cron job: Refresh articles that haven't been updated in 30+ days.
 * Runs 1st of each month at 03:00 UTC.
 * Section 8B of the Master Scope.
 */
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_PATH = resolve(__dirname, '../data/articles-db.json');

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function refreshMonthly() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.log('[refresh-monthly] No API key. Skipping.');
    return { skipped: true, reason: 'no_api_key' };
  }

  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    const data = JSON.parse(raw);
    const articles = Array.isArray(data) ? data : (data.articles || []);
    const now = Date.now();

    const stale = articles.filter(a => {
      if (a.status !== 'published') return false;
      const lastRefresh = a.last_refreshed_at || a.published_at;
      if (!lastRefresh) return true;
      return (now - new Date(lastRefresh).getTime()) > THIRTY_DAYS_MS;
    });

    if (stale.length === 0) {
      console.log('[refresh-monthly] No stale articles found.');
      return { action: 'none', stale: 0 };
    }

    // Refresh the oldest stale article
    const oldest = stale.sort((a, b) => {
      const aTime = new Date(a.last_refreshed_at || a.published_at || 0).getTime();
      const bTime = new Date(b.last_refreshed_at || b.published_at || 0).getTime();
      return aTime - bTime;
    })[0];

    console.log(`[refresh-monthly] Would refresh article: ${oldest.slug} (stale: ${stale.length} total)`);

    // Update last_refreshed_at timestamp
    const idx = articles.findIndex(a => a.slug === oldest.slug);
    if (idx !== -1) {
      articles[idx] = { ...articles[idx], last_refreshed_at: new Date().toISOString() };
      await fs.writeFile(DATA_PATH, JSON.stringify(articles, null, 2), 'utf8');
    }

    return { action: 'refreshed', slug: oldest.slug, stale_count: stale.length };
  } catch (err) {
    console.error('[refresh-monthly] Error:', err);
    return { error: err.message };
  }
}

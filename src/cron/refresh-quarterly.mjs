/**
 * refresh-quarterly.mjs
 * Cron job: Deep refresh of evergreen articles every quarter.
 * Runs Jan/Apr/Jul/Oct 1st at 04:00 UTC.
 * Section 8B of the Master Scope.
 */
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_PATH = resolve(__dirname, '../data/articles-db.json');

// Articles that are evergreen and benefit from quarterly deep refresh
const EVERGREEN_SLUGS = [
  'moving-abroad-checklist-complete',
  'visa-research-101',
  'banking-abroad-what-you-need-before-you-arrive',
  'international-health-insurance-basics',
  'expat-tax-situation-americans-abroad',
  'cost-of-living-abroad-honest-numbers',
  'finding-housing-without-getting-scammed',
  'packing-for-a-move-abroad',
];

export async function refreshQuarterly() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.log('[refresh-quarterly] No API key. Skipping.');
    return { skipped: true, reason: 'no_api_key' };
  }

  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    const data = JSON.parse(raw);
    const articles = Array.isArray(data) ? data : (data.articles || []);

    const evergreen = articles.filter(a => EVERGREEN_SLUGS.includes(a.slug));

    if (evergreen.length === 0) {
      console.log('[refresh-quarterly] No evergreen articles found.');
      return { action: 'none' };
    }

    // Pick the one least recently refreshed
    const oldest = evergreen.sort((a, b) => {
      const aTime = new Date(a.last_refreshed_at || a.published_at || 0).getTime();
      const bTime = new Date(b.last_refreshed_at || b.published_at || 0).getTime();
      return aTime - bTime;
    })[0];

    console.log(`[refresh-quarterly] Would deep-refresh: ${oldest.slug}`);

    const idx = articles.findIndex(a => a.slug === oldest.slug);
    if (idx !== -1) {
      articles[idx] = {
        ...articles[idx],
        last_refreshed_at: new Date().toISOString(),
        refresh_type: 'quarterly',
      };
      await fs.writeFile(DATA_PATH, JSON.stringify(articles, null, 2), 'utf8');
    }

    return { action: 'deep_refreshed', slug: oldest.slug };
  } catch (err) {
    console.error('[refresh-quarterly] Error:', err);
    return { error: err.message };
  }
}

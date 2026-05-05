/**
 * generate-article.mjs
 * Cron job: Generate or release one article per invocation.
 * Phase 1 (< 60 published): 5x/day
 * Phase 2 (>= 60 published): 1x/weekday
 * Section 8B of the Master Scope.
 */
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_PATH = resolve(__dirname, '../data/articles-db.json');

async function loadArticles() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : (data.articles || []);
  } catch {
    return [];
  }
}

async function saveArticles(articles) {
  await fs.writeFile(DATA_PATH, JSON.stringify(articles, null, 2), 'utf8');
}

function getPublishedCount(articles) {
  return articles.filter(a => a.status === 'published').length;
}

function getQueuedArticles(articles) {
  return articles.filter(a => a.status === 'queued');
}

/**
 * Main entry point called by cron scheduler.
 * @param {Object} opts
 * @param {number} opts.allowedPhase - 1 or 2
 */
export async function generateOrReleaseArticle({ allowedPhase = 1 } = {}) {
  const articles = await loadArticles();
  const publishedCount = getPublishedCount(articles);
  const currentPhase = publishedCount < 60 ? 1 : 2;

  // Only run if we're in the allowed phase
  if (currentPhase !== allowedPhase) {
    console.log(`[generate-article] Phase mismatch: current=${currentPhase}, allowed=${allowedPhase}. Skipping.`);
    return { skipped: true, reason: 'phase_mismatch' };
  }

  // Check for queued articles to release first
  const queued = getQueuedArticles(articles);
  if (queued.length > 0) {
    const toRelease = queued[0];
    console.log(`[generate-article] Releasing queued article: ${toRelease.slug}`);
    const idx = articles.findIndex(a => a.slug === toRelease.slug);
    articles[idx] = {
      ...toRelease,
      status: 'published',
      published_at: new Date().toISOString(),
    };
    await saveArticles(articles);
    return { action: 'released', slug: toRelease.slug };
  }

  // No queued articles — attempt AI generation if API key available
  const apiKey = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.log('[generate-article] No API key available. Skipping generation.');
    return { skipped: true, reason: 'no_api_key' };
  }

  // Would generate here — for now log intent
  console.log(`[generate-article] Would generate new article (published: ${publishedCount})`);
  return { action: 'generation_pending', publishedCount };
}

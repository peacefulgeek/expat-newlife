/**
 * product-spotlight.mjs
 * Cron job: Generate a product spotlight article (Saturday 08:00 UTC).
 * Section 8B of the Master Scope.
 */
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DATA_PATH = resolve(__dirname, '../data/articles-db.json');

const SPOTLIGHT_TOPICS = [
  { title: 'The Best Noise-Canceling Headphones for Long-Haul Flights', category: 'getting-started' },
  { title: 'The Best VPN Services for Expats in 2026', category: 'work-legal' },
  { title: 'International SIM Cards vs. eSIMs: What Actually Works', category: 'getting-started' },
  { title: 'The Best Travel Wallets for Expats', category: 'money-banking' },
  { title: 'Portable Wi-Fi Hotspots: The Expat\'s Guide', category: 'getting-started' },
  { title: 'The Best Language Learning Apps for Expats', category: 'culture-identity' },
  { title: 'Luggage That Survives International Moves', category: 'getting-started' },
  { title: 'The Best International Money Transfer Apps', category: 'money-banking' },
];

export async function generateProductSpotlight() {
  const apiKey = process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    console.log('[product-spotlight] No API key. Skipping.');
    return { skipped: true, reason: 'no_api_key' };
  }

  // Pick a random spotlight topic not yet published
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    const data = JSON.parse(raw);
    const articles = Array.isArray(data) ? data : (data.articles || []);
    const existingSlugs = new Set(articles.map(a => a.slug));

    const available = SPOTLIGHT_TOPICS.filter(t => {
      const slug = t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return !existingSlugs.has(slug);
    });

    if (available.length === 0) {
      console.log('[product-spotlight] All spotlight topics already published.');
      return { skipped: true, reason: 'all_published' };
    }

    const topic = available[Math.floor(Math.random() * available.length)];
    console.log(`[product-spotlight] Would generate spotlight: "${topic.title}"`);
    return { action: 'generation_pending', topic: topic.title };
  } catch (err) {
    console.error('[product-spotlight] Error:', err);
    return { error: err.message };
  }
}

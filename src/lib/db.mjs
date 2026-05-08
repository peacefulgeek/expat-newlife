/**
 * Data layer — JSON file storage only.
 * No database required. Works on Render, DigitalOcean, or any Node.js host.
 * All data lives in src/data/*.json files committed to the repo.
 */
import fs from 'fs/promises';
import path from 'path';

// Resolve data directory from project root (works in both dev and production dist/)
const DATA_DIR = path.resolve(process.cwd(), 'src/data');
const ARTICLES_PATH = path.join(DATA_DIR, 'articles-db.json');
const ASSESSMENTS_PATH = path.join(DATA_DIR, 'assessments-db.json');

// In-memory cache to avoid re-reading files on every request
let _articlesCache = null;
let _assessmentsCache = null;

/**
 * Get all articles from JSON file (with in-memory cache).
 */
export async function getArticlesFromJson() {
  if (_articlesCache) return _articlesCache;
  try {
    const raw = await fs.readFile(ARTICLES_PATH, 'utf8');
    _articlesCache = JSON.parse(raw);
    return _articlesCache;
  } catch {
    return [];
  }
}

/**
 * Save articles back to JSON file and clear cache.
 */
export async function saveArticlesToJson(articles) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(ARTICLES_PATH, JSON.stringify(articles, null, 2));
  _articlesCache = null; // invalidate cache
}

/**
 * Get all assessments from JSON file (with in-memory cache).
 */
export async function getAssessmentsFromJson() {
  if (_assessmentsCache) return _assessmentsCache;
  try {
    const raw = await fs.readFile(ASSESSMENTS_PATH, 'utf8');
    _assessmentsCache = JSON.parse(raw);
    return _assessmentsCache;
  } catch {
    return [];
  }
}

/**
 * Save assessments back to JSON file and clear cache.
 */
export async function saveAssessmentsToJson(assessments) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(ASSESSMENTS_PATH, JSON.stringify(assessments, null, 2));
  _assessmentsCache = null;
}

/**
 * Invalidate all caches (call after cron writes new articles).
 */
export function invalidateCache() {
  _articlesCache = null;
  _assessmentsCache = null;
}

/**
 * No-op — kept for compatibility. No schema to initialize.
 */
export async function initSchema() {
  console.log('[db] JSON file storage — no schema init needed');
}

/**
 * Stub — no SQL queries needed. Kept so old imports do not crash.
 */
export async function query() {
  throw new Error('[db] SQL queries not supported — using JSON file storage');
}

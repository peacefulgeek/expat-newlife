/**
 * Database connection — PostgreSQL via pg on DigitalOcean App Platform.
 * Falls back to JSON file storage when DATABASE_URL is not set (local dev).
 */
import pg from 'pg';
import fs from 'fs/promises';
import path from 'path';
const { Pool } = pg;
// Use process.cwd() so the path works in both dev (src/lib/) and production (dist/)
const DATA_DIR = path.resolve(process.cwd(), 'src/data');

let pool = null;

function getPool() {
  if (!pool && process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    pool.on('error', (err) => {
      console.error('[db] Pool error:', err.message);
    });
  }
  return pool;
}

/**
 * Execute a SQL query. Returns pg QueryResult.
 * If no DATABASE_URL, throws — caller must handle JSON fallback.
 */
export async function query(sql, params = []) {
  const p = getPool();
  if (!p) throw new Error('DATABASE_URL not set — cannot execute query');
  const client = await p.connect();
  try {
    return await client.query(sql, params);
  } finally {
    client.release();
  }
}

/**
 * Initialize the database schema.
 */
export async function initSchema() {
  const p = getPool();
  if (!p) {
    console.log('[db] No DATABASE_URL — skipping schema init, using JSON fallback');
    return;
  }
  await query(`
    CREATE TABLE IF NOT EXISTS articles (
      id            SERIAL PRIMARY KEY,
      slug          TEXT UNIQUE NOT NULL,
      title         TEXT NOT NULL,
      body          TEXT NOT NULL,
      meta_desc     TEXT,
      og_title      TEXT,
      og_desc       TEXT,
      category      TEXT,
      tags          TEXT[],
      image_alt     TEXT,
      reading_time  INT,
      author        TEXT DEFAULT 'The Oracle Lover',
      status        TEXT DEFAULT 'draft' CHECK (status IN ('draft','queued','published')),
      hero_url      TEXT,
      word_count    INT,
      asins_used    TEXT[],
      internal_links TEXT[],
      cta_primary   TEXT,
      tldr          TEXT,
      published_at  TIMESTAMPTZ,
      queued_at     TIMESTAMPTZ,
      last_refreshed_at TIMESTAMPTZ,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS assessments (
      id          SERIAL PRIMARY KEY,
      slug        TEXT UNIQUE NOT NULL,
      title       TEXT NOT NULL,
      description TEXT,
      questions   JSONB NOT NULL,
      results     JSONB NOT NULL,
      category    TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
  `);

  await query(`
    CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
    CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
    CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
  `);

  console.log('[db] Schema initialized');
}

/**
 * JSON file fallback for local dev without a database.
 */
const JSON_DB_PATH = path.join(DATA_DIR, 'articles-db.json');

export async function getArticlesFromJson() {
  try {
    const raw = await fs.readFile(JSON_DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export async function saveArticlesToJson(articles) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(JSON_DB_PATH, JSON.stringify(articles, null, 2));
}

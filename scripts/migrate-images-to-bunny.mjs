/**
 * One-time migration: download Unsplash hero images and upload to Bunny CDN as WebP.
 * Updates articles-db.json with new Bunny CDN URLs.
 * Run: node scripts/migrate-images-to-bunny.mjs
 */
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const BUNNY_STORAGE_ZONE = 'expat-newlife';
const BUNNY_API_KEY      = '7ea07d93-ee8d-498c-8e777b0c5914-bc85-4a3a';
const BUNNY_PULL_ZONE    = 'https://expat-newlife.b-cdn.net';
const BUNNY_HOSTNAME     = 'ny.storage.bunnycdn.com';

async function uploadToBunny(slug, sourceUrl) {
  try {
    console.log(`  Fetching: ${sourceUrl.substring(0, 60)}...`);
    const res = await fetch(sourceUrl);
    if (!res.ok) throw new Error(`fetch ${res.status}`);
    const buf = await res.arrayBuffer();
    const destPath = `images/${slug}.webp`;
    const uploadUrl = `https://${BUNNY_HOSTNAME}/${BUNNY_STORAGE_ZONE}/${destPath}`;
    const up = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { AccessKey: BUNNY_API_KEY, 'Content-Type': 'image/webp' },
      body: buf,
    });
    if (!up.ok) throw new Error(`upload ${up.status}: ${await up.text()}`);
    const cdnUrl = `${BUNNY_PULL_ZONE}/${destPath}`;
    console.log(`  ✓ ${slug} → ${cdnUrl}`);
    return cdnUrl;
  } catch (err) {
    console.error(`  ✗ ${slug}: ${err.message}`);
    return null;
  }
}

async function main() {
  const dbPath = path.join(ROOT, 'src/data/articles-db.json');
  const articles = JSON.parse(await fs.readFile(dbPath, 'utf8'));
  
  console.log(`\nMigrating ${articles.length} article images to Bunny CDN...\n`);
  
  let updated = 0;
  let failed = 0;
  
  for (const article of articles) {
    const currentUrl = article.hero_url || '';
    
    // Skip if already on Bunny CDN
    if (currentUrl.includes('b-cdn.net')) {
      console.log(`  ↷ ${article.slug} — already on Bunny CDN`);
      continue;
    }
    
    console.log(`\n[${articles.indexOf(article) + 1}/${articles.length}] ${article.slug}`);
    
    const cdnUrl = await uploadToBunny(article.slug, currentUrl);
    if (cdnUrl) {
      article.hero_url = cdnUrl;
      updated++;
    } else {
      failed++;
    }
    
    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 300));
  }
  
  // Save updated articles
  await fs.writeFile(dbPath, JSON.stringify(articles, null, 2));
  
  console.log(`\n✓ Migration complete: ${updated} uploaded, ${failed} failed`);
  console.log(`Updated: ${dbPath}`);
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});

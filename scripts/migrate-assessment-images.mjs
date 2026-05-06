/**
 * Upload assessment hero images to Bunny CDN.
 * Run: node scripts/migrate-assessment-images.mjs
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
    const res = await fetch(sourceUrl);
    if (!res.ok) throw new Error(`fetch ${res.status}`);
    const buf = await res.arrayBuffer();
    const destPath = `assessments/${slug}.webp`;
    const uploadUrl = `https://${BUNNY_HOSTNAME}/${BUNNY_STORAGE_ZONE}/${destPath}`;
    const up = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { AccessKey: BUNNY_API_KEY, 'Content-Type': 'image/webp' },
      body: buf,
    });
    if (!up.ok) throw new Error(`upload ${up.status}`);
    return `${BUNNY_PULL_ZONE}/${destPath}`;
  } catch (err) {
    console.error(`  ✗ ${slug}: ${err.message}`);
    return null;
  }
}

async function main() {
  const dbPath = path.join(ROOT, 'src/data/assessments-db.json');
  const assessments = JSON.parse(await fs.readFile(dbPath, 'utf8'));
  
  console.log(`\nMigrating ${assessments.length} assessment images to Bunny CDN...\n`);
  
  let updated = 0;
  for (const assessment of assessments) {
    if (assessment.hero_url?.includes('b-cdn.net')) {
      console.log(`  ↷ ${assessment.slug} — already on Bunny CDN`);
      continue;
    }
    console.log(`  Uploading: ${assessment.slug}`);
    const cdnUrl = await uploadToBunny(assessment.slug, assessment.hero_url);
    if (cdnUrl) {
      assessment.hero_url = cdnUrl;
      updated++;
      console.log(`  ✓ → ${cdnUrl}`);
    }
    await new Promise(r => setTimeout(r, 300));
  }
  
  await fs.writeFile(dbPath, JSON.stringify(assessments, null, 2));
  console.log(`\n✓ Done: ${updated} assessment images uploaded to Bunny CDN`);
}

main().catch(err => { console.error(err); process.exit(1); });

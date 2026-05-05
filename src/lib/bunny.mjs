/**
 * Bunny CDN — image library + upload utilities.
 * Credentials are hardcoded per-site (safe; these are CDN keys, not secrets).
 * Section 9A of the Master Scope.
 */

// ─── Per-site Bunny credentials — update when Paul provides them ───
const BUNNY_STORAGE_ZONE = 'moving-abroad';
const BUNNY_API_KEY      = 'BUNNY_API_KEY_PLACEHOLDER';
const BUNNY_PULL_ZONE    = 'https://moving-abroad.b-cdn.net';
const BUNNY_HOSTNAME     = 'ny.storage.bunnycdn.com';

// Placeholder image URLs for local dev (beautiful Unsplash expat/travel images)
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80', // travel map
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80', // travel
  'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1200&q=80', // passport
  'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1200&q=80', // city abroad
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80', // road trip
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80', // mountains
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80', // beach
  'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1200&q=80', // city street
  'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&q=80', // taj mahal
  'https://images.unsplash.com/photo-1555993539-1732b0258235?w=1200&q=80', // europe street
];

/**
 * Pick a random library image, copy it to /images/{slug}.webp, return the public URL.
 * Falls back to placeholder URL when Bunny credentials are not configured.
 */
export async function assignHeroImage(slug) {
  // Use placeholder in dev or when Bunny not configured
  if (BUNNY_API_KEY === 'BUNNY_API_KEY_PLACEHOLDER') {
    const idx = Math.abs(slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % PLACEHOLDER_IMAGES.length;
    return PLACEHOLDER_IMAGES[idx];
  }

  const libIdx = String(Math.floor(Math.random() * 40) + 1).padStart(2, '0');
  const sourceFile = `lib-${libIdx}.webp`;
  const destFile   = `${slug}.webp`;

  try {
    const sourceUrl = `${BUNNY_PULL_ZONE}/library/${sourceFile}`;
    const downloadRes = await fetch(sourceUrl);
    if (!downloadRes.ok) throw new Error(`download ${downloadRes.status}`);
    const imageBuffer = await downloadRes.arrayBuffer();

    const uploadUrl = `https://${BUNNY_HOSTNAME}/${BUNNY_STORAGE_ZONE}/images/${destFile}`;
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { AccessKey: BUNNY_API_KEY, 'Content-Type': 'image/webp' },
      body: imageBuffer,
    });
    if (!uploadRes.ok) throw new Error(`upload ${uploadRes.status}`);
    return `${BUNNY_PULL_ZONE}/images/${destFile}`;
  } catch (err) {
    console.warn(`[bunny.assignHeroImage] copy failed (${err.message}), using placeholder`);
    const idx = Math.abs(slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % PLACEHOLDER_IMAGES.length;
    return PLACEHOLDER_IMAGES[idx];
  }
}

/**
 * Upload an arbitrary WebP buffer to a target path under the storage zone.
 */
export async function uploadWebP(targetPath, buffer) {
  if (BUNNY_API_KEY === 'BUNNY_API_KEY_PLACEHOLDER') {
    throw new Error('[bunny] Bunny not configured — set BUNNY_API_KEY in bunny.mjs');
  }
  const url = `https://${BUNNY_HOSTNAME}/${BUNNY_STORAGE_ZONE}/${targetPath.replace(/^\//, '')}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { AccessKey: BUNNY_API_KEY, 'Content-Type': 'image/webp' },
    body: buffer,
  });
  if (!res.ok) throw new Error(`bunny upload ${res.status} for ${targetPath}`);
  return `${BUNNY_PULL_ZONE}/${targetPath.replace(/^\//, '')}`;
}

export { BUNNY_PULL_ZONE };

/**
 * Bunny CDN — image library + upload utilities.
 * Credentials are hardcoded per-site (safe; these are CDN keys, not secrets).
 * Section 9A of the Master Scope.
 */

// ─── Per-site Bunny credentials ───
const BUNNY_STORAGE_ZONE = 'expat-newlife';
const BUNNY_API_KEY      = '7ea07d93-ee8d-498c-8e777b0c5914-bc85-4a3a';
const BUNNY_PULL_ZONE    = 'https://expat-newlife.b-cdn.net';
const BUNNY_HOSTNAME     = 'ny.storage.bunnycdn.com';

// Fallback Unsplash images (used only if Bunny upload fails)
const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80',
  'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1200&q=80',
  'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=1200&q=80',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
  'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1200&q=80',
  'https://images.unsplash.com/photo-1548013146-72479768bada?w=1200&q=80',
  'https://images.unsplash.com/photo-1555993539-1732b0258235?w=1200&q=80',
];

/**
 * Download an Unsplash image and upload to Bunny CDN as WebP.
 * Returns the Bunny CDN URL.
 */
export async function uploadImageToBunny(slug, sourceUrl) {
  try {
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
    if (!up.ok) throw new Error(`upload ${up.status}`);
    return `${BUNNY_PULL_ZONE}/${destPath}`;
  } catch (err) {
    console.warn(`[bunny] upload failed for ${slug}: ${err.message}`);
    return null;
  }
}

/**
 * Assign a hero image to an article slug.
 * Downloads from Unsplash and uploads to Bunny CDN.
 * Falls back to Unsplash URL if Bunny upload fails.
 */
export async function assignHeroImage(slug, unsplashUrl) {
  if (unsplashUrl) {
    const bunnyUrl = await uploadImageToBunny(slug, unsplashUrl);
    if (bunnyUrl) return bunnyUrl;
  }
  // Fallback: pick a deterministic placeholder
  const idx = Math.abs(slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % PLACEHOLDER_IMAGES.length;
  const fallbackUrl = PLACEHOLDER_IMAGES[idx];
  const bunnyUrl = await uploadImageToBunny(slug, fallbackUrl);
  return bunnyUrl || fallbackUrl;
}

/**
 * Upload an arbitrary WebP buffer to a target path under the storage zone.
 */
export async function uploadWebP(targetPath, buffer) {
  const url = `https://${BUNNY_HOSTNAME}/${BUNNY_STORAGE_ZONE}/${targetPath.replace(/^\//, '')}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { AccessKey: BUNNY_API_KEY, 'Content-Type': 'image/webp' },
    body: buffer,
  });
  if (!res.ok) throw new Error(`bunny upload ${res.status} for ${targetPath}`);
  return `${BUNNY_PULL_ZONE}/${targetPath.replace(/^\//, '')}`;
}

export { BUNNY_PULL_ZONE, BUNNY_API_KEY, BUNNY_HOSTNAME, BUNNY_STORAGE_ZONE };

import express from 'express';
import { query, getArticlesFromJson } from '../../src/lib/db.mjs';
import { buildImageSitemap } from '../../src/lib/aeo.mjs';

export const sitemapRouter = express.Router();

sitemapRouter.get('/', async (req, res) => {
  const host = (req.headers.host || 'expatnewlife.com').replace(/^www\./, '');
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const base = `${proto}://${host}`;

  let articles: any[] = [];
  let assessments: any[] = [];

  try {
    const { rows } = await query(
      `SELECT slug, published_at, last_refreshed_at FROM articles WHERE status = 'published' ORDER BY published_at DESC`
    );
    articles = rows;
  } catch {
    const all = await getArticlesFromJson();
    articles = all.filter((a: any) => a.status === 'published');
  }

  // Load assessments from JSON
  try {
    const { createRequire } = await import('module');
    const require = createRequire(import.meta.url);
    assessments = require('../../src/data/assessments-db.json');
  } catch {
    assessments = [];
  }

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/articles', priority: '0.9', changefreq: 'daily' },
    { url: '/assessments', priority: '0.8', changefreq: 'weekly' },
    { url: '/recommended', priority: '0.7', changefreq: 'weekly' },
    { url: '/about', priority: '0.6', changefreq: 'monthly' },
  ];

  const today = new Date().toISOString().split('T')[0];

  const urls = [
    ...staticPages.map(p => `
  <url>
    <loc>${base}${p.url}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`),
    ...articles.map(a => `
  <url>
    <loc>${base}/articles/${a.slug}</loc>
    <lastmod>${new Date(a.last_refreshed_at || a.published_at).toISOString().split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`),
    ...assessments.map((a: any) => `
  <url>
    <loc>${base}/assessments/${a.slug}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('')}
</urlset>`;

  res.set({
    'Content-Type': 'application/xml',
    'Cache-Control': 'public, max-age=3600',
  }).send(xml);
});

// Image sitemap
sitemapRouter.get('/images', async (req, res) => {
  try {
    const xml = await buildImageSitemap(req);
    res.set({
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    }).send(xml);
  } catch (err) {
    res.status(500).send('Error generating image sitemap');
  }
});

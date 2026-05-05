import express from 'express';
import { query, getArticlesFromJson } from '../../src/lib/db.mjs';

export const sitemapRouter = express.Router();

sitemapRouter.get('/', async (req, res) => {
  const host = (req.headers.host || 'movingabroad.com').replace(/^www\./, '');
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const base = `${proto}://${host}`;

  let articles: any[] = [];
  try {
    const { rows } = await query(
      `SELECT slug, published_at, last_refreshed_at FROM articles WHERE status = 'published' ORDER BY published_at DESC`
    );
    articles = rows;
  } catch {
    const all = await getArticlesFromJson();
    articles = all.filter((a: any) => a.status === 'published');
  }

  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/articles', priority: '0.9', changefreq: 'daily' },
    { url: '/recommended', priority: '0.7', changefreq: 'weekly' },
    { url: '/about', priority: '0.6', changefreq: 'monthly' },
    { url: '/assessments', priority: '0.8', changefreq: 'weekly' },
  ];

  const urls = [
    ...staticPages.map(p => `
    <url>
      <loc>${base}${p.url}</loc>
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

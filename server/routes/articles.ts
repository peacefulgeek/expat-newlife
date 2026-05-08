import express from 'express';
import { getArticlesFromJson } from '../../src/lib/db.mjs';

export const articlesRouter = express.Router();

// GET /api/articles — list published articles
articlesRouter.get('/', async (req, res) => {
  try {
    const { category, limit = '30', offset = '0', search } = req.query as Record<string, string>;

    const all = await getArticlesFromJson() as any[];
    let filtered = all.filter((a: any) => a.status === 'published');

    if (category) filtered = filtered.filter((a: any) => a.category === category);
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter((a: any) =>
        a.title?.toLowerCase().includes(q) ||
        a.excerpt?.toLowerCase().includes(q) ||
        a.meta_desc?.toLowerCase().includes(q)
      );
    }

    // Sort by publish_date descending
    filtered.sort((a: any, b: any) => {
      const da = new Date(a.publish_date || a.published_at || 0).getTime();
      const db = new Date(b.publish_date || b.published_at || 0).getTime();
      return db - da;
    });

    const total = filtered.length;
    const lim = parseInt(limit);
    const off = parseInt(offset);
    const articles = filtered.slice(off, off + lim).map((a: any) => ({
      id: a.id,
      slug: a.slug,
      title: a.title,
      excerpt: a.excerpt || a.meta_desc || '',
      category: a.category,
      tags: a.tags || [],
      hero_url: a.hero_bunny_url || a.hero_url || '',
      reading_time: a.reading_time || 7,
      word_count: a.word_count || 0,
      publish_date: a.publish_date || a.published_at || '',
      author: a.author || 'The Oracle Lover',
    }));

    res.set('Cache-Control', 'public, max-age=300');
    res.json({ articles, total });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

// GET /api/articles/:slug — single article with related
articlesRouter.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const all = await getArticlesFromJson() as any[];

    const article = all.find((a: any) => a.slug === slug && a.status === 'published');

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    // Normalize hero_url to prefer Bunny CDN
    article.hero_url = article.hero_bunny_url || article.hero_url || '';

    const related = all
      .filter((a: any) => a.status === 'published' && a.category === article.category && a.slug !== slug)
      .slice(0, 3)
      .map((a: any) => ({
        slug: a.slug,
        title: a.title,
        excerpt: a.excerpt || a.meta_desc || '',
        category: a.category,
        hero_url: a.hero_bunny_url || a.hero_url || '',
        reading_time: a.reading_time || 7,
        publish_date: a.publish_date || a.published_at || '',
      }));

    res.set('Cache-Control', 'public, max-age=3600');
    res.json({ article, related });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

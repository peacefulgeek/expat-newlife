import express from 'express';
import { query, getArticlesFromJson } from '../../src/lib/db.mjs';

export const articlesRouter = express.Router();

// GET /api/articles — list published articles
articlesRouter.get('/', async (req, res) => {
  try {
    const { category, limit = '30', offset = '0', search } = req.query as Record<string, string>;
    let articles: any[];
    let total = 0;

    try {
      const params: (string | number)[] = [];
      let sql = `SELECT id, slug, title, meta_desc, category, tags, hero_url, image_alt, reading_time, published_at, word_count
                 FROM articles WHERE status = 'published'`;
      if (category) {
        params.push(category);
        sql += ` AND category = $${params.length}`;
      }
      if (search) {
        params.push(`%${search}%`);
        sql += ` AND (title ILIKE $${params.length} OR meta_desc ILIKE $${params.length})`;
      }
      sql += ` ORDER BY published_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(parseInt(limit), parseInt(offset));
      const { rows } = await query(sql, params);
      articles = rows;

      // Get total count
      let countSql = `SELECT COUNT(*) FROM articles WHERE status = 'published'`;
      const countParams: (string | number)[] = [];
      if (category) { countParams.push(category); countSql += ` AND category = $${countParams.length}`; }
      const { rows: countRows } = await query(countSql, countParams);
      total = parseInt(countRows[0].count);
    } catch {
      // JSON fallback
      const all = await getArticlesFromJson();
      let filtered = all.filter((a: any) => a.status === 'published');
      if (category) filtered = filtered.filter((a: any) => a.category === category);
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter((a: any) =>
          a.title?.toLowerCase().includes(q) || a.meta_desc?.toLowerCase().includes(q)
        );
      }
      total = filtered.length;
      articles = filtered.slice(parseInt(offset), parseInt(offset) + parseInt(limit));
    }

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
    let article: any;
    let related: any[] = [];

    try {
      const { rows } = await query(
        `SELECT * FROM articles WHERE slug = $1 AND status = 'published'`,
        [slug]
      );
      article = rows[0];

      if (article) {
        const { rows: relRows } = await query(
          `SELECT id, slug, title, meta_desc, category, hero_url, image_alt, reading_time, published_at
           FROM articles WHERE status = 'published' AND category = $1 AND slug != $2
           ORDER BY published_at DESC LIMIT 3`,
          [article.category, slug]
        );
        related = relRows;
      }
    } catch {
      const all = await getArticlesFromJson();
      article = all.find((a: any) => a.slug === slug && a.status === 'published');
      if (article) {
        related = all
          .filter((a: any) => a.status === 'published' && a.category === article.category && a.slug !== slug)
          .slice(0, 3);
      }
    }

    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    res.set('Cache-Control', 'public, max-age=3600');
    res.json({ article, related });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch article' });
  }
});

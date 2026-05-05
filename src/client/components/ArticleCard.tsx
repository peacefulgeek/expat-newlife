import React from 'react';
import { Link } from 'react-router-dom';

interface Article {
  slug: string;
  title: string;
  meta_desc?: string;
  category?: string;
  hero_url?: string;
  reading_time?: number;
  published_at?: string;
  tags?: string[];
  image_alt?: string;
}

interface ArticleCardProps {
  article: Article;
  view?: 'grid' | 'list';
  compact?: boolean;
}

const CATEGORY_LABELS: Record<string, string> = {
  'getting-started': 'Getting Started',
  'visas-paperwork': 'Visas & Paperwork',
  'money-banking': 'Money & Banking',
  'culture-identity': 'Culture & Identity',
  'relationships': 'Relationships',
  'work-legal': 'Work & Legal',
  'health-wellbeing': 'Health & Wellbeing',
  'community': 'Community',
  'family': 'Family',
};

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800&q=80',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80',
  'https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=800&q=80',
  'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=800&q=80',
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&q=80',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800&q=80',
  'https://images.unsplash.com/photo-1548013146-72479768bada?w=800&q=80',
  'https://images.unsplash.com/photo-1555993539-1732b0258235?w=800&q=80',
];

function getImageForSlug(slug: string, heroUrl?: string): string {
  if (heroUrl && !heroUrl.includes('PLACEHOLDER')) return heroUrl;
  const idx = Math.abs(slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % FALLBACK_IMAGES.length;
  return FALLBACK_IMAGES[idx];
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return '';
  }
}

export function ArticleCard({ article, view = 'grid', compact = false }: ArticleCardProps) {
  const imageUrl = getImageForSlug(article.slug, article.hero_url);
  const categoryLabel = CATEGORY_LABELS[article.category || ''] || article.category || '';

  if (view === 'list') {
    return (
      <Link to={`/articles/${article.slug}`} className="ac-list-link">
        <article className="ac-list">
          <div className="ac-list-img-wrap">
            <img src={imageUrl} alt={article.image_alt || article.title} className="ac-list-img" loading="lazy" />
          </div>
          <div className="ac-list-body">
            {categoryLabel && <span className="ac-category">{categoryLabel}</span>}
            <h3 className="ac-list-title">{article.title}</h3>
            {article.meta_desc && <p className="ac-list-desc">{article.meta_desc}</p>}
            <div className="ac-meta">
              {article.reading_time && <span>{article.reading_time} min read</span>}
              {article.published_at && <span>{formatDate(article.published_at)}</span>}
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link to={`/articles/${article.slug}`} className="ac-link">
      <article className={`ac ${compact ? 'ac-compact' : ''}`}>
        <div className="ac-img-wrap">
          <img
            src={imageUrl}
            alt={article.image_alt || article.title}
            className="ac-img"
            loading="lazy"
          />
          <div className="ac-img-overlay" />
          {categoryLabel && <span className="ac-badge">{categoryLabel}</span>}
          {article.reading_time && <span className="ac-time">{article.reading_time} min</span>}
        </div>
        <div className="ac-body">
          <h3 className="ac-title">{article.title}</h3>
          {!compact && article.meta_desc && (
            <p className="ac-desc">{article.meta_desc}</p>
          )}
          <div className="ac-meta">
            <span className="ac-author">The Oracle Lover</span>
            {article.published_at && (
              <span className="ac-date">{formatDate(article.published_at)}</span>
            )}
          </div>
        </div>
      </article>

      <style>{`
        .ac-link { text-decoration: none; display: block; }
        .ac {
          background: var(--bg-card);
          border-radius: var(--radius-xl);
          overflow: hidden;
          border: 1px solid var(--border-light);
          transition: all var(--transition-base);
          height: 100%;
          display: flex;
          flex-direction: column;
        }
        .ac:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: var(--accent);
        }
        .ac-img-wrap {
          position: relative;
          overflow: hidden;
          aspect-ratio: 16/9;
          flex-shrink: 0;
        }
        .ac-compact .ac-img-wrap { aspect-ratio: 4/3; }
        .ac-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .ac-link:hover .ac-img { transform: scale(1.06); }
        .ac-img-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(10,26,47,0.4) 0%, transparent 60%);
        }
        .ac-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: var(--accent);
          color: white;
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 3px 10px;
          border-radius: var(--radius-full);
          z-index: 1;
        }
        .ac-time {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background: rgba(0,0,0,0.6);
          color: white;
          font-size: 0.7rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: var(--radius-full);
          backdrop-filter: blur(4px);
          z-index: 1;
        }
        .ac-body {
          padding: var(--space-5);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          flex: 1;
        }
        .ac-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.4;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .ac-compact .ac-title { font-size: 0.95rem; }
        .ac-desc {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.55;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }
        .ac-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          padding-top: var(--space-3);
          border-top: 1px solid var(--border-light);
        }
        .ac-author {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--accent);
        }
        .ac-date {
          font-size: 0.72rem;
          color: var(--text-muted);
        }
        /* List view */
        .ac-list-link { text-decoration: none; display: block; }
        .ac-list {
          display: flex;
          gap: var(--space-4);
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          overflow: hidden;
          border: 1px solid var(--border-light);
          transition: all var(--transition-base);
        }
        .ac-list:hover {
          box-shadow: var(--shadow-md);
          border-color: var(--accent);
        }
        .ac-list-img-wrap { width: 140px; min-width: 140px; flex-shrink: 0; }
        .ac-list-img { width: 100%; height: 100%; object-fit: cover; }
        .ac-list-body { padding: var(--space-4); flex: 1; }
        .ac-category {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--accent);
          display: block;
          margin-bottom: var(--space-2);
        }
        .ac-list-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0 0 var(--space-2);
          line-height: 1.35;
        }
        .ac-list-desc {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0 0 var(--space-3);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .ac-meta {
          font-size: 0.75rem;
          color: var(--text-muted);
          display: flex;
          gap: var(--space-3);
        }
      `}</style>
    </Link>
  );
}

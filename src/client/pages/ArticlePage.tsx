import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { TableOfContents } from '../components/TableOfContents';
import { AuthorByline } from '../components/AuthorByline';
import { ReadingProgress } from '../components/ReadingProgress';
import { Breadcrumbs } from '../components/Breadcrumbs';
import { ArticleCard } from '../components/ArticleCard';

const CATEGORY_LABELS: Record<string, string> = {
  'getting-started': 'Getting Started',
  'visas-paperwork': 'Visas & Paperwork',
  'culture-identity': 'Culture & Identity',
  'money-banking': 'Money & Banking',
  'health-wellbeing': 'Health & Wellbeing',
  'community': 'Community',
  'relationships': 'Relationships',
  'work-legal': 'Work & Legal',
  'family': 'Family',
};

export default function ArticlePage() {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<any>(null);
  const [related, setRelated] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    fetch(`/api/articles/${slug}`)
      .then(r => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then(data => {
        if (!data) return;
        setArticle(data.article);
        setRelated(data.related || []);
        setLoading(false);
        window.scrollTo(0, 0);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

  if (loading) {
    return (
      <div className="article-loading">
        <div className="container">
          <div className="skeleton" style={{ height: '400px', borderRadius: '0', marginBottom: '32px' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '48px' }}>
            <div>
              {[...Array(8)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '20px', marginBottom: '12px', borderRadius: '8px', width: `${70 + Math.random() * 30}%` }} />
              ))}
            </div>
            <div className="skeleton" style={{ height: '300px', borderRadius: '16px' }} />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !article) {
    return (
      <div className="not-found">
        <div className="container">
          <h1>Article not found</h1>
          <p>The article you're looking for doesn't exist or has been moved.</p>
          <Link to="/articles" className="btn btn-primary">Browse all articles</Link>
        </div>
      </div>
    );
  }

  const categoryLabel = CATEGORY_LABELS[article.category] || article.category;
  const publishDate = new Date(article.published_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="article-page">
      <ReadingProgress />

      {/* Hero */}
      <div className="article-hero">
        <img
          src={article.hero_url || `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&q=80`}
          alt={article.image_alt || article.title}
          className="article-hero-img"
        />
        <div className="article-hero-overlay" />
        <div className="container article-hero-content">
          <Breadcrumbs items={[
            { label: 'Articles', href: '/articles' },
            { label: categoryLabel, href: `/articles?category=${article.category}` },
            { label: article.title }
          ]} />
          <div className="article-meta-top">
            <Link to={`/articles?category=${article.category}`} className="article-category-badge">
              {categoryLabel}
            </Link>
            <span className="article-reading-time">{article.reading_time} min read</span>
          </div>
          <h1 className="article-hero-title">{article.title}</h1>
          <p className="article-hero-desc">{article.meta_desc}</p>
          <div className="article-hero-meta">
            <span>By <strong>The Oracle Lover</strong></span>
            <span className="meta-sep">·</span>
            <span>{publishDate}</span>
            <span className="meta-sep">·</span>
            <span>{article.word_count?.toLocaleString()} words</span>
          </div>
        </div>
      </div>

      {/* Content Layout */}
      <div className="container article-layout">
        <article className="article-body">
          {/* TL;DR */}
          {article.tldr && (
            <div className="article-tldr">
              <div className="tldr-label">TL;DR</div>
              <p>{article.tldr}</p>
            </div>
          )}

          {/* Body */}
          <div
            className="article-content prose"
            dangerouslySetInnerHTML={{ __html: article.body }}
          />

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="article-tags">
              {article.tags.map((tag: string) => (
                <span key={tag} className="article-tag">#{tag}</span>
              ))}
            </div>
          )}

          {/* Author */}
          <AuthorByline />

          {/* Share */}
          <div className="article-share">
            <span className="share-label">Share this article:</span>
            <button
              className="share-btn"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: article.title, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link copied!');
                }
              }}
            >
              📤 Share
            </button>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="article-sidebar">
          <TableOfContents body={article.body} />

          {/* Assessment CTA */}
          <div className="sidebar-assessment-cta">
            <div className="sidebar-cta-icon">📊</div>
            <h4>Test your readiness</h4>
            <p>Take the 5-minute Expat Readiness Assessment.</p>
            <Link to="/assessments/expat-readiness-quiz" className="btn btn-primary btn-sm">
              Start Assessment →
            </Link>
          </div>

          {/* More in Category */}
          <div className="sidebar-more">
            <h4>More in {categoryLabel}</h4>
            <Link to={`/articles?category=${article.category}`} className="sidebar-more-link">
              Browse all {categoryLabel} articles →
            </Link>
          </div>
        </aside>
      </div>

      {/* Related Articles */}
      {related.length > 0 && (
        <section className="related-section">
          <div className="container">
            <h2 className="related-title">Continue Reading</h2>
            <div className="related-grid">
              {related.slice(0, 3).map((a: any) => (
                <ArticleCard key={a.slug} article={a} />
              ))}
            </div>
          </div>
        </section>
      )}

      <style>{`
        .article-hero {
          position: relative;
          height: 480px;
          overflow: hidden;
        }
        .article-hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .article-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(10,26,47,0.95) 0%, rgba(10,26,47,0.6) 50%, rgba(10,26,47,0.2) 100%);
        }
        .article-hero-content {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          padding-bottom: var(--space-10);
          padding-top: var(--space-8);
        }
        .article-meta-top {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          margin-bottom: var(--space-4);
        }
        .article-category-badge {
          background: var(--accent);
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          padding: 4px 12px;
          border-radius: 100px;
          text-decoration: none;
        }
        .article-reading-time {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.7);
        }
        .article-hero-title {
          font-size: clamp(1.75rem, 3.5vw, 2.75rem);
          font-weight: 800;
          color: white;
          line-height: 1.15;
          margin-bottom: var(--space-4);
          letter-spacing: -0.02em;
          max-width: 800px;
        }
        .article-hero-desc {
          font-size: 1.05rem;
          color: rgba(255,255,255,0.8);
          max-width: 700px;
          line-height: 1.6;
          margin-bottom: var(--space-4);
        }
        .article-hero-meta {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          font-size: 0.875rem;
          color: rgba(255,255,255,0.65);
        }
        .meta-sep { opacity: 0.4; }

        /* Layout */
        .article-layout {
          display: grid;
          grid-template-columns: 1fr 280px;
          gap: var(--space-12);
          padding-top: var(--space-10);
          padding-bottom: var(--space-16);
          align-items: start;
        }
        @media (max-width: 1024px) {
          .article-layout { grid-template-columns: 1fr; }
          .article-sidebar { display: none; }
        }

        /* TL;DR */
        .article-tldr {
          background: var(--accent-soft);
          border-left: 4px solid var(--accent);
          border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
          padding: var(--space-5) var(--space-6);
          margin-bottom: var(--space-8);
        }
        .tldr-label {
          font-size: 0.7rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--accent);
          margin-bottom: var(--space-2);
        }
        .article-tldr p {
          margin: 0;
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }

        /* Prose */
        .prose { font-size: 1.0625rem; line-height: 1.8; color: var(--text-primary); }
        .prose h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: var(--space-10) 0 var(--space-4);
          letter-spacing: -0.01em;
          padding-bottom: var(--space-3);
          border-bottom: 2px solid var(--border-light);
        }
        .prose h3 {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: var(--space-8) 0 var(--space-3);
        }
        .prose p { margin-bottom: var(--space-5); }
        .prose ul, .prose ol {
          margin: var(--space-5) 0;
          padding-left: var(--space-6);
        }
        .prose li { margin-bottom: var(--space-2); }
        .prose a {
          color: var(--accent);
          text-decoration: underline;
          text-decoration-color: rgba(var(--accent-rgb), 0.3);
          text-underline-offset: 3px;
        }
        .prose a:hover { text-decoration-color: var(--accent); }
        .prose blockquote {
          border-left: 4px solid var(--accent);
          padding: var(--space-4) var(--space-6);
          margin: var(--space-8) 0;
          background: var(--bg-secondary);
          border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
          font-style: italic;
          color: var(--text-secondary);
        }
        .prose strong { font-weight: 700; color: var(--text-primary); }
        .prose .author-byline { display: none; } /* handled separately */
        .prose .sanskrit-mantra {
          text-align: center;
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-top: var(--space-10);
          padding-top: var(--space-6);
          border-top: 1px solid var(--border-light);
        }

        /* Tags */
        .article-tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
          margin: var(--space-8) 0;
          padding-top: var(--space-6);
          border-top: 1px solid var(--border-light);
        }
        .article-tag {
          background: var(--bg-secondary);
          color: var(--text-secondary);
          font-size: 0.8rem;
          padding: 4px 12px;
          border-radius: 100px;
          border: 1px solid var(--border-light);
        }

        /* Share */
        .article-share {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          margin-top: var(--space-8);
          padding: var(--space-5) var(--space-6);
          background: var(--bg-secondary);
          border-radius: var(--radius-xl);
        }
        .share-label { font-size: 0.875rem; color: var(--text-secondary); }
        .share-btn {
          background: var(--accent);
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 100px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: background var(--transition-fast);
        }
        .share-btn:hover { background: var(--accent-hover); }

        /* Sidebar */
        .article-sidebar {
          position: sticky;
          top: 80px;
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }
        .sidebar-assessment-cta {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          color: white;
        }
        .sidebar-cta-icon { font-size: 1.5rem; margin-bottom: var(--space-3); }
        .sidebar-assessment-cta h4 {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: var(--space-2);
          color: white;
        }
        .sidebar-assessment-cta p {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.85);
          margin-bottom: var(--space-4);
        }
        .sidebar-more {
          background: var(--bg-secondary);
          border-radius: var(--radius-xl);
          padding: var(--space-5);
        }
        .sidebar-more h4 {
          font-size: 0.875rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--space-3);
        }
        .sidebar-more-link {
          font-size: 0.875rem;
          color: var(--accent);
          text-decoration: none;
        }
        .sidebar-more-link:hover { text-decoration: underline; }

        /* Related */
        .related-section {
          background: var(--bg-secondary);
          padding: var(--space-12) 0;
        }
        .related-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: var(--space-8);
          color: var(--text-primary);
        }
        .related-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--space-6);
        }

        /* Loading/Not Found */
        .article-loading, .not-found {
          padding: var(--space-16) 0;
          min-height: 60vh;
        }
        .not-found h1 { margin-bottom: var(--space-4); }
        .not-found p { margin-bottom: var(--space-6); color: var(--text-secondary); }
      `}</style>
    </div>
  );
}

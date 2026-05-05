import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArticleCard } from '../components/ArticleCard';

const CATEGORIES = [
  { slug: '', label: 'All Articles' },
  { slug: 'getting-started', label: 'Getting Started' },
  { slug: 'visas-paperwork', label: 'Visas & Paperwork' },
  { slug: 'culture-identity', label: 'Culture & Identity' },
  { slug: 'money-banking', label: 'Money & Banking' },
  { slug: 'health-wellbeing', label: 'Health & Wellbeing' },
  { slug: 'community', label: 'Community' },
  { slug: 'relationships', label: 'Relationships' },
  { slug: 'work-legal', label: 'Work & Legal' },
  { slug: 'family', label: 'Family' },
];

export default function ArticlesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const activeCategory = searchParams.get('category') || '';

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '100' });
    if (activeCategory) params.set('category', activeCategory);
    fetch(`/api/articles?${params}`)
      .then(r => r.json())
      .then(data => {
        setArticles(data.articles || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeCategory]);

  const filtered = search.trim()
    ? articles.filter(a =>
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.meta_desc?.toLowerCase().includes(search.toLowerCase()) ||
        a.tags?.some((t: string) => t.toLowerCase().includes(search.toLowerCase()))
      )
    : articles;

  const activeCategoryLabel = CATEGORIES.find(c => c.slug === activeCategory)?.label || 'All Articles';

  return (
    <div className="articles-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-bg">
          <img
            src="https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1400&q=80"
            alt="World map and travel"
          />
          <div className="page-header-overlay" />
        </div>
        <div className="container page-header-content">
          <h1 className="page-header-title">
            {activeCategory ? activeCategoryLabel : 'All Articles'}
          </h1>
          <p className="page-header-subtitle">
            {activeCategory
              ? `In-depth guides on ${activeCategoryLabel.toLowerCase()} for expats and people considering the move.`
              : 'The complete library — practical guides, psychological insight, and honest advice for every stage of the expat journey.'}
          </p>
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search articles..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="category-tabs-bar">
        <div className="container">
          <div className="category-tabs">
            {CATEGORIES.map(cat => (
              <button
                key={cat.slug}
                className={`category-tab ${activeCategory === cat.slug ? 'active' : ''}`}
                onClick={() => {
                  if (cat.slug) setSearchParams({ category: cat.slug });
                  else setSearchParams({});
                  setSearch('');
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="container articles-container">
        {loading ? (
          <div className="article-grid">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '320px', borderRadius: '16px' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <p>No articles found{search ? ` for "${search}"` : ''}.</p>
          </div>
        ) : (
          <>
            <div className="articles-count">
              {filtered.length} article{filtered.length !== 1 ? 's' : ''}
              {search ? ` matching "${search}"` : activeCategory ? ` in ${activeCategoryLabel}` : ''}
            </div>
            <div className="article-grid">
              {filtered.map(article => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          </>
        )}
      </div>

      <style>{`
        .articles-page { min-height: 80vh; }
        .page-header {
          position: relative;
          padding: var(--space-16) 0 var(--space-12);
          overflow: hidden;
        }
        .page-header-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .page-header-bg img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .page-header-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(10,26,47,0.93) 0%, rgba(10,26,47,0.75) 100%);
        }
        .page-header-content {
          position: relative;
          z-index: 1;
        }
        .page-header-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          color: white;
          margin-bottom: var(--space-3);
          letter-spacing: -0.02em;
        }
        .page-header-subtitle {
          font-size: 1.05rem;
          color: rgba(255,255,255,0.8);
          max-width: 600px;
          margin-bottom: var(--space-6);
          line-height: 1.6;
        }
        .search-bar {
          display: flex;
          align-items: center;
          background: white;
          border-radius: 100px;
          padding: 10px 20px;
          max-width: 480px;
          gap: var(--space-3);
          box-shadow: var(--shadow-lg);
        }
        .search-icon { font-size: 1rem; color: var(--text-muted); }
        .search-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 0.95rem;
          color: var(--text-primary);
          background: transparent;
        }
        .search-clear {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          font-size: 0.85rem;
          padding: 2px 6px;
        }
        .category-tabs-bar {
          background: var(--bg-primary);
          border-bottom: 1px solid var(--border-light);
          position: sticky;
          top: 64px;
          z-index: 10;
        }
        .category-tabs {
          display: flex;
          gap: 0;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .category-tabs::-webkit-scrollbar { display: none; }
        .category-tab {
          background: none;
          border: none;
          border-bottom: 3px solid transparent;
          padding: var(--space-4) var(--space-5);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-secondary);
          cursor: pointer;
          white-space: nowrap;
          transition: all var(--transition-fast);
        }
        .category-tab:hover { color: var(--text-primary); }
        .category-tab.active {
          color: var(--accent);
          border-bottom-color: var(--accent);
          font-weight: 600;
        }
        .articles-container {
          padding-top: var(--space-8);
          padding-bottom: var(--space-16);
        }
        .articles-count {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin-bottom: var(--space-6);
        }
        .article-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--space-6);
        }
        .empty-state {
          text-align: center;
          padding: var(--space-16);
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}

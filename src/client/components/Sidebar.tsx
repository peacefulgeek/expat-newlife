import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface Article {
  slug: string;
  title: string;
  category: string;
  published_at: string;
  reading_time?: number;
}

interface CategoryCount {
  name: string;
  slug: string;
  count: number;
}

const CATEGORIES: CategoryCount[] = [
  { name: 'Getting Started', slug: 'getting-started', count: 0 },
  { name: 'Visas & Paperwork', slug: 'visas-paperwork', count: 0 },
  { name: 'Money & Banking', slug: 'money-banking', count: 0 },
  { name: 'Culture & Identity', slug: 'culture-identity', count: 0 },
  { name: 'Relationships', slug: 'relationships', count: 0 },
  { name: 'Work & Legal', slug: 'work-legal', count: 0 },
  { name: 'Health & Wellbeing', slug: 'health-wellbeing', count: 0 },
  { name: 'Community', slug: 'community', count: 0 },
];

export function Sidebar() {
  const location = useLocation();
  const [popular, setPopular] = useState<Article[]>([]);
  const [recent, setRecent] = useState<Article[]>([]);
  const [categories, setCategories] = useState(CATEGORIES);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Fetch articles for popular/recent modules
    fetch('/api/articles?limit=50')
      .then(r => r.json())
      .then(data => {
        const articles: Article[] = data.articles || [];

        // Update category counts
        const updated = CATEGORIES.map(cat => ({
          ...cat,
          count: articles.filter(a => a.category === cat.slug).length,
        }));
        setCategories(updated);

        // Recent: last 5
        setRecent(articles.slice(0, 5));

        // Popular: random selection (in production, use view counts)
        const shuffled = [...articles].sort(() => Math.random() - 0.5);
        setPopular(shuffled.slice(0, 5));
      })
      .catch(() => {});
  }, []);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="mobile-menu-btn"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle navigation"
        aria-expanded={mobileOpen}
      >
        <span className="hamburger-line" />
        <span className="hamburger-line" />
        <span className="hamburger-line" />
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`} aria-label="Site navigation">
        {/* Logo */}
        <div className="sidebar-logo">
          <Link to="/" className="logo-link">
            <div className="logo-icon">✈</div>
            <div className="logo-text">
              <span className="logo-title">Moving Abroad</span>
              <span className="logo-tagline">Your Expat Life Guide</span>
            </div>
          </Link>
        </div>

        {/* Author Bio */}
        <div className="sidebar-author">
          <div className="author-photo-wrapper">
            <div className="author-photo-placeholder" aria-label="The Oracle Lover">
              <span>OL</span>
            </div>
          </div>
          <div className="author-details">
            <h3 className="author-name">The Oracle Lover</h3>
            <p className="author-title">Intuitive Educator & Oracle Guide</p>
            <p className="author-bio">
              Practical wisdom for the expat life. The logistics, the loneliness, and the slow magic of building a real life somewhere new.
            </p>
            <a
              href="https://theoraclelover.com"
              target="_blank"
              rel="noopener noreferrer"
              className="author-link"
            >
              theoraclelover.com →
            </a>
          </div>
        </div>

        {/* Category Navigation */}
        <nav className="sidebar-nav" aria-label="Categories">
          <h4 className="sidebar-section-title">Categories</h4>
          <ul className="sidebar-nav-list">
            <li>
              <Link
                to="/articles"
                className={`sidebar-nav-item ${location.pathname === '/articles' ? 'active' : ''}`}
              >
                <span className="nav-item-name">All Articles</span>
                <span className="nav-item-count">{categories.reduce((sum, c) => sum + c.count, 0)}</span>
              </Link>
            </li>
            {categories.map(cat => (
              <li key={cat.slug}>
                <Link
                  to={`/articles?category=${cat.slug}`}
                  className={`sidebar-nav-item ${location.search.includes(cat.slug) ? 'active' : ''}`}
                >
                  <span className="nav-item-name">{cat.name}</span>
                  {cat.count > 0 && (
                    <span className="nav-item-count">{cat.count}</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Popular Articles */}
        {popular.length > 0 && (
          <div className="sidebar-module">
            <h4 className="sidebar-section-title">Popular</h4>
            <ul className="sidebar-article-list">
              {popular.map(article => (
                <li key={article.slug}>
                  <Link to={`/articles/${article.slug}`} className="sidebar-article-link">
                    {article.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Recent Articles */}
        {recent.length > 0 && (
          <div className="sidebar-module">
            <h4 className="sidebar-section-title">Recent</h4>
            <ul className="sidebar-article-list">
              {recent.map(article => (
                <li key={article.slug}>
                  <Link to={`/articles/${article.slug}`} className="sidebar-article-link">
                    {article.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Assessments CTA */}
        <div className="sidebar-cta">
          <Link to="/assessments" className="sidebar-cta-link">
            <span className="sidebar-cta-icon">📋</span>
            <div>
              <strong>Take an Assessment</strong>
              <p>Find out where you are in your expat journey</p>
            </div>
          </Link>
        </div>
      </aside>

      <style>{`
        .mobile-menu-btn {
          display: none;
          position: fixed;
          top: 16px;
          left: 16px;
          z-index: 250;
          background: var(--accent);
          border: none;
          border-radius: var(--radius-md);
          padding: 10px;
          cursor: pointer;
          flex-direction: column;
          gap: 5px;
          width: 44px;
          height: 44px;
          align-items: center;
          justify-content: center;
        }

        .hamburger-line {
          display: block;
          width: 20px;
          height: 2px;
          background: white;
          border-radius: 2px;
        }

        .sidebar-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          z-index: 99;
        }

        .sidebar {
          width: var(--sidebar-width);
          min-width: var(--sidebar-width);
          background: var(--bg-sidebar);
          border-right: 1px solid var(--border-light);
          height: 100vh;
          position: sticky;
          top: 0;
          overflow-y: auto;
          overflow-x: hidden;
          padding: var(--space-6) var(--space-4);
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
          scrollbar-width: thin;
          scrollbar-color: var(--border-color) transparent;
          z-index: var(--z-sidebar);
        }

        .sidebar::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar::-webkit-scrollbar-thumb {
          background: var(--border-color);
          border-radius: 2px;
        }

        .sidebar-logo {
          padding-bottom: var(--space-4);
          border-bottom: 1px solid var(--border-light);
        }

        .logo-link {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          text-decoration: none;
        }

        .logo-icon {
          font-size: 1.75rem;
          line-height: 1;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.2;
        }

        .logo-tagline {
          font-size: 0.7rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .sidebar-author {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: var(--space-4);
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          box-shadow: var(--card-shadow);
        }

        .author-photo-wrapper {
          margin-bottom: var(--space-3);
        }

        .author-photo-placeholder {
          width: 64px;
          height: 64px;
          border-radius: var(--radius-full);
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.1rem;
          border: 3px solid var(--accent-soft);
        }

        .author-name {
          font-size: 0.95rem;
          font-weight: 700;
          margin: 0 0 2px;
        }

        .author-title {
          font-size: 0.75rem;
          color: var(--accent);
          font-weight: 600;
          margin-bottom: var(--space-2);
        }

        .author-bio {
          font-size: 0.8rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin-bottom: var(--space-3);
        }

        .author-link {
          font-size: 0.8rem;
          color: var(--accent);
          font-weight: 600;
          text-decoration: none;
        }

        .author-link:hover {
          text-decoration: underline;
        }

        .sidebar-section-title {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          margin-bottom: var(--space-3);
        }

        .sidebar-nav-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .sidebar-nav-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--space-2) var(--space-3);
          border-radius: var(--radius-sm);
          text-decoration: none;
          color: var(--text-secondary);
          font-size: 0.875rem;
          transition: all var(--transition-fast);
          margin-bottom: 2px;
        }

        .sidebar-nav-item:hover,
        .sidebar-nav-item.active {
          background: var(--accent-soft);
          color: var(--accent);
        }

        .nav-item-count {
          background: var(--accent-soft);
          color: var(--accent);
          font-size: 0.7rem;
          font-weight: 700;
          padding: 1px 7px;
          border-radius: var(--radius-full);
          min-width: 22px;
          text-align: center;
        }

        .sidebar-nav-item.active .nav-item-count {
          background: var(--accent);
          color: white;
        }

        .sidebar-module {
          display: flex;
          flex-direction: column;
        }

        .sidebar-article-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .sidebar-article-list li {
          margin-bottom: 2px;
        }

        .sidebar-article-link {
          display: block;
          padding: var(--space-2) var(--space-3);
          font-size: 0.8rem;
          color: var(--text-secondary);
          text-decoration: none;
          border-radius: var(--radius-sm);
          line-height: 1.4;
          transition: all var(--transition-fast);
        }

        .sidebar-article-link:hover {
          background: var(--accent-soft);
          color: var(--accent);
        }

        .sidebar-cta {
          margin-top: auto;
        }

        .sidebar-cta-link {
          display: flex;
          align-items: flex-start;
          gap: var(--space-3);
          padding: var(--space-4);
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
          border-radius: var(--radius-lg);
          text-decoration: none;
          color: white;
          transition: transform var(--transition-fast);
        }

        .sidebar-cta-link:hover {
          transform: translateY(-2px);
          color: white;
        }

        .sidebar-cta-icon {
          font-size: 1.5rem;
          line-height: 1;
          flex-shrink: 0;
        }

        .sidebar-cta-link strong {
          display: block;
          font-size: 0.875rem;
          margin-bottom: 2px;
        }

        .sidebar-cta-link p {
          font-size: 0.75rem;
          color: rgba(255,255,255,0.8);
          margin: 0;
        }

        @media (max-width: 768px) {
          .mobile-menu-btn {
            display: flex;
          }

          .sidebar-overlay {
            display: block;
          }

          .sidebar {
            position: fixed;
            left: -100%;
            top: 0;
            height: 100vh;
            transition: left var(--transition-base);
            box-shadow: 4px 0 20px rgba(0,0,0,0.15);
          }

          .sidebar.sidebar-open {
            left: 0;
          }
        }
      `}</style>
    </>
  );
}

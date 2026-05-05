import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArticleCard } from '../components/ArticleCard';

const CATEGORIES = [
  { slug: 'getting-started', label: 'Getting Started', icon: '🌍', desc: 'The practical foundation' },
  { slug: 'visas-paperwork', label: 'Visas & Paperwork', icon: '📋', desc: 'Navigate the bureaucracy' },
  { slug: 'culture-identity', label: 'Culture & Identity', icon: '🪞', desc: 'Who you become abroad' },
  { slug: 'money-banking', label: 'Money & Banking', icon: '💰', desc: 'Financial clarity' },
  { slug: 'health-wellbeing', label: 'Health & Wellbeing', icon: '🌿', desc: 'Stay well abroad' },
  { slug: 'community', label: 'Community', icon: '🤝', desc: 'Find your people' },
  { slug: 'relationships', label: 'Relationships', icon: '❤️', desc: 'Love across distance' },
  { slug: 'work-legal', label: 'Work & Legal', icon: '⚖️', desc: 'Work abroad legally' },
  { slug: 'family', label: 'Family', icon: '👨‍👩‍👧', desc: 'Moving with children' },
];

const FEATURED_SLUGS = [
  'moving-abroad-fantasy-vs-reality',
  'culture-shock-four-stages',
  'first-30-days-administrative-priority-list',
  'building-social-life-from-zero',
  'identity-disruption-of-relocation',
  'moving-abroad-checklist-complete',
];

export default function HomePage() {
  const [featuredArticles, setFeaturedArticles] = useState<any[]>([]);
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/articles?limit=30')
      .then(r => r.json())
      .then(data => {
        const articles = data.articles || [];
        const featured = FEATURED_SLUGS.map(slug => articles.find((a: any) => a.slug === slug)).filter(Boolean);
        setFeaturedArticles(featured.slice(0, 6));
        const recent = [...articles].sort((a: any, b: any) =>
          new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
        ).slice(0, 4);
        setRecentArticles(recent);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg">
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1600&q=80"
            alt="Aerial view of a beautiful foreign city"
            className="hero-bg-img"
          />
          <div className="hero-overlay" />
        </div>
        <div className="hero-content">
          <div className="hero-badge">Your Expat Life Guide</div>
          <h1 className="hero-title">
            Moving Abroad.<br />
            <span className="hero-title-accent">The Real Version.</span>
          </h1>
          <p className="hero-subtitle">
            The practical and psychological guide to moving abroad — the logistics, the culture shock,
            the identity disruption, and building a real life somewhere new.
          </p>
          <div className="hero-actions">
            <Link to="/assessments/expat-readiness-quiz" className="btn btn-primary btn-lg">
              Take the Readiness Quiz
            </Link>
            <Link to="/articles" className="btn btn-ghost btn-lg">
              Browse All Articles
            </Link>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-number">30+</span>
              <span className="hero-stat-label">In-depth articles</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">5</span>
              <span className="hero-stat-label">Assessments</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-number">9</span>
              <span className="hero-stat-label">Topic categories</span>
            </div>
          </div>
        </div>
      </section>

      {/* Assessment CTA Strip */}
      <section className="assessment-strip">
        <div className="container">
          <div className="assessment-strip-inner">
            <div className="assessment-strip-text">
              <h2>Not sure where to start?</h2>
              <p>Take our 5-minute Expat Readiness Assessment and get a personalized action plan.</p>
            </div>
            <Link to="/assessments/expat-readiness-quiz" className="btn btn-accent">
              Start the Assessment →
            </Link>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="section category-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Explore by Topic</h2>
            <p className="section-subtitle">Every dimension of the expat experience, covered honestly.</p>
          </div>
          <div className="category-grid">
            {CATEGORIES.map(cat => (
              <Link key={cat.slug} to={`/articles?category=${cat.slug}`} className="category-card">
                <span className="category-icon">{cat.icon}</span>
                <h3 className="category-name">{cat.label}</h3>
                <p className="category-desc">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="section featured-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Essential Reading</h2>
            <p className="section-subtitle">The articles that matter most, wherever you are in the journey.</p>
          </div>
          {loading ? (
            <div className="article-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '320px', borderRadius: 'var(--radius-xl)' }} />
              ))}
            </div>
          ) : (
            <div className="article-grid">
              {featuredArticles.map(article => (
                <ArticleCard key={article.slug} article={article} />
              ))}
            </div>
          )}
          <div style={{ textAlign: 'center', marginTop: 'var(--space-10)' }}>
            <Link to="/articles" className="btn btn-outline btn-lg">
              View All 30+ Articles →
            </Link>
          </div>
        </div>
      </section>

      {/* Assessments Section */}
      <section className="section assessments-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Know Yourself Before You Go</h2>
            <p className="section-subtitle">
              These assessments are designed to give you honest, useful insight — not flattery.
            </p>
          </div>
          <div className="assessment-cards">
            <Link to="/assessments/expat-readiness-quiz" className="assessment-card assessment-card-featured">
              <div className="assessment-card-img">
                <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80" alt="Expat readiness" />
                <div className="assessment-card-overlay" />
              </div>
              <div className="assessment-card-body">
                <span className="assessment-badge">5 min · 10 questions</span>
                <h3>Are You Ready to Move Abroad?</h3>
                <p>Discover your strengths, blind spots, and what to focus on before you make the move.</p>
                <span className="btn btn-primary">Take the Quiz →</span>
              </div>
            </Link>
            <div className="assessment-cards-secondary">
              {[
                { slug: 'culture-shock-readiness-quiz', title: 'How Will You Handle Culture Shock?', time: '4 min', emoji: '🌊' },
                { slug: 'expat-financial-readiness-quiz', title: 'Is Your Money Ready for the Move?', time: '4 min', emoji: '💰' },
                { slug: 'expat-identity-quiz', title: 'What Kind of Expat Will You Be?', time: '5 min', emoji: '🪞' },
                { slug: 'trailing-spouse-support-quiz', title: 'Are You the Trailing Spouse?', time: '4 min', emoji: '❤️' },
              ].map(a => (
                <Link key={a.slug} to={`/assessments/${a.slug}`} className="assessment-card-mini">
                  <span className="assessment-card-mini-emoji">{a.emoji}</span>
                  <div>
                    <h4>{a.title}</h4>
                    <span className="assessment-badge">{a.time}</span>
                  </div>
                  <span className="assessment-card-mini-arrow">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Articles */}
      <section className="section recent-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Recently Published</h2>
          </div>
          {loading ? (
            <div className="article-grid article-grid-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="skeleton" style={{ height: '280px', borderRadius: 'var(--radius-xl)' }} />
              ))}
            </div>
          ) : (
            <div className="article-grid article-grid-4">
              {recentArticles.map(article => (
                <ArticleCard key={article.slug} article={article} compact />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Oracle Lover CTA */}
      <section className="oracle-cta-section">
        <div className="container">
          <div className="oracle-cta-inner">
            <div className="oracle-cta-text">
              <p className="oracle-cta-label">The Oracle Lover</p>
              <h2>Intuitive guidance for the journey</h2>
              <p>
                Moving abroad is not just a logistical project. It's a psychological and spiritual one.
                The Oracle Lover brings intuitive wisdom to the practical questions of expat life.
              </p>
              <a
                href="https://theoraclelover.com"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-accent"
              >
                Visit The Oracle Lover →
              </a>
            </div>
            <div className="oracle-cta-quote">
              <blockquote>
                "You Are Beautiful And Unlimited In Myriad Ways, In Unlimited Directions.
                Remember That You Are Light. YOU ARE LIGHT!"
                <cite>— Paul (Kalesh)</cite>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        /* Hero */
        .hero-section {
          position: relative;
          min-height: 600px;
          display: flex;
          align-items: center;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .hero-bg-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(10,26,47,0.92) 0%, rgba(10,26,47,0.7) 60%, rgba(10,26,47,0.4) 100%);
        }
        .hero-content {
          position: relative;
          z-index: 1;
          padding: var(--space-16) var(--space-8);
          max-width: 700px;
        }
        .hero-badge {
          display: inline-block;
          background: rgba(255,255,255,0.15);
          border: 1px solid rgba(255,255,255,0.3);
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 6px 16px;
          border-radius: 100px;
          margin-bottom: var(--space-5);
          backdrop-filter: blur(8px);
        }
        .hero-title {
          font-size: clamp(2.5rem, 5vw, 4rem);
          font-weight: 800;
          color: white;
          line-height: 1.1;
          margin-bottom: var(--space-5);
          letter-spacing: -0.02em;
        }
        .hero-title-accent {
          background: linear-gradient(135deg, var(--accent-light) 0%, var(--accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-subtitle {
          font-size: 1.125rem;
          color: rgba(255,255,255,0.85);
          line-height: 1.7;
          margin-bottom: var(--space-8);
          max-width: 560px;
        }
        .hero-actions {
          display: flex;
          gap: var(--space-4);
          flex-wrap: wrap;
          margin-bottom: var(--space-10);
        }
        .hero-stats {
          display: flex;
          gap: var(--space-8);
        }
        .hero-stat {
          display: flex;
          flex-direction: column;
        }
        .hero-stat-number {
          font-size: 1.75rem;
          font-weight: 800;
          color: white;
          line-height: 1;
        }
        .hero-stat-label {
          font-size: 0.8rem;
          color: rgba(255,255,255,0.6);
          margin-top: 4px;
        }

        /* Assessment Strip */
        .assessment-strip {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
          padding: var(--space-8) 0;
        }
        .assessment-strip-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: var(--space-6);
          flex-wrap: wrap;
        }
        .assessment-strip-text h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          margin: 0 0 4px;
        }
        .assessment-strip-text p {
          color: rgba(255,255,255,0.85);
          margin: 0;
          font-size: 0.95rem;
        }

        /* Category Grid */
        .category-section { background: var(--bg-secondary); }
        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: var(--space-4);
        }
        .category-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          text-decoration: none;
          transition: all var(--transition-base);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }
        .category-card:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .category-icon { font-size: 1.75rem; }
        .category-name {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }
        .category-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin: 0;
        }

        /* Article Grid */
        .article-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: var(--space-6);
        }
        .article-grid-4 {
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        }

        /* Assessment Cards */
        .assessments-section { background: var(--bg-secondary); }
        .assessment-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-6);
        }
        @media (max-width: 900px) {
          .assessment-cards { grid-template-columns: 1fr; }
        }
        .assessment-card-featured {
          background: var(--bg-primary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-2xl);
          overflow: hidden;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          transition: all var(--transition-base);
        }
        .assessment-card-featured:hover {
          transform: translateY(-3px);
          box-shadow: var(--shadow-lg);
          border-color: var(--accent);
        }
        .assessment-card-img {
          position: relative;
          height: 200px;
          overflow: hidden;
        }
        .assessment-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .assessment-card-featured:hover .assessment-card-img img {
          transform: scale(1.05);
        }
        .assessment-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(10,26,47,0.6) 0%, transparent 60%);
        }
        .assessment-card-body {
          padding: var(--space-6);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          flex: 1;
        }
        .assessment-card-body h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }
        .assessment-card-body p {
          color: var(--text-secondary);
          font-size: 0.9rem;
          margin: 0;
          flex: 1;
        }
        .assessment-badge {
          display: inline-block;
          background: var(--accent-soft);
          color: var(--accent);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: 100px;
        }
        .assessment-cards-secondary {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .assessment-card-mini {
          background: var(--bg-primary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-xl);
          padding: var(--space-5);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: var(--space-4);
          transition: all var(--transition-base);
        }
        .assessment-card-mini:hover {
          border-color: var(--accent);
          transform: translateX(4px);
          box-shadow: var(--shadow-sm);
        }
        .assessment-card-mini-emoji { font-size: 1.5rem; flex-shrink: 0; }
        .assessment-card-mini h4 {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-primary);
          margin: 0 0 4px;
        }
        .assessment-card-mini-arrow {
          margin-left: auto;
          color: var(--accent);
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        /* Oracle CTA */
        .oracle-cta-section {
          background: linear-gradient(135deg, var(--bg-dark) 0%, #0a1a2f 100%);
          padding: var(--space-16) 0;
        }
        .oracle-cta-inner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-12);
          align-items: center;
        }
        @media (max-width: 768px) {
          .oracle-cta-inner { grid-template-columns: 1fr; }
        }
        .oracle-cta-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--accent);
          margin-bottom: var(--space-3);
        }
        .oracle-cta-text h2 {
          font-size: 2rem;
          font-weight: 800;
          color: white;
          margin-bottom: var(--space-4);
        }
        .oracle-cta-text p {
          color: rgba(255,255,255,0.75);
          line-height: 1.7;
          margin-bottom: var(--space-6);
        }
        .oracle-cta-quote blockquote {
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: var(--radius-2xl);
          padding: var(--space-8);
          font-size: 1.1rem;
          font-style: italic;
          color: rgba(255,255,255,0.9);
          line-height: 1.7;
          position: relative;
          background: rgba(255,255,255,0.05);
        }
        .oracle-cta-quote blockquote::before {
          content: '"';
          font-size: 4rem;
          color: var(--accent);
          position: absolute;
          top: -10px;
          left: 20px;
          line-height: 1;
          font-style: normal;
        }
        .oracle-cta-quote cite {
          display: block;
          margin-top: var(--space-4);
          font-size: 0.85rem;
          color: var(--accent);
          font-style: normal;
          font-weight: 600;
        }

        /* Sections */
        .section { padding: var(--space-16) 0; }
        .section-header {
          text-align: center;
          margin-bottom: var(--space-10);
        }
        .section-title {
          font-size: clamp(1.75rem, 3vw, 2.5rem);
          font-weight: 800;
          color: var(--text-primary);
          margin-bottom: var(--space-3);
          letter-spacing: -0.02em;
        }
        .section-subtitle {
          font-size: 1.05rem;
          color: var(--text-secondary);
          max-width: 560px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';

const BOOKS = [
  {
    title: 'The Expert Expat',
    author: 'Melissa Brayer Hess & Patricia Linderman',
    desc: 'The most comprehensive practical guide to the full relocation process. Covers everything from housing to healthcare to building community.',
    url: 'https://www.amazon.com/dp/0071408495?tag=spankyspinola-20',
    category: 'Essential Reading',
  },
  {
    title: 'Third Culture Kids',
    author: 'David Pollock & Ruth Van Reken',
    desc: 'The definitive resource for parents raising children abroad and for TCKs trying to understand their own experience.',
    url: 'https://www.amazon.com/dp/1857928288?tag=spankyspinola-20',
    category: 'Family',
  },
  {
    title: 'The Art of Coming Home',
    author: 'Craig Storti',
    desc: 'Addresses the grief of both departure and return with unusual honesty. Essential for anyone who has lived abroad.',
    url: 'https://www.amazon.com/dp/1931930252?tag=spankyspinola-20',
    category: 'Psychology',
  },
  {
    title: 'Women Who Run With the Wolves',
    author: 'Clarissa Pinkola Estes',
    desc: 'One of the most useful books for understanding identity reconstruction and the recovery of the authentic self.',
    url: 'https://www.amazon.com/dp/0062316095?tag=spankyspinola-20',
    category: 'Identity',
  },
];

const TOOLS = [
  {
    name: 'Wise (formerly TransferWise)',
    desc: 'The best way to hold and transfer money internationally. Real exchange rates, low fees.',
    url: 'https://wise.com',
    category: 'Banking',
  },
  {
    name: 'Revolut',
    desc: 'Multi-currency account with excellent travel features and competitive exchange rates.',
    url: 'https://revolut.com',
    category: 'Banking',
  },
  {
    name: 'SafetyWing',
    desc: 'Affordable international health insurance designed specifically for digital nomads and expats.',
    url: 'https://safetywing.com',
    category: 'Insurance',
  },
  {
    name: 'Numbeo',
    desc: 'The most comprehensive cost of living database. Compare cities and build realistic budgets.',
    url: 'https://numbeo.com',
    category: 'Research',
  },
];

export default function RecommendedPage() {
  return (
    <div className="recommended-page">
      <div className="page-hero">
        <div className="page-hero-bg">
          <img src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&q=80" alt="Travel" />
          <div className="page-hero-overlay" />
        </div>
        <div className="page-hero-content">
          <h1>Recommended Resources</h1>
          <p>Books, tools, and services that actually help. Curated by The Oracle Lover.</p>
        </div>
      </div>

      <div className="rec-container">
        <div className="rec-disclaimer">
          <strong>Disclosure:</strong> Some links on this page are affiliate links. We may earn a small commission at no extra cost to you. We only recommend things we genuinely believe in.
        </div>

        <section className="rec-section">
          <h2>Essential Books</h2>
          <div className="rec-grid">
            {BOOKS.map(book => (
              <a key={book.title} href={book.url} target="_blank" rel="nofollow sponsored noopener noreferrer" className="rec-card">
                <div className="rec-card-category">{book.category}</div>
                <h3 className="rec-card-title">{book.title}</h3>
                <p className="rec-card-author">by {book.author}</p>
                <p className="rec-card-desc">{book.desc}</p>
                <span className="rec-card-cta">View on Amazon →</span>
              </a>
            ))}
          </div>
        </section>

        <section className="rec-section">
          <h2>Tools & Services</h2>
          <div className="rec-grid">
            {TOOLS.map(tool => (
              <a key={tool.name} href={tool.url} target="_blank" rel="noopener noreferrer" className="rec-card">
                <div className="rec-card-category">{tool.category}</div>
                <h3 className="rec-card-title">{tool.name}</h3>
                <p className="rec-card-desc">{tool.desc}</p>
                <span className="rec-card-cta">Learn More →</span>
              </a>
            ))}
          </div>
        </section>

        <div className="rec-cta">
          <h2>Ready to assess your readiness?</h2>
          <p>Take our free assessments to understand where you are in the journey.</p>
          <Link to="/assessments" className="btn btn-primary btn-lg">Browse Assessments →</Link>
        </div>
      </div>

      <style>{`
        .recommended-page { min-height: 80vh; }
        .page-hero {
          position: relative;
          height: 280px;
          overflow: hidden;
        }
        .page-hero-bg { position: absolute; inset: 0; }
        .page-hero-bg img { width: 100%; height: 100%; object-fit: cover; }
        .page-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(10,26,47,0.92) 0%, rgba(10,26,47,0.7) 100%);
        }
        .page-hero-content {
          position: relative;
          z-index: 1;
          padding: var(--space-16) var(--space-8);
          color: white;
        }
        .page-hero-content h1 { color: white; margin-bottom: var(--space-3); }
        .page-hero-content p { color: rgba(255,255,255,0.8); font-size: 1.1rem; }
        .rec-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: var(--space-10) var(--space-8) var(--space-16);
        }
        .rec-disclaimer {
          background: var(--accent-soft);
          border: 1px solid var(--accent);
          border-radius: var(--radius-lg);
          padding: var(--space-4) var(--space-5);
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin-bottom: var(--space-10);
        }
        .rec-section { margin-bottom: var(--space-12); }
        .rec-section h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--space-6);
          padding-bottom: var(--space-3);
          border-bottom: 2px solid var(--border-light);
        }
        .rec-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--space-5);
        }
        .rec-card {
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          text-decoration: none;
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          transition: all var(--transition-base);
        }
        .rec-card:hover {
          border-color: var(--accent);
          transform: translateY(-3px);
          box-shadow: var(--shadow-md);
        }
        .rec-card-category {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--accent);
        }
        .rec-card-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }
        .rec-card-author {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin: 0;
        }
        .rec-card-desc {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
          flex: 1;
        }
        .rec-card-cta {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--accent);
          margin-top: var(--space-2);
        }
        .rec-cta {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
          border-radius: var(--radius-2xl);
          padding: var(--space-10);
          text-align: center;
          color: white;
        }
        .rec-cta h2 { color: white; margin-bottom: var(--space-3); }
        .rec-cta p { color: rgba(255,255,255,0.85); margin-bottom: var(--space-6); }
        .btn-lg { padding: 14px 32px; font-size: 1rem; }
      `}</style>
    </div>
  );
}

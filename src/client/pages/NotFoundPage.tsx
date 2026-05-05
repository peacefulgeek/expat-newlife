import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="nf-content">
        <div className="nf-icon">🌍</div>
        <h1>404 — Lost Abroad</h1>
        <p>The page you're looking for doesn't exist. Maybe it moved countries.</p>
        <div className="nf-actions">
          <Link to="/" className="btn btn-primary">Go Home</Link>
          <Link to="/articles" className="btn btn-outline">Browse Articles</Link>
          <Link to="/assessments" className="btn btn-outline">Take an Assessment</Link>
        </div>
      </div>
      <style>{`
        .not-found-page {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-16) var(--space-8);
        }
        .nf-content { text-align: center; max-width: 480px; }
        .nf-icon { font-size: 4rem; margin-bottom: var(--space-6); }
        .nf-content h1 { font-size: 2rem; margin-bottom: var(--space-4); }
        .nf-content p { color: var(--text-secondary); margin-bottom: var(--space-8); font-size: 1.1rem; }
        .nf-actions { display: flex; gap: var(--space-3); justify-content: center; flex-wrap: wrap; }
      `}</style>
    </div>
  );
}

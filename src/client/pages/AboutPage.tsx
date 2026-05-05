import React from 'react';
import { Link } from 'react-router-dom';

export default function AboutPage() {
  return (
    <div className="about-page">
      <div className="page-hero">
        <div className="page-hero-bg">
          <img src="https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1400&q=80" alt="Journey" />
          <div className="page-hero-overlay" />
        </div>
        <div className="page-hero-content">
          <h1>About Moving Abroad</h1>
          <p>The real version. By The Oracle Lover.</p>
        </div>
      </div>

      <div className="about-container">
        <div className="about-content">
          <h2>Why this site exists</h2>
          <p>
            Most moving abroad content falls into one of two categories: breathless enthusiasm ("I moved to Portugal and my life is AMAZING!") or dry logistics ("Here are the visa requirements for 47 countries").
          </p>
          <p>
            Neither is what people actually need. What people need is honest, practical, psychologically grounded information about what moving abroad is actually like — the logistics, the culture shock, the identity disruption, the loneliness, the slow magic of building a real life somewhere new.
          </p>
          <p>
            That's what this site is. Written by The Oracle Lover — an intuitive educator and oracle guide who brings both practical wisdom and psychological depth to the questions of expat life.
          </p>

          <h2>About The Oracle Lover</h2>
          <p>
            The Oracle Lover is an intuitive educator, oracle guide, and writer whose work focuses on the intersection of practical life navigation and spiritual wisdom. The Oracle Lover's approach is grounded, honest, and refuses to pretend that major life transitions are simple.
          </p>
          <p>
            Visit <a href="https://theoraclelover.com" target="_blank" rel="noopener noreferrer">theoraclelover.com</a> for the full body of work.
          </p>

          <h2>The Oracle Lover's Guiding Principle</h2>
          <blockquote>
            "You Are Beautiful And Unlimited In Myriad Ways, In Unlimited Directions. Remember That You Are Light. YOU ARE LIGHT!"
            <cite>— Paul (Kalesh)</cite>
          </blockquote>

          <div className="about-cta">
            <Link to="/assessments/expat-readiness-quiz" className="btn btn-primary">Take the Readiness Quiz →</Link>
            <Link to="/articles" className="btn btn-outline">Browse Articles</Link>
          </div>
        </div>
      </div>

      <style>{`
        .about-page { min-height: 80vh; }
        .page-hero { position: relative; height: 280px; overflow: hidden; }
        .page-hero-bg { position: absolute; inset: 0; }
        .page-hero-bg img { width: 100%; height: 100%; object-fit: cover; }
        .page-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(10,26,47,0.92) 0%, rgba(10,26,47,0.7) 100%);
        }
        .page-hero-content { position: relative; z-index: 1; padding: var(--space-16) var(--space-8); color: white; }
        .page-hero-content h1 { color: white; margin-bottom: var(--space-3); }
        .page-hero-content p { color: rgba(255,255,255,0.8); font-size: 1.1rem; }
        .about-container { max-width: 800px; margin: 0 auto; padding: var(--space-12) var(--space-8) var(--space-16); }
        .about-content h2 { color: var(--accent); margin-top: var(--space-10); }
        .about-content p { color: var(--text-secondary); line-height: 1.8; }
        .about-content blockquote { margin: var(--space-8) 0; }
        .about-content cite { display: block; margin-top: var(--space-3); font-size: 0.875rem; color: var(--accent); font-style: normal; font-weight: 600; }
        .about-cta { display: flex; gap: var(--space-4); margin-top: var(--space-10); flex-wrap: wrap; }
      `}</style>
    </div>
  );
}

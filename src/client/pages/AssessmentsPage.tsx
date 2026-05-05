import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/assessments')
      .then(r => r.json())
      .then(data => {
        setAssessments(data.assessments || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="assessments-page">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-bg">
          <img
            src="https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=1400&q=80"
            alt="Self-discovery and reflection"
          />
          <div className="page-header-overlay" />
        </div>
        <div className="container page-header-content">
          <div className="page-header-badge">Know Yourself Before You Go</div>
          <h1 className="page-header-title">Expat Readiness Assessments</h1>
          <p className="page-header-subtitle">
            These aren't personality quizzes designed to make you feel good. They're honest assessments
            designed to give you useful information about where you're prepared and where you have gaps.
          </p>
        </div>
      </div>

      {/* Assessments Grid */}
      <div className="container assessments-container">
        {loading ? (
          <div className="assessments-grid">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: '380px', borderRadius: '20px' }} />
            ))}
          </div>
        ) : (
          <div className="assessments-grid">
            {assessments.map((assessment, idx) => (
              <Link
                key={assessment.slug}
                to={`/assessments/${assessment.slug}`}
                className={`assessment-card ${idx === 0 ? 'assessment-card-featured' : ''}`}
              >
                <div className="assessment-card-img">
                  <img
                    src={assessment.hero_url || `https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80`}
                    alt={assessment.title}
                  />
                  <div className="assessment-card-overlay" />
                  <div className="assessment-card-badge">
                    {assessment.estimated_minutes} min · {assessment.question_count} questions
                  </div>
                </div>
                <div className="assessment-card-body">
                  <div className="assessment-card-category">{assessment.subtitle}</div>
                  <h2 className="assessment-card-title">{assessment.title}</h2>
                  <p className="assessment-card-desc">{assessment.meta_desc}</p>
                  <div className="assessment-card-cta">
                    Take the Assessment →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Why Take Assessments */}
        <div className="why-section">
          <div className="why-inner">
            <h2>Why these assessments matter</h2>
            <div className="why-grid">
              {[
                {
                  icon: '🎯',
                  title: 'Honest, not flattering',
                  desc: 'These assessments are designed to surface your real gaps, not confirm your existing beliefs.'
                },
                {
                  icon: '📋',
                  title: 'Actionable results',
                  desc: 'Every result includes specific recommendations and links to relevant articles.'
                },
                {
                  icon: '🔄',
                  title: 'Take them again',
                  desc: 'Your readiness changes as you prepare. Retake any assessment as your situation evolves.'
                },
                {
                  icon: '🌍',
                  title: 'Built for expats',
                  desc: 'Designed specifically for people considering or navigating a move abroad — not generic personality tests.'
                },
              ].map(item => (
                <div key={item.title} className="why-card">
                  <span className="why-icon">{item.icon}</span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .assessments-page { min-height: 80vh; }
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
        .page-header-badge {
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
        .page-header-title {
          font-size: clamp(2rem, 4vw, 3rem);
          font-weight: 800;
          color: white;
          margin-bottom: var(--space-4);
          letter-spacing: -0.02em;
        }
        .page-header-subtitle {
          font-size: 1.05rem;
          color: rgba(255,255,255,0.8);
          max-width: 640px;
          line-height: 1.7;
        }
        .assessments-container {
          padding-top: var(--space-12);
          padding-bottom: var(--space-16);
        }
        .assessments-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: var(--space-6);
          margin-bottom: var(--space-16);
        }
        .assessment-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-2xl);
          overflow: hidden;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          transition: all var(--transition-base);
        }
        .assessment-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl);
          border-color: var(--accent);
        }
        .assessment-card-featured {
          grid-column: 1 / -1;
          flex-direction: row;
        }
        @media (max-width: 768px) {
          .assessment-card-featured { flex-direction: column; }
        }
        .assessment-card-img {
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
        }
        .assessment-card:not(.assessment-card-featured) .assessment-card-img {
          height: 200px;
        }
        .assessment-card-featured .assessment-card-img {
          width: 45%;
          min-height: 300px;
        }
        @media (max-width: 768px) {
          .assessment-card-featured .assessment-card-img {
            width: 100%;
            min-height: 200px;
          }
        }
        .assessment-card-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s ease;
        }
        .assessment-card:hover .assessment-card-img img { transform: scale(1.05); }
        .assessment-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(10,26,47,0.5) 0%, transparent 60%);
        }
        .assessment-card-badge {
          position: absolute;
          top: var(--space-4);
          left: var(--space-4);
          background: rgba(255,255,255,0.95);
          color: var(--text-primary);
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 12px;
          border-radius: 100px;
        }
        .assessment-card-body {
          padding: var(--space-6);
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
          flex: 1;
        }
        .assessment-card-featured .assessment-card-body {
          padding: var(--space-8);
          justify-content: center;
        }
        .assessment-card-category {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--accent);
        }
        .assessment-card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.3;
        }
        .assessment-card-featured .assessment-card-title {
          font-size: 1.75rem;
        }
        .assessment-card-desc {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
          flex: 1;
        }
        .assessment-card-cta {
          display: inline-block;
          background: var(--accent);
          color: white;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 10px 20px;
          border-radius: 100px;
          margin-top: var(--space-2);
          align-self: flex-start;
          transition: background var(--transition-fast);
        }
        .assessment-card:hover .assessment-card-cta { background: var(--accent-hover); }

        /* Why Section */
        .why-section {
          background: var(--bg-secondary);
          border-radius: var(--radius-2xl);
          padding: var(--space-10);
        }
        .why-inner h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--space-8);
          text-align: center;
        }
        .why-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: var(--space-6);
        }
        .why-card {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .why-icon { font-size: 1.75rem; }
        .why-card h3 {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
        }
        .why-card p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}

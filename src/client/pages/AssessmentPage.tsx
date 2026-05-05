import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

type Option = { value: string; text: string; score: number };
type Question = { id: string; text: string; options: Option[] };
type ResultRange = { range: [number, number]; label: string; emoji: string; headline: string; summary: string; recommendations: string[]; oracle_message: string };
type Assessment = {
  slug: string; title: string; subtitle: string; meta_desc: string;
  intro: string; hero_url: string; estimated_minutes: number; question_count: number;
  questions: Question[]; results: ResultRange[];
};

export default function AssessmentPage() {
  const { slug } = useParams<{ slug: string }>();
  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Quiz state
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'results'>('intro');
  const [result, setResult] = useState<ResultRange | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/assessments/${slug}`)
      .then(r => {
        if (!r.ok) { setNotFound(true); setLoading(false); return null; }
        return r.json();
      })
      .then(data => {
        if (!data) return;
        setAssessment(data.assessment);
        setLoading(false);
        window.scrollTo(0, 0);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [slug]);

  const handleStart = () => {
    setPhase('quiz');
    setCurrentQ(0);
    setAnswers({});
    setSelectedOption(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelect = (optionValue: string, score: number) => {
    if (!assessment) return;
    const qId = assessment.questions[currentQ].id;
    setSelectedOption(optionValue);
    const newAnswers = { ...answers, [qId]: score };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentQ < assessment.questions.length - 1) {
        setCurrentQ(currentQ + 1);
        setSelectedOption(null);
      } else {
        // Calculate result
        const total = Object.values(newAnswers).reduce((a, b) => a + b, 0);
        const res = assessment.results.find(r => total >= r.range[0] && total <= r.range[1]);
        setResult(res || assessment.results[assessment.results.length - 1]);
        setPhase('results');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 400);
  };

  const handleRetake = () => {
    setPhase('intro');
    setCurrentQ(0);
    setAnswers({});
    setSelectedOption(null);
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', minHeight: '60vh' }}>
        <div className="skeleton" style={{ height: '400px', borderRadius: '20px' }} />
      </div>
    );
  }

  if (notFound || !assessment) {
    return (
      <div className="container not-found" style={{ padding: '80px 0', minHeight: '60vh' }}>
        <h1>Assessment not found</h1>
        <Link to="/assessments" className="btn btn-primary">Browse all assessments</Link>
      </div>
    );
  }

  const progress = phase === 'quiz' ? ((currentQ) / assessment.questions.length) * 100 : phase === 'results' ? 100 : 0;
  const totalScore = Object.values(answers).reduce((a, b) => a + b, 0);
  const maxScore = assessment.questions.length * 3;

  return (
    <div className="assessment-page">
      {/* Hero */}
      <div className="assessment-hero">
        <img
          src={assessment.hero_url || 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1400&q=80'}
          alt={assessment.title}
          className="assessment-hero-img"
        />
        <div className="assessment-hero-overlay" />
        <div className="container assessment-hero-content">
          <Link to="/assessments" className="back-link">← All Assessments</Link>
          <div className="assessment-hero-badge">{assessment.subtitle}</div>
          <h1 className="assessment-hero-title">{assessment.title}</h1>
          <div className="assessment-hero-meta">
            <span>⏱ {assessment.estimated_minutes} minutes</span>
            <span>·</span>
            <span>📝 {assessment.question_count} questions</span>
            <span>·</span>
            <span>🎯 Free</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {phase === 'quiz' && (
        <div className="quiz-progress-bar">
          <div className="quiz-progress-fill" style={{ width: `${progress}%` }} />
        </div>
      )}

      {/* Content */}
      <div className="container assessment-content">
        {/* Intro Phase */}
        {phase === 'intro' && (
          <div className="assessment-intro">
            <div className="assessment-intro-card">
              <div className="assessment-intro-icon">📊</div>
              <h2>About this assessment</h2>
              <p className="assessment-intro-text">{assessment.intro}</p>
              <div className="assessment-intro-stats">
                <div className="intro-stat">
                  <span className="intro-stat-number">{assessment.question_count}</span>
                  <span className="intro-stat-label">Questions</span>
                </div>
                <div className="intro-stat">
                  <span className="intro-stat-number">{assessment.estimated_minutes}</span>
                  <span className="intro-stat-label">Minutes</span>
                </div>
                <div className="intro-stat">
                  <span className="intro-stat-number">{assessment.results.length}</span>
                  <span className="intro-stat-label">Result profiles</span>
                </div>
              </div>
              <button className="btn btn-primary btn-xl" onClick={handleStart}>
                Start the Assessment →
              </button>
              <p className="assessment-intro-note">No sign-up required. Your answers are not stored.</p>
            </div>
          </div>
        )}

        {/* Quiz Phase */}
        {phase === 'quiz' && (
          <div className="quiz-container">
            <div className="quiz-header">
              <span className="quiz-counter">Question {currentQ + 1} of {assessment.questions.length}</span>
              <div className="quiz-dots">
                {assessment.questions.map((_, i) => (
                  <div
                    key={i}
                    className={`quiz-dot ${i < currentQ ? 'done' : i === currentQ ? 'active' : ''}`}
                  />
                ))}
              </div>
            </div>

            <div className="quiz-question-card">
              <h2 className="quiz-question-text">
                {assessment.questions[currentQ].text}
              </h2>
              <div className="quiz-options">
                {assessment.questions[currentQ].options.map(option => (
                  <button
                    key={option.value}
                    className={`quiz-option ${selectedOption === option.value ? 'selected' : ''}`}
                    onClick={() => handleSelect(option.value, option.score)}
                    disabled={selectedOption !== null}
                  >
                    <span className="quiz-option-letter">{option.value.toUpperCase()}</span>
                    <span className="quiz-option-text">{option.text}</span>
                    {selectedOption === option.value && (
                      <span className="quiz-option-check">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Results Phase */}
        {phase === 'results' && result && (
          <div className="results-container">
            {/* Score Card */}
            <div className="results-score-card">
              <div className="results-emoji">{result.emoji}</div>
              <div className="results-label">{result.label}</div>
              <h2 className="results-headline">{result.headline}</h2>
              <div className="results-score-bar-container">
                <div className="results-score-bar-track">
                  <div
                    className="results-score-bar-fill"
                    style={{ width: `${(totalScore / maxScore) * 100}%` }}
                  />
                </div>
                <div className="results-score-numbers">
                  <span>0</span>
                  <span className="results-score-current">{totalScore}/{maxScore}</span>
                  <span>{maxScore}</span>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="results-summary">
              <p>{result.summary}</p>
            </div>

            {/* Recommendations */}
            <div className="results-recommendations">
              <h3>What to do next</h3>
              <ul>
                {result.recommendations.map((rec, i) => (
                  <li key={i} dangerouslySetInnerHTML={{ __html: rec }} />
                ))}
              </ul>
            </div>

            {/* Oracle Message */}
            <div className="results-oracle">
              <div className="oracle-label">The Oracle Lover says:</div>
              <blockquote
                className="oracle-quote"
                dangerouslySetInnerHTML={{ __html: result.oracle_message }}
              />
            </div>

            {/* Actions */}
            <div className="results-actions">
              <button className="btn btn-outline" onClick={handleRetake}>
                Retake Assessment
              </button>
              <Link to="/assessments" className="btn btn-primary">
                Try Another Assessment →
              </Link>
              <Link to="/articles" className="btn btn-ghost">
                Browse Articles
              </Link>
            </div>

            {/* Inspirational Close */}
            <div className="results-inspiration">
              <blockquote>
                "You Are Beautiful And Unlimited In Myriad Ways, In Unlimited Directions.
                Remember That You Are Light. YOU ARE LIGHT!"
                <cite>— Paul (Kalesh)</cite>
              </blockquote>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .assessment-page { min-height: 80vh; }

        /* Hero */
        .assessment-hero {
          position: relative;
          height: 360px;
          overflow: hidden;
        }
        .assessment-hero-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .assessment-hero-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(10,26,47,0.95) 0%, rgba(10,26,47,0.6) 60%, rgba(10,26,47,0.2) 100%);
        }
        .assessment-hero-content {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          padding-bottom: var(--space-8);
        }
        .back-link {
          display: inline-block;
          color: rgba(255,255,255,0.7);
          font-size: 0.875rem;
          text-decoration: none;
          margin-bottom: var(--space-4);
          transition: color var(--transition-fast);
        }
        .back-link:hover { color: white; }
        .assessment-hero-badge {
          display: inline-block;
          background: var(--accent);
          color: white;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          padding: 4px 12px;
          border-radius: 100px;
          margin-bottom: var(--space-3);
        }
        .assessment-hero-title {
          font-size: clamp(1.75rem, 3.5vw, 2.75rem);
          font-weight: 800;
          color: white;
          margin-bottom: var(--space-3);
          letter-spacing: -0.02em;
        }
        .assessment-hero-meta {
          display: flex;
          gap: var(--space-3);
          align-items: center;
          font-size: 0.875rem;
          color: rgba(255,255,255,0.7);
        }

        /* Progress Bar */
        .quiz-progress-bar {
          height: 4px;
          background: var(--border-light);
          position: sticky;
          top: 64px;
          z-index: 10;
        }
        .quiz-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent) 0%, var(--accent-light) 100%);
          transition: width 0.4s ease;
        }

        /* Content */
        .assessment-content {
          padding: var(--space-12) 0 var(--space-16);
          max-width: 720px;
          margin: 0 auto;
        }

        /* Intro */
        .assessment-intro { display: flex; justify-content: center; }
        .assessment-intro-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-2xl);
          padding: var(--space-10);
          text-align: center;
          max-width: 560px;
          width: 100%;
          box-shadow: var(--shadow-lg);
        }
        .assessment-intro-icon { font-size: 2.5rem; margin-bottom: var(--space-4); }
        .assessment-intro-card h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--space-4);
        }
        .assessment-intro-text {
          font-size: 1rem;
          color: var(--text-secondary);
          line-height: 1.7;
          margin-bottom: var(--space-8);
        }
        .assessment-intro-stats {
          display: flex;
          justify-content: center;
          gap: var(--space-8);
          margin-bottom: var(--space-8);
          padding: var(--space-5) 0;
          border-top: 1px solid var(--border-light);
          border-bottom: 1px solid var(--border-light);
        }
        .intro-stat { display: flex; flex-direction: column; align-items: center; }
        .intro-stat-number {
          font-size: 2rem;
          font-weight: 800;
          color: var(--accent);
          line-height: 1;
        }
        .intro-stat-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 4px;
        }
        .btn-xl { padding: 14px 32px; font-size: 1rem; }
        .assessment-intro-note {
          font-size: 0.8rem;
          color: var(--text-muted);
          margin-top: var(--space-4);
        }

        /* Quiz */
        .quiz-container { max-width: 640px; margin: 0 auto; }
        .quiz-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--space-8);
        }
        .quiz-counter {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-muted);
        }
        .quiz-dots {
          display: flex;
          gap: 6px;
        }
        .quiz-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--border-light);
          transition: all var(--transition-fast);
        }
        .quiz-dot.done { background: var(--accent); opacity: 0.5; }
        .quiz-dot.active { background: var(--accent); transform: scale(1.3); }
        .quiz-question-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-2xl);
          padding: var(--space-8);
          box-shadow: var(--shadow-md);
        }
        .quiz-question-text {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.4;
          margin-bottom: var(--space-6);
        }
        .quiz-options {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .quiz-option {
          display: flex;
          align-items: flex-start;
          gap: var(--space-4);
          padding: var(--space-4) var(--space-5);
          background: var(--bg-secondary);
          border: 2px solid var(--border-light);
          border-radius: var(--radius-xl);
          cursor: pointer;
          text-align: left;
          transition: all var(--transition-fast);
          font-size: 0.95rem;
          color: var(--text-primary);
        }
        .quiz-option:hover:not(:disabled) {
          border-color: var(--accent);
          background: var(--accent-soft);
        }
        .quiz-option.selected {
          border-color: var(--accent);
          background: var(--accent-soft);
        }
        .quiz-option:disabled { cursor: default; }
        .quiz-option-letter {
          flex-shrink: 0;
          width: 28px;
          height: 28px;
          background: var(--border-light);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
          transition: all var(--transition-fast);
        }
        .quiz-option.selected .quiz-option-letter {
          background: var(--accent);
          color: white;
        }
        .quiz-option-text { flex: 1; line-height: 1.5; }
        .quiz-option-check {
          flex-shrink: 0;
          color: var(--accent);
          font-weight: 700;
          font-size: 1rem;
        }

        /* Results */
        .results-container {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
          max-width: 640px;
          margin: 0 auto;
        }
        .results-score-card {
          background: linear-gradient(135deg, var(--bg-dark) 0%, #0a1a2f 100%);
          border-radius: var(--radius-2xl);
          padding: var(--space-10);
          text-align: center;
          color: white;
        }
        .results-emoji { font-size: 3rem; margin-bottom: var(--space-3); }
        .results-label {
          display: inline-block;
          background: var(--accent);
          color: white;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          padding: 4px 14px;
          border-radius: 100px;
          margin-bottom: var(--space-4);
        }
        .results-headline {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          margin-bottom: var(--space-6);
          line-height: 1.3;
        }
        .results-score-bar-container { max-width: 320px; margin: 0 auto; }
        .results-score-bar-track {
          height: 8px;
          background: rgba(255,255,255,0.2);
          border-radius: 100px;
          overflow: hidden;
          margin-bottom: 8px;
        }
        .results-score-bar-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent-light) 0%, var(--accent) 100%);
          border-radius: 100px;
          transition: width 1s ease;
        }
        .results-score-numbers {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: rgba(255,255,255,0.5);
        }
        .results-score-current {
          color: var(--accent-light);
          font-weight: 700;
        }
        .results-summary {
          background: var(--bg-secondary);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          font-size: 1rem;
          color: var(--text-secondary);
          line-height: 1.7;
        }
        .results-summary p { margin: 0; }
        .results-recommendations {
          background: var(--bg-primary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
        }
        .results-recommendations h3 {
          font-size: 1rem;
          font-weight: 700;
          color: var(--text-primary);
          margin-bottom: var(--space-4);
        }
        .results-recommendations ul {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }
        .results-recommendations li {
          padding-left: var(--space-6);
          position: relative;
          font-size: 0.95rem;
          color: var(--text-secondary);
          line-height: 1.6;
        }
        .results-recommendations li::before {
          content: '→';
          position: absolute;
          left: 0;
          color: var(--accent);
          font-weight: 700;
        }
        .results-recommendations a { color: var(--accent); }
        .results-oracle {
          background: linear-gradient(135deg, var(--accent-soft) 0%, rgba(var(--accent-rgb), 0.05) 100%);
          border: 1px solid var(--accent);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
        }
        .oracle-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--accent);
          margin-bottom: var(--space-3);
        }
        .oracle-quote {
          font-size: 1rem;
          font-style: italic;
          color: var(--text-secondary);
          line-height: 1.7;
          margin: 0;
          border: none;
          padding: 0;
          background: none;
        }
        .oracle-quote a { color: var(--accent); }
        .results-actions {
          display: flex;
          gap: var(--space-3);
          flex-wrap: wrap;
        }
        .results-inspiration {
          background: linear-gradient(135deg, var(--bg-dark) 0%, #0a1a2f 100%);
          border-radius: var(--radius-xl);
          padding: var(--space-8);
          text-align: center;
        }
        .results-inspiration blockquote {
          font-size: 1rem;
          font-style: italic;
          color: rgba(255,255,255,0.85);
          line-height: 1.7;
          margin: 0;
          border: none;
          padding: 0;
          background: none;
        }
        .results-inspiration cite {
          display: block;
          margin-top: var(--space-3);
          font-size: 0.85rem;
          color: var(--accent-light);
          font-style: normal;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

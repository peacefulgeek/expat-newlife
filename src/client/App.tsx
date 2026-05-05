import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import './styles/global.css';

// Lazy-load pages for code splitting
const HomePage = lazy(() => import('./pages/HomePage'));
const ArticlesPage = lazy(() => import('./pages/ArticlesPage'));
const ArticlePage = lazy(() => import('./pages/ArticlePage'));
const AssessmentsPage = lazy(() => import('./pages/AssessmentsPage'));
const AssessmentPage = lazy(() => import('./pages/AssessmentPage'));
const RecommendedPage = lazy(() => import('./pages/RecommendedPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function LoadingFallback() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
      <div className="skeleton" style={{ width: '100%', height: '200px', marginBottom: '16px' }} />
      <div className="skeleton" style={{ width: '80%', height: '24px', margin: '0 auto 12px' }} />
      <div className="skeleton" style={{ width: '60%', height: '16px', margin: '0 auto' }} />
    </div>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-col">
          <h4>Explore</h4>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/articles">All Articles</a></li>
            <li><a href="/assessments">Assessments</a></li>
            <li><a href="/recommended">Recommended</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Topics</h4>
          <ul>
            <li><a href="/articles?category=getting-started">Getting Started</a></li>
            <li><a href="/articles?category=visas-paperwork">Visas & Paperwork</a></li>
            <li><a href="/articles?category=culture-identity">Culture & Identity</a></li>
            <li><a href="/articles?category=money-banking">Money & Banking</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Legal</h4>
          <ul>
            <li><a href="/privacy">Privacy Policy</a></li>
            <li><a href="/privacy#affiliate">Affiliate Disclosure</a></li>
            <li><a href="/privacy#disclaimer">Disclaimer</a></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Connect</h4>
          <ul>
            <li><a href="https://theoraclelover.com" target="_blank" rel="noopener noreferrer">The Oracle Lover</a></li>
            <li><a href="/about">About This Site</a></li>
          </ul>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginTop: '12px' }}>
            Expat life. Real talk.
          </p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Moving Abroad. All rights reserved.{' '}
          As an Amazon Associate I earn from qualifying purchases.
        </p>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="site-wrapper">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <main className="main-content" style={{ flex: 1 }}>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/articles" element={<ArticlesPage />} />
              <Route path="/articles/:slug" element={<ArticlePage />} />
              <Route path="/assessments" element={<AssessmentsPage />} />
              <Route path="/assessments/:slug" element={<AssessmentPage />} />
              <Route path="/recommended" element={<RecommendedPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </div>
  );
}

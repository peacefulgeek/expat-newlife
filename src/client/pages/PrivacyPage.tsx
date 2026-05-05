import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <h1>Privacy Policy & Disclosures</h1>
        <p className="updated">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <section id="privacy">
          <h2>Privacy Policy</h2>
          <p>Moving Abroad respects your privacy. This site does not collect personal information unless you voluntarily provide it. We do not sell, trade, or transfer your personal information to outside parties.</p>
          <p>We may use standard web analytics tools (such as server-side logging) to understand how visitors use this site. This data is aggregated and anonymous.</p>
        </section>

        <section id="affiliate">
          <h2>Affiliate Disclosure</h2>
          <p>Moving Abroad participates in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.</p>
          <p>Some links on this site are affiliate links. If you click on one of these links and make a purchase, we may receive a small commission at no extra cost to you. This helps support the site and allows us to continue creating free content.</p>
          <p>We only recommend products and services we genuinely believe will be helpful to our readers. Our editorial opinions are not influenced by affiliate relationships.</p>
        </section>

        <section id="disclaimer">
          <h2>Disclaimer</h2>
          <p>The content on Moving Abroad is for informational purposes only. It is not legal, financial, or professional advice. Immigration laws, visa requirements, and financial regulations change frequently and vary by country. Always consult qualified professionals for advice specific to your situation.</p>
          <p>The Oracle Lover is not a licensed attorney, financial advisor, or immigration specialist. Content on this site reflects personal experience and research, not professional advice.</p>
        </section>

        <section id="cookies">
          <h2>Cookies</h2>
          <p>This site may use cookies to improve your browsing experience. You can choose to disable cookies through your browser settings. Disabling cookies may affect some functionality of this site.</p>
        </section>
      </div>

      <style>{`
        .privacy-page { min-height: 80vh; }
        .privacy-container {
          max-width: 800px;
          margin: 0 auto;
          padding: var(--space-12) var(--space-8) var(--space-16);
        }
        .privacy-container h1 { margin-bottom: var(--space-2); }
        .updated { color: var(--text-muted); font-size: 0.875rem; margin-bottom: var(--space-10); }
        .privacy-container section { margin-bottom: var(--space-10); }
        .privacy-container h2 {
          color: var(--accent);
          font-size: 1.25rem;
          margin-bottom: var(--space-4);
          padding-bottom: var(--space-2);
          border-bottom: 1px solid var(--border-light);
        }
        .privacy-container p { color: var(--text-secondary); line-height: 1.8; }
      `}</style>
    </div>
  );
}

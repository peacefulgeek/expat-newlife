import React from 'react';

interface Props {
  publishedAt?: string;
  lastModifiedAt?: string;
}

export function AuthorByline({ publishedAt, lastModifiedAt }: Props) {
  const displayDate = lastModifiedAt || publishedAt;

  return (
    <div className="author-byline-card" itemScope itemType="https://schema.org/Person">
      <div className="author-photo-placeholder" aria-label="The Oracle Lover">
        <span>OL</span>
      </div>
      <div className="author-info">
        <h4 itemProp="name">
          <a
            href="https://theoraclelover.com"
            target="_blank"
            rel="noopener noreferrer"
            itemProp="url"
          >
            The Oracle Lover
          </a>
        </h4>
        <p itemProp="jobTitle">Intuitive Educator & Oracle Guide</p>
        {displayDate && (
          <p className="byline-date">
            <time dateTime={displayDate} itemProp="dateModified">
              {new Date(displayDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </time>
          </p>
        )}
      </div>
      <style>{`
        .author-photo-placeholder {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1rem;
          flex-shrink: 0;
          border: 2px solid var(--accent-soft);
        }
        .author-info h4 { font-size: 1rem; margin: 0 0 2px; }
        .author-info h4 a { color: var(--accent); text-decoration: none; }
        .author-info h4 a:hover { text-decoration: underline; }
        .author-info p { font-size: 0.85rem; color: var(--text-secondary); margin: 0; }
        .byline-date { font-size: 0.8rem !important; color: var(--text-muted) !important; margin-top: 4px !important; }
      `}</style>
    </div>
  );
}

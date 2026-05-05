import React, { useState, useEffect } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface Props {
  articleBody: string;
}

export function TableOfContents({ articleBody }: Props) {
  const [activeId, setActiveId] = useState('');
  const [items, setItems] = useState<TocItem[]>([]);

  useEffect(() => {
    // Parse H2/H3 from article body
    const parser = new DOMParser();
    const doc = parser.parseFromString(articleBody, 'text/html');
    const headings = doc.querySelectorAll('h2, h3');
    const tocItems: TocItem[] = [];
    headings.forEach((h, i) => {
      const id = h.id || `heading-${i}`;
      tocItems.push({
        id,
        text: h.textContent || '',
        level: parseInt(h.tagName[1]),
      });
    });
    setItems(tocItems);
  }, [articleBody]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0% -70% 0%' }
    );

    items.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [items]);

  if (items.length < 3) return null;

  return (
    <nav className="toc" aria-label="Table of contents">
      <h4 className="toc-title">In This Article</h4>
      <ul className="toc-list">
        {items.map(item => (
          <li key={item.id} className={`toc-item toc-level-${item.level}`}>
            <a
              href={`#${item.id}`}
              className={`toc-link ${activeId === item.id ? 'active' : ''}`}
              onClick={e => {
                e.preventDefault();
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
      <style>{`
        .toc {
          background: var(--bg-accent-soft);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          margin-bottom: var(--space-8);
        }
        .toc-title {
          font-size: 0.8rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--text-muted);
          margin: 0 0 var(--space-3);
        }
        .toc-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .toc-item {
          margin-bottom: 4px;
        }
        .toc-level-3 {
          padding-left: var(--space-4);
        }
        .toc-link {
          font-size: 0.875rem;
          color: var(--text-secondary);
          text-decoration: none;
          display: block;
          padding: 3px 0;
          border-left: 2px solid transparent;
          padding-left: var(--space-3);
          transition: all var(--transition-fast);
        }
        .toc-link:hover,
        .toc-link.active {
          color: var(--accent);
          border-left-color: var(--accent);
        }
      `}</style>
    </nav>
  );
}

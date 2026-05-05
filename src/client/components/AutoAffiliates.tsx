import React from 'react';

interface Product {
  asin: string;
  name: string;
  category: string;
  tags: string[];
  description?: string;
}

interface Props {
  articleTitle: string;
  articleTags: string[];
  articleCategory: string;
  catalog: Product[];
  bottomSectionName?: string;
}

function matchProducts(articleTitle: string, articleTags: string[], articleCategory: string, catalog: Product[], max = 4): Product[] {
  const scored = catalog.map(p => {
    let score = 0;
    if (p.category === articleCategory) score += 10;
    for (const tag of articleTags) if (p.tags.includes(tag)) score += 3;
    const titleWords = articleTitle.toLowerCase().split(/\W+/).filter(w => w.length > 3);
    const name = p.name.toLowerCase();
    for (const w of titleWords) if (name.includes(w)) score += 2;
    return { product: p, score };
  }).sort((a, b) => b.score - a.score);
  return scored.slice(0, max).map(s => s.product);
}

const SOFT_PHRASES = [
  "One option that many people like is",
  "A tool that often helps with this is",
  "Something worth considering might be",
  "For those looking for a simple solution, this works well:",
  "A popular choice for situations like this is",
];

export function AutoAffiliates({ articleTitle, articleTags, articleCategory, catalog, bottomSectionName = 'Moving Abroad Library' }: Props) {
  const products = matchProducts(articleTitle, articleTags, articleCategory, catalog);

  if (products.length === 0) return null;

  return (
    <section className="auto-affiliates" aria-label={bottomSectionName}>
      <h3>{bottomSectionName}</h3>
      <ul>
        {products.map((p, i) => (
          <li key={p.asin}>
            <span className="soft-phrase">{SOFT_PHRASES[i % SOFT_PHRASES.length]} </span>
            <a
              href={`https://www.amazon.com/dp/${p.asin}?tag=spankyspinola-20`}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
            >
              {p.name}
            </a>
            <span className="disclosure"> (paid link)</span>
            {p.description && <p className="product-desc">{p.description}</p>}
          </li>
        ))}
      </ul>
      <p className="affiliate-disclosure">
        As an Amazon Associate, I earn from qualifying purchases.
      </p>
      <style>{`
        .soft-phrase { color: var(--text-secondary); }
        .disclosure { font-size: 0.8em; color: var(--text-muted); }
        .product-desc { font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px; margin-bottom: 0; }
      `}</style>
    </section>
  );
}

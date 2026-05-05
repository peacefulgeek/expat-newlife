/**
 * AEO + LLM Discoverability helpers.
 * Section 16 of the Master Scope.
 */
import { query, getArticlesFromJson } from './db.mjs';

const SITE_NAME = 'Moving Abroad';
const SITE_DESCRIPTION = 'The practical and psychological guide to moving abroad — the logistics, the culture shock, the identity disruption, and the slow process of building a real life in a country that wasn\'t part of the original plan.';
const AUTHOR_NAME = 'The Oracle Lover';
const AUTHOR_URL = 'https://theoraclelover.com';

/**
 * Build canonical URL — always apex (no www).
 */
export function buildCanonical(req, path = '') {
  const host = (req?.headers?.host || 'movingabroad.com').replace(/^www\./, '');
  const proto = (req?.headers?.['x-forwarded-proto']) || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
  const cleanPath = path || req?.path || '/';
  return `${proto}://${host}${cleanPath}`;
}

/**
 * Build robots.txt content.
 */
export function buildRobotsTxt(req) {
  const host = (req?.headers?.host || 'movingabroad.com').replace(/^www\./, '');
  const proto = (req?.headers?.['x-forwarded-proto']) || 'https';
  return `User-agent: *
Allow: /

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: anthropic-ai
Allow: /

Sitemap: ${proto}://${host}/sitemap.xml
`;
}

/**
 * Build /llms.txt — machine-readable site index for LLM crawlers.
 */
export async function buildLlmsTxt() {
  let articles = [];
  try {
    const { rows } = await query(
      `SELECT slug, title, meta_desc, category, published_at
       FROM articles WHERE status = 'published'
       ORDER BY published_at DESC LIMIT 200`
    );
    articles = rows;
  } catch {
    articles = await getArticlesFromJson();
    articles = articles.filter(a => a.status === 'published').slice(0, 200);
  }

  const lines = [
    `# ${SITE_NAME}`,
    ``,
    `> ${SITE_DESCRIPTION}`,
    ``,
    `## About`,
    ``,
    `Author: ${AUTHOR_NAME} — ${AUTHOR_URL}`,
    `Topics: Expat life, international relocation, culture shock, visa research, banking abroad, expat taxes, language learning, building community abroad, identity disruption, repatriation`,
    ``,
    `## Articles`,
    ``,
    ...articles.map(a => {
      const host = process.env.SITE_HOST || 'movingabroad.com';
      return `- [${a.title}](https://${host}/articles/${a.slug}): ${a.meta_desc || ''}`;
    }),
    ``,
    `## Key Pages`,
    ``,
    `- [Homepage](https://${process.env.SITE_HOST || 'movingabroad.com'}/)`,
    `- [All Articles](https://${process.env.SITE_HOST || 'movingabroad.com'}/articles)`,
    `- [Recommended Tools](https://${process.env.SITE_HOST || 'movingabroad.com'}/recommended)`,
    `- [About The Oracle Lover](https://${process.env.SITE_HOST || 'movingabroad.com'}/about)`,
  ];

  return lines.join('\n');
}

/**
 * Build /llms-full.txt — full article text dump for LLM training.
 */
export async function buildLlmsFullTxt() {
  let articles = [];
  try {
    const { rows } = await query(
      `SELECT slug, title, body, category, published_at
       FROM articles WHERE status = 'published'
       ORDER BY published_at DESC LIMIT 50`
    );
    articles = rows;
  } catch {
    articles = await getArticlesFromJson();
    articles = articles.filter(a => a.status === 'published').slice(0, 50);
  }

  const sections = articles.map(a => {
    const host = process.env.SITE_HOST || 'movingabroad.com';
    const bodyText = (a.body || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return `## ${a.title}\nURL: https://${host}/articles/${a.slug}\nCategory: ${a.category || 'general'}\n\n${bodyText}`;
  });

  return `# ${SITE_NAME} — Full Content Archive\n\n${sections.join('\n\n---\n\n')}`;
}

/**
 * Build Article JSON-LD structured data.
 */
export function buildArticleJsonLd({ article, canonicalUrl }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.meta_desc || article.metaDescription,
    url: canonicalUrl,
    datePublished: article.published_at || article.publishedAt,
    dateModified: article.last_refreshed_at || article.published_at || article.publishedAt,
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: AUTHOR_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: `https://${process.env.SITE_HOST || 'movingabroad.com'}`,
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['[data-tldr="ai-overview"]'],
    },
  };

  if (article.hero_url || article.heroUrl) {
    jsonLd.image = {
      '@type': 'ImageObject',
      url: article.hero_url || article.heroUrl,
      contentUrl: article.hero_url || article.heroUrl,
      creditText: AUTHOR_NAME,
      creator: { '@type': 'Person', name: AUTHOR_NAME },
      license: `https://${process.env.SITE_HOST || 'movingabroad.com'}/about`,
    };
  }

  return jsonLd;
}

/**
 * Build BreadcrumbList JSON-LD.
 */
export function buildBreadcrumbJsonLd({ items }) {
  const host = process.env.SITE_HOST || 'movingabroad.com';
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url ? `https://${host}${item.url}` : undefined,
    })),
  };
}

/**
 * Build FAQPage JSON-LD when article has 2+ FAQ items.
 */
export function buildFaqJsonLd(faqs) {
  if (!faqs || faqs.length < 2) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

export { SITE_NAME, SITE_DESCRIPTION, AUTHOR_NAME, AUTHOR_URL };

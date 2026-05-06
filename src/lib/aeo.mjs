/**
 * AEO + LLM Discoverability helpers.
 * Section 16 of the Master Scope + Addendum requirements.
 */
import { query, getArticlesFromJson } from './db.mjs';

const SITE_NAME = 'ExpatNewLife';
const SITE_DESCRIPTION = 'The practical and psychological guide to moving abroad — the logistics, the culture shock, the identity disruption, and the slow process of building a real life in a country that wasn\'t part of the original plan.';
const AUTHOR_NAME = 'The Oracle Lover';
const AUTHOR_URL = 'https://theoraclelover.com';

/**
 * Build canonical URL — always apex (no www).
 */
export function buildCanonical(req, path = '') {
  const host = (req?.headers?.host || 'expatnewlife.com').replace(/^www\./, '');
  const proto = (req?.headers?.['x-forwarded-proto']) || (process.env.NODE_ENV === 'production' ? 'https' : 'http');
  const cleanPath = path || req?.path || '/';
  return `${proto}://${host}${cleanPath}`;
}

/**
 * Build robots.txt — allows all AI crawlers, includes all sitemap variants.
 * Addendum: include Bytespider, CCBot, DataForSeoBot, DotBot, MJ12bot, SemrushBot, AhrefsBot.
 */
export function buildRobotsTxt(req) {
  const host = (req?.headers?.host || 'expatnewlife.com').replace(/^www\./, '');
  const proto = (req?.headers?.['x-forwarded-proto']) || 'https';
  const base = `${proto}://${host}`;
  return `# ExpatNewLife.com robots.txt
# Generated automatically — do not edit manually

User-agent: *
Allow: /
Disallow: /api/
Disallow: /health

# OpenAI
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

# Anthropic
User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Claude-Web
Allow: /

# Google
User-agent: Google-Extended
Allow: /

User-agent: Googlebot
Allow: /

User-agent: Googlebot-Image
Allow: /

# Perplexity
User-agent: PerplexityBot
Allow: /

# Meta
User-agent: FacebookBot
Allow: /

# Microsoft / Bing
User-agent: Bingbot
Allow: /

User-agent: msnbot
Allow: /

# Common crawlers
User-agent: CCBot
Allow: /

User-agent: Bytespider
Allow: /

# SEO crawlers (allow for discoverability)
User-agent: AhrefsBot
Allow: /

User-agent: SemrushBot
Allow: /

User-agent: DataForSeoBot
Allow: /

User-agent: DotBot
Allow: /

User-agent: MJ12bot
Allow: /

# Sitemaps
Sitemap: ${base}/sitemap.xml
Sitemap: ${base}/sitemap-images.xml

# LLM content files
# ${base}/llms.txt
# ${base}/llms-full.txt
# ${base}/ai.txt
`;
}

/**
 * Build /ai.txt — AI usage policy declaration.
 * Addendum requirement.
 */
export function buildAiTxt(req) {
  const host = (req?.headers?.host || 'expatnewlife.com').replace(/^www\./, '');
  const proto = (req?.headers?.['x-forwarded-proto']) || 'https';
  const base = `${proto}://${host}`;
  return `# AI Usage Policy for ExpatNewLife.com
# See: https://ai.txt standard

Site: ${base}
Owner: The Oracle Lover
Contact: hello@expatnewlife.com

# Training permissions
Training: allowed
Indexing: allowed
Summarization: allowed
Citation: required

# Attribution requirements
Attribution: Please cite as "ExpatNewLife.com" with a link to the source article.
Author: The Oracle Lover (${AUTHOR_URL})

# Content description
Description: ${SITE_DESCRIPTION}

# Topics covered
Topics: expat life, international relocation, moving abroad, culture shock, visa requirements, banking abroad, expat taxes, digital nomad, language learning, building community abroad, identity disruption, repatriation, trailing spouse, expat relationships, expat health

# Content index
LLMs-txt: ${base}/llms.txt
LLMs-full: ${base}/llms-full.txt
Sitemap: ${base}/sitemap.xml
`;
}

/**
 * Build /llms.txt — machine-readable site index for LLM crawlers.
 */
export async function buildLlmsTxt(req) {
  const host = (req?.headers?.host || process.env.SITE_HOST || 'expatnewlife.com').replace(/^www\./, '');
  const base = `https://${host}`;

  let articles = [];
  try {
    const { rows } = await query(
      `SELECT slug, title, meta_desc, category, published_at
       FROM articles WHERE status = 'published'
       ORDER BY published_at DESC LIMIT 500`
    );
    articles = rows;
  } catch {
    articles = await getArticlesFromJson();
    articles = articles.filter(a => a.status === 'published');
  }

  const lines = [
    `# ${SITE_NAME}`,
    ``,
    `> ${SITE_DESCRIPTION}`,
    ``,
    `## About`,
    ``,
    `Author: ${AUTHOR_NAME} — ${AUTHOR_URL}`,
    `Site: ${base}`,
    `Topics: Expat life, international relocation, culture shock, visa research, banking abroad, expat taxes, language learning, building community abroad, identity disruption, repatriation, digital nomad, trailing spouse`,
    ``,
    `## Key Pages`,
    ``,
    `- [Homepage](${base}/)`,
    `- [All Articles](${base}/articles)`,
    `- [Assessments](${base}/assessments)`,
    `- [Recommended Resources](${base}/recommended)`,
    `- [About The Oracle Lover](${base}/about)`,
    ``,
    `## Articles (${articles.length} published)`,
    ``,
    ...articles.map(a => `- [${a.title}](${base}/articles/${a.slug}): ${a.meta_desc || ''}`),
    ``,
    `## Full Content`,
    ``,
    `For full article text, see: ${base}/llms-full.txt`,
  ];

  return lines.join('\n');
}

/**
 * Build /llms-full.txt — full article text dump for LLM training.
 * Addendum: include all published articles, not just 50.
 */
export async function buildLlmsFullTxt(req) {
  const host = (req?.headers?.host || process.env.SITE_HOST || 'expatnewlife.com').replace(/^www\./, '');
  const base = `https://${host}`;

  let articles = [];
  try {
    const { rows } = await query(
      `SELECT slug, title, body, category, published_at, meta_desc
       FROM articles WHERE status = 'published'
       ORDER BY published_at DESC`
    );
    articles = rows;
  } catch {
    articles = await getArticlesFromJson();
    articles = articles.filter(a => a.status === 'published');
  }

  const sections = articles.map(a => {
    const bodyText = (a.body || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    return [
      `## ${a.title}`,
      `URL: ${base}/articles/${a.slug}`,
      `Category: ${a.category || 'general'}`,
      `Published: ${a.published_at ? new Date(a.published_at).toISOString().split('T')[0] : 'unknown'}`,
      `Summary: ${a.meta_desc || ''}`,
      ``,
      bodyText,
    ].join('\n');
  });

  return `# ${SITE_NAME} — Full Content Archive\n# ${base}\n# ${articles.length} articles\n\n${sections.join('\n\n---\n\n')}`;
}

/**
 * Build image sitemap for all published articles.
 * Addendum requirement.
 */
export async function buildImageSitemap(req) {
  const host = (req?.headers?.host || process.env.SITE_HOST || 'expatnewlife.com').replace(/^www\./, '');
  const proto = (req?.headers?.['x-forwarded-proto']) || 'https';
  const base = `${proto}://${host}`;

  let articles = [];
  try {
    const { rows } = await query(
      `SELECT slug, title, hero_url FROM articles WHERE status = 'published' AND hero_url IS NOT NULL`
    );
    articles = rows;
  } catch {
    articles = await getArticlesFromJson();
    articles = articles.filter(a => a.status === 'published' && a.hero_url);
  }

  const urls = articles.map(a => `
  <url>
    <loc>${base}/articles/${a.slug}</loc>
    <image:image>
      <image:loc>${a.hero_url}</image:loc>
      <image:title>${(a.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</image:title>
    </image:image>
  </url>`);

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('')}
</urlset>`;
}

/**
 * Build Article JSON-LD structured data.
 * Includes dateModified, speakable, and image with license.
 */
export function buildArticleJsonLd({ article, canonicalUrl }) {
  const host = process.env.SITE_HOST || 'expatnewlife.com';
  const publishedAt = article.published_at || article.publishedAt || new Date().toISOString();
  const modifiedAt = article.last_refreshed_at || article.updated_at || publishedAt;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.meta_desc || article.metaDescription || '',
    url: canonicalUrl,
    datePublished: new Date(publishedAt).toISOString(),
    dateModified: new Date(modifiedAt).toISOString(),
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: AUTHOR_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: `https://${host}`,
      logo: {
        '@type': 'ImageObject',
        url: `https://${host}/logo.png`,
      },
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['[data-tldr="ai-overview"]', 'h1', '.article-tldr'],
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
  };

  if (article.hero_url || article.heroUrl) {
    const imgUrl = article.hero_url || article.heroUrl;
    jsonLd.image = {
      '@type': 'ImageObject',
      url: imgUrl,
      contentUrl: imgUrl,
      creditText: AUTHOR_NAME,
      creator: { '@type': 'Person', name: AUTHOR_NAME },
      license: `https://${host}/about`,
    };
  }

  if (article.word_count || article.wordCount) {
    jsonLd.wordCount = article.word_count || article.wordCount;
  }

  return jsonLd;
}

/**
 * Build BreadcrumbList JSON-LD.
 */
export function buildBreadcrumbJsonLd({ items }) {
  const host = process.env.SITE_HOST || 'expatnewlife.com';
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

/**
 * Build WebSite JSON-LD for homepage.
 */
export function buildWebsiteJsonLd(req) {
  const host = (req?.headers?.host || process.env.SITE_HOST || 'expatnewlife.com').replace(/^www\./, '');
  const proto = (req?.headers?.['x-forwarded-proto']) || 'https';
  const base = `${proto}://${host}`;
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: base,
    author: {
      '@type': 'Person',
      name: AUTHOR_NAME,
      url: AUTHOR_URL,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${base}/articles?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export { SITE_NAME, SITE_DESCRIPTION, AUTHOR_NAME, AUTHOR_URL };

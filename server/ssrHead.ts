/**
 * Server-side <head> injection for SSR.
 * Ensures title, canonical, JSON-LD, OG, and AEO meta appear before React hydration.
 * Section 16 of the Master Scope.
 */

export function injectHead(html: string, headContent: string): string {
  if (!headContent) return html;
  return html
    .replace(/<title>[^<]*<\/title>/i, '')
    .replace(/<meta\s+name="description"[^>]*>/i, '')
    .replace('</head>', `${headContent}\n</head>`);
}

interface ArticleHeadOptions {
  title: string;
  description: string;
  slug: string;
  category?: string;
  hero_url?: string;
  author?: string;
  published_at?: string;
  last_refreshed_at?: string;
  word_count?: number;
  faq?: Array<{ question: string; answer: string }>;
}

interface AssessmentHeadOptions {
  title: string;
  description: string;
  slug: string;
  hero_url?: string;
}

const SITE_NAME = 'Moving Abroad';
const SITE_URL = process.env.SITE_URL || 'https://movingabroad.com';
const DEFAULT_OG = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80';

export function buildHomeHead(): string {
  const title = `${SITE_NAME} — Your Expat Life Guide`;
  const desc = 'The practical and psychological guide to moving abroad — the logistics, the culture shock, the identity disruption, and building a real life somewhere new.';
  const canonical = SITE_URL;

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: desc,
    publisher: {
      '@type': 'Person',
      name: 'The Oracle Lover',
      url: 'https://theoraclelover.com',
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/articles?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  });

  return `
    <title>${title}</title>
    <meta name="description" content="${desc}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${DEFAULT_OG}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${DEFAULT_OG}" />
    <script type="application/ld+json">${jsonLd}</script>
  `.trim();
}

export function buildArticleHead(article: ArticleHeadOptions): string {
  const title = `${article.title} — ${SITE_NAME}`;
  const desc = article.description;
  const canonical = `${SITE_URL}/articles/${article.slug}`;
  const image = article.hero_url || DEFAULT_OG;
  const author = article.author || 'The Oracle Lover';
  const publishedAt = article.published_at ? new Date(article.published_at).toISOString() : undefined;
  const modifiedAt = article.last_refreshed_at
    ? new Date(article.last_refreshed_at).toISOString()
    : publishedAt;

  const articleJsonLd: any = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: desc,
    url: canonical,
    image: image,
    author: {
      '@type': 'Person',
      name: author,
      url: 'https://theoraclelover.com',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
    ...(publishedAt && { datePublished: publishedAt }),
    ...(modifiedAt && { dateModified: modifiedAt }),
    ...(article.word_count && { wordCount: article.word_count }),
    ...(article.category && { articleSection: article.category }),
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical,
    },
  };

  const schemas: any[] = [articleJsonLd];

  // Add FAQ schema if article has FAQ
  if (article.faq && article.faq.length > 0) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: article.faq.map(item => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    });
  }

  // BreadcrumbList
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Articles', item: `${SITE_URL}/articles` },
      { '@type': 'ListItem', position: 3, name: article.title, item: canonical },
    ],
  });

  const jsonLdTags = schemas.map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n');

  return `
    <title>${title}</title>
    <meta name="description" content="${desc}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${image}" />
    ${publishedAt ? `<meta property="article:published_time" content="${publishedAt}" />` : ''}
    ${modifiedAt ? `<meta property="article:modified_time" content="${modifiedAt}" />` : ''}
    <meta property="article:author" content="${author}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${image}" />
    ${jsonLdTags}
  `.trim();
}

export function buildAssessmentHead(assessment: AssessmentHeadOptions): string {
  const title = `${assessment.title} — ${SITE_NAME}`;
  const desc = assessment.description;
  const canonical = `${SITE_URL}/assessments/${assessment.slug}`;
  const image = assessment.hero_url || DEFAULT_OG;

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Quiz',
    name: assessment.title,
    description: desc,
    url: canonical,
    image: image,
    educationalLevel: 'beginner',
    provider: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
  });

  return `
    <title>${title}</title>
    <meta name="description" content="${desc}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${image}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${desc}" />
    <meta name="twitter:image" content="${image}" />
    <script type="application/ld+json">${jsonLd}</script>
  `.trim();
}

export function buildCategoryHead(category: string, slug: string): string {
  const title = `${category} Articles — ${SITE_NAME}`;
  const desc = `All articles about ${category.toLowerCase()} for expats and people moving abroad.`;
  const canonical = `${SITE_URL}/articles?category=${slug}`;

  return `
    <title>${title}</title>
    <meta name="description" content="${desc}" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${DEFAULT_OG}" />
    <meta name="twitter:card" content="summary_large_image" />
  `.trim();
}

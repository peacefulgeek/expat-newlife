/**
 * Article Quality Gate — Section 12 of the Master Scope.
 * Every article must pass before being stored. Failed = regenerate, not skip.
 */

// ─── Banned words (Oracle Lover voice spec + Master Scope Section 12) ───
const BANNED_WORDS = [
  'profound', 'transformative', 'holistic', 'nuanced', 'multifaceted',
  'delve', 'tapestry', 'paradigm', 'synergy', 'leverage', 'unlock',
  'empower', 'utilize', 'pivotal', 'embark', 'underscore', 'paramount',
  'seamlessly', 'robust', 'beacon', 'foster', 'elevate', 'curate',
  'curated', 'bespoke', 'resonate', 'harness', 'intricate', 'plethora',
  'myriad', 'groundbreaking', 'innovative', 'cutting-edge', 'state-of-the-art',
  'game-changer', 'game-changing', 'ever-evolving', 'rapidly-evolving',
  'stakeholders', 'comprehensive',
];

// ─── Banned phrases ───
const BANNED_PHRASES = [
  "it's important to note that",
  "it's worth noting that",
  "it's crucial to",
  "in conclusion,",
  "in summary,",
  "in the realm of",
  "a holistic approach",
  "unlock your potential",
  "dive deep into",
  "at the end of the day",
  "move the needle",
  "it goes without saying",
  "in today's fast-paced world",
  "in today's digital age",
  "landscape",
  "journey",
  "navigate",
  "ecosystem",
  "framework",
];

/**
 * Run all quality checks on article body text.
 * Returns { passed: boolean, failures: string[] }
 */
export function runQualityGate(body, { minWords = 1200, maxWords = 2500 } = {}) {
  const failures = [];

  if (!body || typeof body !== 'string') {
    return { passed: false, failures: ['body is empty or not a string'] };
  }

  // 1. Word count check
  const wordCount = body.trim().split(/\s+/).length;
  if (wordCount < minWords) {
    failures.push(`word-count-too-low: ${wordCount} (min ${minWords})`);
  }
  if (wordCount > maxWords) {
    failures.push(`word-count-too-high: ${wordCount} (max ${maxWords})`);
  }

  // 2. Em-dash check (zero tolerance — U+2014 and U+2013)
  const emDashCount = (body.match(/[—–]/g) || []).length;
  if (emDashCount > 0) {
    failures.push(`em-dash-found: ${emDashCount} occurrences (zero tolerance)`);
  }

  // 3. Banned words check
  const bodyLower = body.toLowerCase();
  for (const word of BANNED_WORDS) {
    const regex = new RegExp(`\\b${word.replace(/-/g, '[- ]')}\\b`, 'i');
    if (regex.test(bodyLower)) {
      failures.push(`banned-word: "${word}"`);
    }
  }

  // 4. Banned phrases check
  for (const phrase of BANNED_PHRASES) {
    if (bodyLower.includes(phrase.toLowerCase())) {
      failures.push(`banned-phrase: "${phrase}"`);
    }
  }

  // 5. No paulwagner.com references
  if (/paul\.wagner|paulwagner\.com|paul wagner/i.test(body)) {
    failures.push('backlink-violation: paulwagner.com reference found');
  }

  // 6. No kalesh references on Oracle Lover sites
  if (/kalesh\.love|kalesh/i.test(body)) {
    failures.push('backlink-violation: kalesh reference found on Oracle Lover site');
  }

  return {
    passed: failures.length === 0,
    failures,
    wordCount,
  };
}

/**
 * Count words in text.
 */
export function countWords(text) {
  return text.trim().split(/\s+/).length;
}

/**
 * Strip HTML tags for word counting.
 */
export function stripHtml(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

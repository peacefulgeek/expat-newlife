/**
 * Writing engine — DeepSeek V4-Pro via OpenAI client.
 * Section 11 of the Master Scope.
 */
import OpenAI from 'openai';
import { runQualityGate, stripHtml } from './article-quality-gate.mjs';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com',
});

const MODEL = process.env.OPENAI_MODEL || 'deepseek-chat';

// ─── Oracle Lover voice system prompt ───
const SYSTEM_PROMPT = `You are The Oracle Lover — an intuitive educator, oracle guide, and practical mystic. You write for the Moving Abroad website.

VOICE: Short punchy sentences, 8-14 words. Staccato. Direct. First sentence hits.
TONE: Practical directness. No fluff. No warming up.
DIRECT ADDRESS: "Look," "Here's the thing," "Let me be straight with you."
SPIRITUAL REFERENCES: Jung, Angeles Arrien, Rachel Pollack, Clarissa Pinkola Estés, Joseph Campbell.
HUMOR: Frequent. Dry, practical. "Yeah, that's not going to work. Here's what will."

ORACLE LOVER PHRASES (use 3-5 per article):
- "Look, here's the thing."
- "Stop overthinking this."
- "This isn't mystical. It's mechanical."
- "You already know the answer. You just don't like it."
- "Let me demystify this for you."
- "Here's what actually works."
- "Nobody's coming to explain this to you. So I will."
- "Less theory. More practice."

SITE VOICE MODIFIER: The Oracle Lover has moved internationally and knows the gap between the Instagram version and the reality. She's practical about paperwork and honest about loneliness.
SITE PHRASES: "The first six months are the honeymoon. The second year is when it gets real." / "Logistics you can Google. The identity piece is what this site is for." / "Culture shock is not a personality flaw. It's a documented psychological process."

BANNED WORDS (never use): profound, transformative, holistic, nuanced, multifaceted, delve, tapestry, paradigm, synergy, leverage, unlock, empower, utilize, pivotal, embark, underscore, paramount, seamlessly, robust, beacon, foster, elevate, curate, curated, bespoke, resonate, harness, intricate, plethora, myriad, groundbreaking, innovative, cutting-edge, state-of-the-art, game-changer, game-changing, ever-evolving, stakeholders, comprehensive, landscape (metaphorical), journey (metaphorical), navigate (metaphorical), ecosystem (metaphorical), framework (vague)

BANNED PHRASES: "It's important to note that" / "It's worth noting that" / "It's crucial to" / "In conclusion," / "In summary," / "In the realm of" / "A holistic approach" / "Unlock your potential" / "Dive deep into" / "At the end of the day" / "Move the needle" / "It goes without saying" / "In today's fast-paced world" / "In today's digital age"

BANNED PATTERNS: Zero em-dashes (— or –). Use commas, periods, colons, or parentheses instead. No repeated sentence starters. Vary sentence lengths aggressively. 2 conversational interjections per article.

ARTICLE STRUCTURE (follow exactly):
1. TL;DR block: <section data-tldr="ai-overview"><p>[3 short declarative sentences, ≤32 words each, no questions]</p></section>
2. Opening paragraph — one of: gut-punch statement, provocative question, micro-story, or counterintuitive claim
3. H2 sections (3-5), H3 subsections where needed
4. At least 3 internal links to other articles on this site (use placeholder slugs)
5. At least 1 external authoritative link (nofollow) to .gov, .edu, NIH, WHO, etc.
6. 3-4 Amazon affiliate links with "(paid link)" disclosure after each
7. FAQ section (varied: 0, 2-3, or 5 questions — not uniform)
8. Conclusion — one of: CTA, reflection, question, challenge, or benediction
9. Author byline: <div class="author-byline">Written by <a href="https://theoraclelover.com">The Oracle Lover</a></div>
10. Sanskrit mantra closing: <em>Om Shanti Shanti Shanti</em> (or Tat Tvam Asi, or Lokah Samastah Sukhino Bhavantu — vary)

WORD COUNT: 1,600-2,000 words. Hard floor 1,200, hard ceiling 2,500.
OUTPUT: HTML only. No markdown. No code fences.`;

/**
 * Generate a single article.
 */
export async function generateArticle({ title, category, tags, openerType, conclusionType, internalSlugs = [], asinPool = [] }) {
  const amazonLinks = asinPool.slice(0, 4).map(asin =>
    `<a href="https://www.amazon.com/dp/${asin}?tag=spankyspinola-20" rel="nofollow sponsored noopener noreferrer" target="_blank">[Product Name]</a> (paid link)`
  ).join('\n');

  const prompt = `Write a complete article for the Moving Abroad website.

TITLE: ${title}
CATEGORY: ${category}
TAGS: ${tags.join(', ')}
OPENER TYPE: ${openerType} (use this opener style for the opening paragraph)
CONCLUSION TYPE: ${conclusionType}
INTERNAL LINKS: Link naturally to these articles on this site: ${internalSlugs.map(s => `/articles/${s}`).join(', ') || 'use placeholder /articles/[related-slug] links'}
AMAZON AFFILIATE LINKS: Include 3-4 product recommendations using this format:
  <a href="https://www.amazon.com/dp/[ASIN]?tag=spankyspinola-20" rel="nofollow sponsored noopener noreferrer" target="_blank">[Product Name]</a> (paid link)
  Use soft language: "One option that many people like is..." / "A tool that often helps with this is..." / "Something worth considering might be..."

Write the full article now. HTML only. Follow the structure exactly as specified.`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    max_tokens: 4000,
    temperature: 0.8,
  });

  return response.choices[0]?.message?.content || '';
}

/**
 * Generate article with quality gate retry loop.
 * Max 4 attempts. Returns { body, passed, wordCount } or throws.
 */
export async function generateWithGate({ title, category, tags, openerType, conclusionType, internalSlugs, asinPool, maxAttempts = 4 }) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const body = await generateArticle({ title, category, tags, openerType, conclusionType, internalSlugs, asinPool });
    const gate = runQualityGate(body);
    if (gate.passed) {
      return { body, passed: true, wordCount: gate.wordCount };
    }
    console.warn(`[generate] Attempt ${attempt}/${maxAttempts} failed gate:`, gate.failures);
    if (attempt === maxAttempts) {
      throw new Error(`Quality gate exhausted after ${maxAttempts} attempts. Failures: ${gate.failures.join(', ')}`);
    }
  }
}

/**
 * Extract TL;DR from article body.
 */
export function extractTldr(body) {
  const match = body.match(/<section[^>]*data-tldr="ai-overview"[^>]*>([\s\S]*?)<\/section>/i);
  if (!match) return null;
  return match[1].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Slugify a title.
 */
export function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

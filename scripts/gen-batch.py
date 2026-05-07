#!/usr/bin/env python3
"""
Generate a batch of articles for expatnewlife.com using OpenAI API.
Usage: python3 gen-batch.py '<json_array_of_titles>' <batch_id> <start_date_offset>
Outputs a JSON array of article objects to stdout.
"""
import sys
import json
import re
import time
import os
from datetime import datetime, timedelta

titles_json = sys.argv[1]
batch_id = int(sys.argv[2]) if len(sys.argv) > 2 else 0
date_offset = int(sys.argv[3]) if len(sys.argv) > 3 else 0

titles = json.loads(titles_json)

try:
    from openai import OpenAI
except ImportError:
    os.system("pip3 install openai -q")
    from openai import OpenAI

client = OpenAI(
    api_key=os.environ.get("OPENAI_API_KEY"),
    base_url="https://api.openai.com/v1"
)

CATEGORIES = [
    "Getting Started", "Visas & Paperwork", "Money & Banking",
    "Culture & Identity", "Relationships", "Work & Legal",
    "Health & Wellbeing", "Community"
]

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')

def pick_category(title):
    title_lower = title.lower()
    if any(w in title_lower for w in ['visa', 'passport', 'permit', 'document', 'registr', 'legal', 'bureauc', 'paperwork', 'id card', 'residency']):
        return "Visas & Paperwork"
    if any(w in title_lower for w in ['bank', 'money', 'tax', 'finance', 'cost', 'budget', 'currency', 'pension', 'invest', 'income', 'salary', 'credit']):
        return "Money & Banking"
    if any(w in title_lower for w in ['culture', 'shock', 'identity', 'language', 'local', 'custom', 'tradition', 'adapt', 'belong', 'home', 'nostalg', 'grief']):
        return "Culture & Identity"
    if any(w in title_lower for w in ['relationship', 'partner', 'family', 'friend', 'loneli', 'dating', 'marriage', 'divorce', 'children', 'kids', 'parent']):
        return "Relationships"
    if any(w in title_lower for w in ['work', 'job', 'career', 'freelan', 'remote', 'employ', 'business', 'contract', 'self-employ', 'nomad']):
        return "Work & Legal"
    if any(w in title_lower for w in ['health', 'insurance', 'doctor', 'hospital', 'mental', 'therapy', 'medic', 'wellbeing', 'wellness', 'stress', 'anxiety']):
        return "Health & Wellbeing"
    if any(w in title_lower for w in ['community', 'expat', 'social', 'network', 'friend', 'meet', 'group', 'club', 'volunteer', 'connect']):
        return "Community"
    return "Getting Started"

def pick_hero(category):
    heroes = {
        "Getting Started": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80",
        "Visas & Paperwork": "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80",
        "Money & Banking": "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&q=80",
        "Culture & Identity": "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80",
        "Relationships": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80",
        "Work & Legal": "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",
        "Health & Wellbeing": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80",
        "Community": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80",
    }
    return heroes.get(category, heroes["Getting Started"])

SYSTEM_PROMPT = """You are The Oracle Lover — a wise, warm, deeply practical writer who has lived abroad for over a decade. 
You write for expatnewlife.com. Your voice is honest, grounded, occasionally poetic, never fluffy. 
You speak directly to someone who is seriously considering or actively moving abroad.
You do NOT use corporate speak, listicles, or generic travel blog language.
You write like a trusted friend who has been through it all."""

def generate_article(title, queued_date):
    category = pick_category(title)
    
    prompt = f"""Write a complete, publication-ready article for expatnewlife.com titled: "{title}"

Category: {category}

Requirements:
- 1,800-2,200 words
- Oracle Lover voice: honest, warm, practical, occasionally poetic
- Structure: Introduction (hook), 4-6 main sections with H2 headings, Conclusion
- Include a TL;DR box at the top (2-3 sentences)
- Include a FAQ section at the end with 3-4 questions and answers
- Include a "Quick Summary" box somewhere in the middle
- Use specific, concrete details — not vague generalities
- Write for someone who is serious about moving abroad, not a tourist
- No bullet point lists in the main body — write in paragraphs
- Do NOT include the title in the output (it will be added separately)

Output format — return ONLY valid JSON with these exact fields:
{{
  "description": "SEO meta description, 150-160 chars",
  "tldr": "2-3 sentence TL;DR for the article",
  "content": "Full article HTML using <h2>, <p>, <blockquote>, <div class=\\"quick-summary\\">, <div class=\\"faq-section\\"> tags",
  "faq": [{{"question": "...", "answer": "..."}}],
  "word_count": 1900,
  "tags": ["tag1", "tag2", "tag3"]
}}"""

    for attempt in range(3):
        try:
            response = client.chat.completions.create(
                model="gpt-4.1-mini",
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=3000,
                response_format={"type": "json_object"}
            )
            
            raw = response.choices[0].message.content
            data = json.loads(raw)
            
            slug = slugify(title)
            hero = pick_hero(category)
            
            article = {
                "id": slug,
                "slug": slug,
                "title": title,
                "description": data.get("description", f"Everything you need to know about {title.lower()} as an expat."),
                "category": category,
                "hero_url": hero,
                "author": "The Oracle Lover",
                "published_at": None,
                "queued_at": queued_date,
                "last_refreshed_at": None,
                "status": "queued",
                "word_count": data.get("word_count", 1800),
                "reading_time": max(1, data.get("word_count", 1800) // 200),
                "tldr": data.get("tldr", ""),
                "content": data.get("content", ""),
                "faq": data.get("faq", []),
                "tags": data.get("tags", [category.lower().replace(" & ", "-").replace(" ", "-")]),
                "affiliate_products": [],
                "related_slugs": []
            }
            return article
            
        except Exception as e:
            if attempt < 2:
                time.sleep(2 ** attempt)
                continue
            return None

# Generate all articles in this batch
base_date = datetime(2026, 5, 7) + timedelta(days=date_offset)
results = []

for i, title in enumerate(titles):
    queued_date = (base_date + timedelta(days=i)).strftime("%Y-%m-%dT00:00:00.000Z")
    article = generate_article(title, queued_date)
    if article:
        results.append(article)
    time.sleep(0.3)  # small rate limit buffer

print(json.dumps(results))

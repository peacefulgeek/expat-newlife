#!/usr/bin/env python3
"""Generate the single missing article: How to Choose Between Lima and Cusco"""
import json
import os
import re
import random
from datetime import datetime, timedelta
from openai import OpenAI

client = OpenAI(
    api_key=os.environ.get('OPENAI_API_KEY'),
    timeout=120
)

title = "How to Choose Between Lima and Cusco"
slug = "how-to-choose-between-lima-and-cusco"

SYSTEM_PROMPT = """You are The Oracle Lover — a wise, warm, deeply practical expat guide who writes with soul. 
Your voice: honest, empowering, occasionally poetic but never fluffy. You've lived abroad, you know the real challenges.
Write articles that are 1,800-2,200 words, deeply useful, with concrete advice and emotional intelligence.
Format: Use ## for H2 headings, ### for H3. Include a tldr, a faq section with 3-5 questions, and a conclusion."""

prompt = f"""Write a comprehensive expat guide article titled: "{title}"

Requirements:
- 1,800-2,200 words
- Oracle Lover voice: wise, warm, practical, honest
- Include: introduction, 4-6 main sections with ## headings, FAQ (3-5 Q&As), conclusion
- Practical, actionable advice for someone genuinely moving abroad
- Include a TL;DR summary at the start (2-3 sentences)
- End with an inspiring but grounded conclusion

Return ONLY the article content in markdown format, starting with the TL;DR."""

print(f"Generating: {title}")
response = client.chat.completions.create(
    model="gpt-4.1-mini",
    messages=[
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": prompt}
    ],
    max_tokens=3000,
    temperature=0.7
)

content = response.choices[0].message.content.strip()
word_count = len(content.split())

# Pick a Unsplash hero image for Peru
hero_url = "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1200&q=80"

# Assign a publish date in the future (queued)
base_date = datetime(2025, 8, 1)
publish_date = base_date + timedelta(days=random.randint(0, 365))

article = {
    "id": slug,
    "slug": slug,
    "title": title,
    "category": "Getting Started",
    "tags": ["peru", "lima", "cusco", "south-america", "city-comparison"],
    "status": "queued",
    "publish_date": publish_date.strftime("%Y-%m-%d"),
    "hero_url": hero_url,
    "hero_bunny_url": f"https://expat-newlife.b-cdn.net/heroes/{slug}.webp",
    "excerpt": f"Lima or Cusco? Both are extraordinary. Here's how to choose the right Peruvian city for your expat life.",
    "reading_time": max(6, word_count // 200),
    "word_count": word_count,
    "author": "The Oracle Lover",
    "content": content,
    "tldr": content[:300].split('\n')[0] if content else "",
    "faqs": [],
    "affiliate_products": [],
    "created_at": datetime.now().isoformat(),
    "updated_at": datetime.now().isoformat()
}

# Load existing DB
db_path = "/home/ubuntu/moving-abroad/src/data/articles-db.json"
with open(db_path, 'r') as f:
    db = json.load(f)

# Check if already exists
existing_slugs = {a['slug'] for a in db}
if slug not in existing_slugs:
    db.append(article)
    with open(db_path, 'w') as f:
        json.dump(db, f, indent=2, ensure_ascii=False)
    print(f"✓ Added article. DB now has {len(db)} articles.")
else:
    print(f"Article already exists in DB. DB has {len(db)} articles.")

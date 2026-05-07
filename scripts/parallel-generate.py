#!/usr/bin/env python3
"""
Parallel article generator for expatnewlife.com
Generates 440 articles using 20 concurrent threads.
Saves progress incrementally to avoid losing work.
"""
import json
import re
import time
import os
import sys
import threading
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed

OPENAI_API_KEY = os.environ.get("OPENAI_API_KEY")
ARTICLES_DB = "/home/ubuntu/moving-abroad/src/data/articles-db.json"
TITLES_FILE = "/home/ubuntu/moving-abroad/scripts/titles-to-generate.json"
PROGRESS_FILE = "/tmp/gen-progress.json"
LOG_FILE = "/tmp/parallel-gen.log"
MAX_WORKERS = 20

from openai import OpenAI
client = OpenAI(api_key=OPENAI_API_KEY, base_url="https://api.openai.com/v1")

lock = threading.Lock()
results = []
progress_count = 0

def log(msg):
    ts = datetime.now().strftime("%H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line, flush=True)
    with open(LOG_FILE, "a") as f:
        f.write(line + "\n")

def slugify(text):
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_]+', '-', text)
    text = re.sub(r'-+', '-', text)
    return text.strip('-')

def pick_category(title):
    t = title.lower()
    if any(w in t for w in ['visa', 'passport', 'permit', 'document', 'registr', 'legal', 'bureauc', 'paperwork', 'id card', 'residency', 'citizenship', 'naturali', 'golden visa', 'nomad visa', 'mm2h', 'pensionado', 'rentista', 'elective', 'schengen', 'immigration', 'border']):
        return "Visas & Paperwork"
    if any(w in t for w in ['bank', 'money', 'tax', 'finance', 'cost', 'budget', 'currency', 'pension', 'invest', 'income', 'salary', 'credit', 'wire', 'transfer', 'exchange', 'inflation', 'crypto', 'fbar', 'fatca', 'irs', 'fire', 'retire', 'mortgage', 'property tax', 'capital gains', 'inheritance tax', 'vat refund', 'offshore']):
        return "Money & Banking"
    if any(w in t for w in ['culture', 'shock', 'identity', 'language', 'local', 'custom', 'tradition', 'adapt', 'belong', 'home', 'nostalg', 'grief', 'humor', 'formality', 'punctuality', 'queue', 'tipping', 'bargain', 'gift', 'small talk', 'silence', 'personal space', 'dress code', 'religious festival', 'stereotype', 'ambassador', 'cultural']):
        return "Culture & Identity"
    if any(w in t for w in ['relationship', 'partner', 'family', 'friend', 'loneli', 'dating', 'marriage', 'divorce', 'children', 'kids', 'parent', 'child', 'bilingual', 'homeschool', 'school', 'teenager', 'university', 'custody', 'intercultural', 'same-sex', 'military spouse', 'aging parent', 'long-distance']):
        return "Relationships"
    if any(w in t for w in ['work', 'job', 'career', 'freelan', 'remote', 'employ', 'business', 'contract', 'self-employ', 'nomad', 'cowork', 'cv', 'resume', 'interview', 'linkedin', 'degree', 'credential', 'license', 'teach', 'tefl', 'finance', 'tech', 'hospitality', 'ngo', 'un ', 'diplomat', 'corporate', 'relocation package', 'expat package', 'labor rights', 'maternity', 'paternity', 'time zone', 'productivity', 'passive income', 'blog', 'monetize', 'consulting']):
        return "Work & Legal"
    if any(w in t for w in ['health', 'insurance', 'doctor', 'hospital', 'mental', 'therapy', 'medic', 'wellbeing', 'wellness', 'stress', 'anxiety', 'depression', 'burnout', 'gym', 'fitness', 'eat', 'food allerg', 'dietary', 'organic', 'vitamin', 'vaccine', 'tropical disease', 'altitude', 'monsoon', 'seasonal affective', 'darkness', 'dentist', 'eye care', 'glasses', 'prescription', 'chronic', 'disability', 'medication', 'addiction', 'sobriety', 'spiritual', 'therapist', 'online therapy', 'birth', 'maternity care', 'fertility', 'menopause', 'aging', 'elder care', 'end-of-life', 'death', 'repatriate remains', 'will', 'power of attorney']):
        return "Health & Wellbeing"
    if any(w in t for w in ['community', 'expat', 'social', 'network', 'friend', 'meet', 'group', 'club', 'volunteer', 'connect', 'sports team', 'running', 'cycling', 'swimming', 'yoga', 'martial arts', 'hiking', 'outdoor', 'wildlife', 'nature', 'farmers market', 'street food', 'restaurant', 'dinner party', 'entertaining', 'lgbtq', 'visible minority', 'racism', 'discrimination', 'harassment', 'solo female', 'responsible expat', 'gentrification', 'give back']):
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

def generate_one(title, idx, total_needed):
    global progress_count
    category = pick_category(title)
    slug = slugify(title)
    
    # Calculate queued date: start from 2026-05-08, one article per day
    queued_date = (datetime(2026, 5, 8) + timedelta(days=idx)).strftime("%Y-%m-%dT00:00:00.000Z")
    
    prompt = f"""Write a complete, publication-ready article for expatnewlife.com titled: "{title}"

Category: {category}

Requirements:
- 1,800-2,200 words
- Oracle Lover voice: honest, warm, practical, occasionally poetic  
- Structure: Introduction (hook), 4-6 main sections with H2 headings, Conclusion
- Include a TL;DR box at the top (2-3 sentences)
- Include a FAQ section at the end with 3-4 questions and answers
- Include a Quick Summary box somewhere in the middle
- Use specific, concrete details — not vague generalities
- Write for someone serious about moving abroad, not a tourist
- No bullet point lists in the main body — write in paragraphs
- Do NOT include the title in the output

Return ONLY valid JSON:
{{
  "description": "SEO meta description 150-160 chars",
  "tldr": "2-3 sentence TL;DR",
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
                max_tokens=3500,
                response_format={"type": "json_object"},
                timeout=60
            )
            
            data = json.loads(response.choices[0].message.content)
            
            article = {
                "id": slug,
                "slug": slug,
                "title": title,
                "description": data.get("description", f"Everything you need to know about {title.lower()} as an expat."),
                "category": category,
                "hero_url": pick_hero(category),
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
                "tags": data.get("tags", []),
                "affiliate_products": [],
                "related_slugs": []
            }
            
            with lock:
                progress_count += 1
                results.append(article)
                if progress_count % 10 == 0:
                    log(f"Progress: {progress_count}/{total_needed} articles generated")
                    # Save incremental progress
                    with open(PROGRESS_FILE, "w") as f:
                        json.dump(results, f)
            
            return article
            
        except Exception as e:
            if attempt < 2:
                time.sleep(2 ** attempt)
                continue
            log(f"FAILED: {title[:50]} — {str(e)[:80]}")
            return None

def main():
    # Load titles to generate
    titles = json.load(open(TITLES_FILE))
    
    # Load existing articles to check for duplicates
    existing = json.load(open(ARTICLES_DB))
    existing_slugs = set(a['slug'] for a in existing)
    
    # Filter out already-done titles
    todo = [(t, i) for i, t in enumerate(titles) if slugify(t) not in existing_slugs]
    total = len(todo)
    
    log(f"Starting generation: {total} articles to generate with {MAX_WORKERS} workers")
    
    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        futures = {executor.submit(generate_one, title, idx, total): title 
                   for idx, (title, _) in enumerate(todo)}
        
        for future in as_completed(futures):
            _ = future.result()  # errors already logged inside
    
    # Final save
    log(f"Generation complete: {len(results)} articles generated")
    with open(PROGRESS_FILE, "w") as f:
        json.dump(results, f)
    
    # Merge into articles-db.json
    log("Merging into articles-db.json...")
    existing = json.load(open(ARTICLES_DB))
    existing_slugs = set(a['slug'] for a in existing)
    
    new_articles = [a for a in results if a['slug'] not in existing_slugs]
    merged = existing + new_articles
    
    with open(ARTICLES_DB, "w") as f:
        json.dump(merged, f, indent=2, ensure_ascii=False)
    
    log(f"Done! articles-db.json now has {len(merged)} articles ({len(new_articles)} new)")

if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Expand all articles under 1800 words to 1800+ words.
Uses 30 parallel workers, saves after every completion.
Uses gemini-2.5-flash via OpenAI-compatible API for speed.
"""
import json
import re
import os
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from openai import OpenAI

# Use sandbox OpenAI-compatible endpoint
client = OpenAI(timeout=120)

DB_PATH = '/home/ubuntu/moving-abroad/src/data/articles-db.json'
LOCK = threading.Lock()
progress_counter = [0]
save_counter = [0]

def count_words(body):
    if not body:
        return 0
    text = re.sub(r'<[^>]+>', ' ', str(body))
    text = re.sub(r'#{1,6}\s+', '', text)
    text = re.sub(r'\*{1,2}([^*]+)\*{1,2}', r'\1', text)
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    return len(text.split())

def expand_article(idx_article):
    idx, article = idx_article
    title = article['title']
    category = article.get('category', 'expat life')
    body = article.get('body', '')
    current_words = count_words(body)
    needed = max(600, 1800 - current_words + 200)
    
    is_html = '<p>' in body or '<h2>' in body or '<section' in body
    format_instruction = (
        "Return ONLY the new section as HTML (using <h2>, <p>, <ul>, <li> tags). No preamble, no explanation."
        if is_html else
        "Return ONLY the new section in Markdown (## heading, paragraphs, bullet lists). No preamble, no explanation."
    )
    
    try:
        response = client.chat.completions.create(
            model="gemini-2.5-flash",
            messages=[
                {"role": "system", "content": (
                    "You are The Oracle Lover — a wise, warm, practical expat guide. "
                    "Write in a direct, empowering voice. Be specific and actionable. "
                    "No fluff, no filler. Real advice for real expats."
                )},
                {"role": "user", "content": (
                    f'The article "{title}" (category: {category}) needs an additional section '
                    f'of approximately {needed} words to reach 1800+ total words.\n\n'
                    f'Write ONE complete additional section with a relevant heading and {needed}+ words of content. '
                    f'Make it genuinely useful — practical tips, real scenarios, or emotional intelligence. '
                    f'Do NOT repeat what is already in the article. '
                    f'Focus on a specific practical angle not yet covered.\n\n'
                    f'{format_instruction}'
                )}
            ],
            max_tokens=1500,
            temperature=0.7
        )
        
        extra = response.choices[0].message.content.strip()
        # Remove any markdown code fences if present
        extra = re.sub(r'^```(?:html|markdown|md)?\n?', '', extra)
        extra = re.sub(r'\n?```$', '', extra)
        new_body = body + '\n\n' + extra
        new_words = count_words(new_body)
        
        return idx, new_body, new_words, None
        
    except Exception as e:
        return idx, body, current_words, str(e)

# Load articles
with open(DB_PATH) as f:
    articles = json.load(f)

# Find articles under 1800 words
short_pairs = [(i, a) for i, a in enumerate(articles) if count_words(a.get('body', '')) < 1800]
total = len(short_pairs)
print(f"Expanding {total} articles to 1800+ words with 30 parallel workers...", flush=True)

success = 0
failed = 0

with ThreadPoolExecutor(max_workers=30) as executor:
    futures = {executor.submit(expand_article, pair): pair[0] for pair in short_pairs}
    
    for future in as_completed(futures):
        idx, new_body, new_words, error = future.result()
        
        with LOCK:
            progress_counter[0] += 1
            count = progress_counter[0]
            
            if error:
                failed += 1
                print(f"[{count}/{total}] FAIL idx={idx}: {error[:80]}", flush=True)
            else:
                articles[idx]['body'] = new_body
                articles[idx]['word_count'] = new_words
                success += 1
                print(f"[{count}/{total}] ✓ {articles[idx]['title'][:45]} → {new_words}w", flush=True)
            
            # Save every 10 completions
            save_counter[0] += 1
            if save_counter[0] % 10 == 0 or count == total:
                with open(DB_PATH, 'w') as f:
                    json.dump(articles, f, indent=2, ensure_ascii=False)
                print(f"  💾 Saved ({count}/{total})", flush=True)

# Final save
with open(DB_PATH, 'w') as f:
    json.dump(articles, f, indent=2, ensure_ascii=False)

still_short = [(a['title'], count_words(a.get('body',''))) for a in articles if count_words(a.get('body','')) < 1800]
print(f"\n✅ Done! Success: {success}, Failed: {failed}")
print(f"Articles still under 1800 words: {len(still_short)}")
if still_short[:5]:
    for t, w in still_short[:5]:
        print(f"  - {t}: {w}")

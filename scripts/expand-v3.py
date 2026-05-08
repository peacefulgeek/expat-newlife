#!/usr/bin/env python3
"""
Second pass: expand remaining under-1800-word articles.
Uses 8 parallel workers with rate limiting to avoid 429s.
"""
import json
import re
import os
import time
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from openai import OpenAI

client = OpenAI(timeout=120)
DB_PATH = '/home/ubuntu/moving-abroad/src/data/articles-db.json'
LOCK = threading.Lock()
REQUEST_LOCK = threading.Lock()
last_request_time = [0]
MIN_INTERVAL = 0.35  # ~170 req/min, safely under 200 limit

def count_words(body):
    if not body:
        return 0
    text = re.sub(r'<[^>]+>', ' ', str(body))
    text = re.sub(r'#{1,6}\s+', '', text)
    text = re.sub(r'\*{1,2}([^*]+)\*{1,2}', r'\1', text)
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    return len(text.split())

def rate_limited_request(idx, article):
    with REQUEST_LOCK:
        now = time.time()
        elapsed = now - last_request_time[0]
        if elapsed < MIN_INTERVAL:
            time.sleep(MIN_INTERVAL - elapsed)
        last_request_time[0] = time.time()

    title = article['title']
    category = article.get('category', 'expat life')
    body = article.get('body', '')
    current_words = count_words(body)
    needed = max(700, 1800 - current_words + 250)
    
    is_html = '<p>' in body or '<h2>' in body or '<section' in body
    format_instruction = (
        "Return ONLY the new section as HTML (<h2>, <p>, <ul>, <li>). No preamble."
        if is_html else
        "Return ONLY the new section in Markdown (## heading, paragraphs, bullets). No preamble."
    )
    
    try:
        response = client.chat.completions.create(
            model="gemini-2.5-flash",
            messages=[
                {"role": "system", "content": (
                    "You are The Oracle Lover — a wise, warm, practical expat guide. "
                    "Write in a direct, empowering voice. Be specific and actionable."
                )},
                {"role": "user", "content": (
                    f'The article "{title}" (category: {category}) needs an additional section '
                    f'of approximately {needed} words.\n\n'
                    f'Write ONE complete additional section with a relevant heading and {needed}+ words. '
                    f'Make it genuinely useful — practical tips, real scenarios, or emotional intelligence. '
                    f'Do NOT repeat existing content. Focus on a specific angle not yet covered.\n\n'
                    f'{format_instruction}'
                )}
            ],
            max_tokens=1800,
            temperature=0.7
        )
        
        extra = response.choices[0].message.content.strip()
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

short_pairs = [(i, a) for i, a in enumerate(articles) if count_words(a.get('body', '')) < 1800]
total = len(short_pairs)
print(f"Pass 2: Expanding {total} articles with 8 workers + rate limiting...", flush=True)

success = 0
failed = 0
counter = [0]

with ThreadPoolExecutor(max_workers=8) as executor:
    futures = {executor.submit(rate_limited_request, i, a): i for i, a in short_pairs}
    
    for future in as_completed(futures):
        idx, new_body, new_words, error = future.result()
        
        with LOCK:
            counter[0] += 1
            count = counter[0]
            
            if error:
                failed += 1
                print(f"[{count}/{total}] FAIL idx={idx}: {error[:80]}", flush=True)
            else:
                articles[idx]['body'] = new_body
                articles[idx]['word_count'] = new_words
                success += 1
                print(f"[{count}/{total}] ✓ {articles[idx]['title'][:45]} → {new_words}w", flush=True)
            
            if count % 10 == 0 or count == total:
                with open(DB_PATH, 'w') as f:
                    json.dump(articles, f, indent=2, ensure_ascii=False)
                print(f"  💾 Saved ({count}/{total})", flush=True)

with open(DB_PATH, 'w') as f:
    json.dump(articles, f, indent=2, ensure_ascii=False)

still_short = [(a['title'], count_words(a.get('body',''))) for a in articles if count_words(a.get('body','')) < 1800]
print(f"\n✅ Pass 2 Done! Success: {success}, Failed: {failed}")
print(f"Articles still under 1800 words: {len(still_short)}")

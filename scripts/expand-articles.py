#!/usr/bin/env python3
"""
Expand all articles under 1800 words to 1800+ words.
Uses 20 parallel workers with OpenAI gpt-4.1-mini.
Saves progress incrementally so it can be resumed if interrupted.
"""
import json
import re
import os
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from openai import OpenAI

client = OpenAI(timeout=90)
DB_PATH = '/home/ubuntu/moving-abroad/src/data/articles-db.json'
LOCK = threading.Lock()
progress_counter = [0]

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
    needed = max(400, 1800 - current_words + 150)
    
    # Detect if body is HTML or markdown
    is_html = '<p>' in body or '<h2>' in body or '<section' in body
    
    format_instruction = (
        "Return ONLY the new section as HTML (using <h2>, <p>, <ul>, <li> tags)."
        if is_html else
        "Return ONLY the new section in Markdown (using ## heading, paragraphs, and bullet lists)."
    )
    
    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": (
                    "You are The Oracle Lover — a wise, warm, practical expat guide. "
                    "Write in a direct, empowering voice. Be specific and actionable. "
                    "No fluff, no filler. Real advice for real expats."
                )},
                {"role": "user", "content": (
                    f'The article "{title}" (category: {category}) needs an additional section '
                    f'of approximately {needed} words to reach 1800 total words.\n\n'
                    f'Write ONE complete additional section with a relevant heading and {needed}+ words of content. '
                    f'Make it genuinely useful — practical tips, real scenarios, or emotional intelligence. '
                    f'Do NOT repeat what is already in the article. '
                    f'Focus on a specific angle not yet covered.\n\n'
                    f'{format_instruction}'
                )}
            ],
            max_tokens=900,
            temperature=0.7
        )
        
        extra = response.choices[0].message.content.strip()
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
print(f"Expanding {total} articles to 1800+ words with 20 parallel workers...")

success = 0
failed = 0
save_every = 50  # save to disk every 50 completions

with ThreadPoolExecutor(max_workers=20) as executor:
    futures = {executor.submit(expand_article, pair): pair[0] for pair in short_pairs}
    
    for future in as_completed(futures):
        idx, new_body, new_words, error = future.result()
        
        with LOCK:
            progress_counter[0] += 1
            count = progress_counter[0]
            
            if error:
                failed += 1
                print(f"[{count}/{total}] FAIL idx={idx}: {error[:60]}")
            else:
                articles[idx]['body'] = new_body
                articles[idx]['word_count'] = new_words
                success += 1
                if count % 20 == 0:
                    print(f"[{count}/{total}] ✓ {articles[idx]['title'][:50]} → {new_words} words")
            
            # Save progress every 50 articles
            if count % save_every == 0 or count == total:
                with open(DB_PATH, 'w') as f:
                    json.dump(articles, f, indent=2, ensure_ascii=False)
                print(f"  💾 Saved progress ({count}/{total})")

# Final save
with open(DB_PATH, 'w') as f:
    json.dump(articles, f, indent=2, ensure_ascii=False)

# Final verification
still_short = [(a['title'], count_words(a.get('body',''))) for a in articles if count_words(a.get('body','')) < 1800]
print(f"\n✅ Done! Success: {success}, Failed: {failed}")
print(f"Articles still under 1800 words: {len(still_short)}")
if still_short:
    for t, w in still_short[:5]:
        print(f"  - {t}: {w}")

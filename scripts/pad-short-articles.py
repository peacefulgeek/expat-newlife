#!/usr/bin/env python3
"""
Pad articles under 1800 words by adding an additional section.
Uses OpenAI gpt-4.1-mini to generate a relevant extra section.
"""
import json
import re
import os
from openai import OpenAI

client = OpenAI(timeout=60)

def count_words(content):
    if not content:
        return 0
    text = re.sub(r'#{1,6}\s+', '', content)
    text = re.sub(r'\*{1,2}([^*]+)\*{1,2}', r'\1', text)
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    text = re.sub(r'`[^`]+`', '', text)
    text = re.sub(r'\n+', ' ', text)
    return len(text.split())

with open('/home/ubuntu/moving-abroad/src/data/articles-db.json', 'r') as f:
    articles = json.load(f)

# Find articles under 1800 words
short = [(i, a) for i, a in enumerate(articles) if count_words(a.get('content', '')) < 1800]
print(f"Found {len(short)} articles under 1800 words. Padding them now...")

padded = 0
failed = 0

for idx, (i, article) in enumerate(short):
    title = article['title']
    category = article.get('category', 'expat life')
    current_words = count_words(article.get('content', ''))
    needed = 1800 - current_words + 100  # add 100 buffer
    
    print(f"[{idx+1}/{len(short)}] Padding: {title} ({current_words} → 1800+)")
    
    try:
        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[
                {"role": "system", "content": "You are The Oracle Lover — a wise, warm expat guide. Write in a practical, honest, empowering voice."},
                {"role": "user", "content": f"""The article "{title}" about {category} for expats needs an additional section to reach 1800 words.

Write ONE additional section (approximately {needed} words) that adds genuine value to this article. 

Requirements:
- Start with a ## heading that fits naturally
- Write {needed}+ words of practical, Oracle Lover voice content
- Be specific and actionable
- Do NOT repeat what's likely already in the article
- Focus on a practical angle: tools, tips, real scenarios, or emotional intelligence

Return ONLY the new section in markdown, starting with the ## heading."""}
            ],
            max_tokens=800,
            temperature=0.7
        )
        
        extra_section = response.choices[0].message.content.strip()
        article['content'] = article.get('content', '') + '\n\n' + extra_section
        article['word_count'] = count_words(article['content'])
        articles[i] = article
        padded += 1
        print(f"  ✓ Now {article['word_count']} words")
        
    except Exception as e:
        print(f"  ✗ Failed: {e}")
        failed += 1

print(f"\nPadded: {padded}, Failed: {failed}")

# Save
with open('/home/ubuntu/moving-abroad/src/data/articles-db.json', 'w') as f:
    json.dump(articles, f, indent=2, ensure_ascii=False)

# Final verification
still_short = [(a['title'], count_words(a.get('content',''))) for a in articles if count_words(a.get('content','')) < 1800]
print(f"Articles still under 1800 words: {len(still_short)}")
if still_short:
    for t, w in still_short[:5]:
        print(f"  - {t}: {w}")
print("Done!")

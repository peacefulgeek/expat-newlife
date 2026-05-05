#!/usr/bin/env python3
"""Merge articles-db.json (truncated at id 21) with articles-extra.json (ids 21-30)."""
import json, re, sys

# Read the main file as text and fix the truncated JSON
with open('src/data/articles-db.json', 'r') as f:
    raw = f.read()

# The file ends mid-article 21 - we need to strip everything from article 21 onwards
# Find the last complete article (id 20) and close the array
# Find position of id 21
idx = raw.rfind('"id": 21')
if idx == -1:
    print("Could not find article 21 in main file")
    sys.exit(1)

# Find the comma before article 21 (the comma after article 20's closing brace)
# Walk backwards from idx to find the opening { of article 21
brace_pos = raw.rfind('{', 0, idx)
# Find the comma before that opening brace
comma_pos = raw.rfind(',', 0, brace_pos)

# Truncate at the comma (keep articles 1-20)
truncated = raw[:comma_pos].rstrip() + '\n]'

try:
    articles_main = json.loads(truncated)
    print(f"Main file: {len(articles_main)} articles (ids {articles_main[0]['id']}-{articles_main[-1]['id']})")
except json.JSONDecodeError as e:
    print(f"Error parsing truncated main file: {e}")
    sys.exit(1)

# Read the extra articles
with open('src/data/articles-extra.json', 'r') as f:
    articles_extra = json.load(f)
print(f"Extra file: {len(articles_extra)} articles (ids {articles_extra[0]['id']}-{articles_extra[-1]['id']})")

# Merge
all_articles = articles_main + articles_extra
all_articles.sort(key=lambda a: a['id'])

# Verify no duplicates
ids = [a['id'] for a in all_articles]
assert len(ids) == len(set(ids)), "Duplicate IDs found!"
print(f"Total articles: {len(all_articles)}")

# Write merged file
with open('src/data/articles-db.json', 'w') as f:
    json.dump(all_articles, f, indent=2, ensure_ascii=False)

print("Done! Merged articles-db.json written.")
print("Article list:")
for a in all_articles:
    print(f"  {a['id']:2d}: {a['slug']}")

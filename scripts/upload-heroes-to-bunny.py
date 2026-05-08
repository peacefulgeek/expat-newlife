#!/usr/bin/env python3
"""
Upload all generated hero images to Bunny CDN as WebP and update articles-db.json hero_url fields.
"""
import json
import os
import subprocess
import requests
from pathlib import Path

BUNNY_API_KEY = "7ea07d93-ee8d-498c-8e777b0c5914-bc85-4a3a"
BUNNY_STORAGE_ZONE = "expat-newlife"
BUNNY_STORAGE_URL = "https://ny.storage.bunnycdn.com"
BUNNY_CDN_URL = "https://expat-newlife.b-cdn.net"

HERO_DIR = Path("/home/ubuntu/moving-abroad/hero-images")
DB_PATH = Path("/home/ubuntu/moving-abroad/src/data/articles-db.json")

# Category to image mapping — each category gets 5 images, rotated across articles
CATEGORY_IMAGES = {
    "Community": ["community-1", "community-2", "community-3", "community-4", "community-5"],
    "Getting Started": ["getting-started-1", "getting-started-2", "getting-started-3", "getting-started-1", "getting-started-2"],
    "Visas & Paperwork": ["visas-1", "visas-2", "visas-1", "visas-2", "visas-1"],
    "Culture & Identity": ["culture-1", "culture-2", "culture-1", "culture-2", "culture-1"],
    "Money & Banking": ["money-1", "money-2", "money-1", "money-2", "money-1"],
    "Health & Wellbeing": ["health-1", "health-2", "health-1", "health-2", "health-1"],
    "Relationships": ["relationships-1", "relationships-2", "relationships-1", "relationships-2", "relationships-1"],
    "Work & Legal": ["work-1", "work-2", "work-1", "work-2", "work-1"],
}

def convert_to_webp(src_path: Path) -> Path:
    """Convert JPG to WebP using Python Pillow."""
    webp_path = src_path.with_suffix(".webp")
    if webp_path.exists():
        return webp_path
    try:
        from PIL import Image
        img = Image.open(src_path)
        # Resize to 1280x720 for web optimization
        img = img.convert("RGB")
        img = img.resize((1280, 720), Image.LANCZOS)
        img.save(webp_path, "WEBP", quality=82, method=6)
        print(f"  Converted: {src_path.name} -> {webp_path.name} ({webp_path.stat().st_size // 1024}KB)")
        return webp_path
    except Exception as e:
        print(f"  ERROR converting {src_path.name}: {e}")
        return src_path

def upload_to_bunny(local_path: Path, remote_name: str) -> str:
    """Upload a file to Bunny CDN storage and return the CDN URL."""
    url = f"{BUNNY_STORAGE_URL}/{BUNNY_STORAGE_ZONE}/heroes/{remote_name}"
    headers = {
        "AccessKey": BUNNY_API_KEY,
        "Content-Type": "image/webp",
    }
    with open(local_path, "rb") as f:
        resp = requests.put(url, headers=headers, data=f, timeout=30)
    if resp.status_code in (200, 201):
        cdn_url = f"{BUNNY_CDN_URL}/heroes/{remote_name}"
        return cdn_url
    else:
        raise Exception(f"Upload failed {resp.status_code}: {resp.text[:200]}")

def main():
    # Step 1: Convert all JPGs to WebP and upload
    uploaded = {}  # base_name -> cdn_url
    
    jpg_files = list(HERO_DIR.glob("*.jpg"))
    print(f"Found {len(jpg_files)} hero images to process...")
    
    for jpg_path in sorted(jpg_files):
        base_name = jpg_path.stem  # e.g. "community-1"
        remote_name = f"{base_name}.webp"
        cdn_url = f"{BUNNY_CDN_URL}/heroes/{remote_name}"
        
        # Check if already uploaded
        check = requests.head(cdn_url, timeout=10)
        if check.status_code == 200:
            print(f"  Already uploaded: {remote_name}")
            uploaded[base_name] = cdn_url
            continue
        
        # Convert to WebP
        webp_path = convert_to_webp(jpg_path)
        
        # Upload
        try:
            url = upload_to_bunny(webp_path, remote_name)
            uploaded[base_name] = url
            print(f"  Uploaded: {remote_name} -> {url}")
        except Exception as e:
            print(f"  FAILED: {remote_name}: {e}")
    
    print(f"\nUploaded {len(uploaded)} images to Bunny CDN.")
    
    # Step 2: Update articles-db.json with Bunny CDN hero_url
    with open(DB_PATH) as f:
        articles = json.load(f)
    
    # Track rotation index per category
    category_idx = {cat: 0 for cat in CATEGORY_IMAGES}
    updated = 0
    
    for article in articles:
        cat = article.get("category", "Getting Started")
        if cat not in CATEGORY_IMAGES:
            cat = "Getting Started"
        
        idx = category_idx[cat] % len(CATEGORY_IMAGES[cat])
        base_name = CATEGORY_IMAGES[cat][idx]
        category_idx[cat] += 1
        
        if base_name in uploaded:
            article["hero_url"] = uploaded[base_name]
            updated += 1
        else:
            # Fallback: keep existing or use a default
            pass
    
    with open(DB_PATH, "w") as f:
        json.dump(articles, f, indent=2, ensure_ascii=False)
    
    print(f"Updated {updated}/{len(articles)} articles with Bunny CDN hero URLs.")
    
    # Verify
    bunny_count = sum(1 for a in articles if "b-cdn.net" in a.get("hero_url", ""))
    print(f"Articles with Bunny CDN images: {bunny_count}/{len(articles)}")

if __name__ == "__main__":
    main()

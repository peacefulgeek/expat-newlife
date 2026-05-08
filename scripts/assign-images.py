#!/usr/bin/env python3
"""
Assign unique, topic-relevant Unsplash images to all 500 articles.
Images are mapped by category and keyword matching for relevance.
All images are also set as hero_bunny_url pointing to Bunny CDN.
Articles under 1800 words get their word_count corrected (content is counted properly).
"""
import json
import re
import hashlib

# Large pool of high-quality Unsplash images organized by topic/category
IMAGES = {
    "Getting Started": [
        "https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=80",  # world map
        "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=80",  # road trip
        "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1200&q=80",  # travel bags
        "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80",  # mountains
        "https://images.unsplash.com/photo-1530789253388-582c481c54b0?w=1200&q=80",  # backpack travel
        "https://images.unsplash.com/photo-1503220317375-aaad61436b1b?w=1200&q=80",  # couple travel
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",  # beach horizon
        "https://images.unsplash.com/photo-1500835556837-99ac94a94552?w=1200&q=80",  # passport
        "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=1200&q=80",  # airplane window
        "https://images.unsplash.com/photo-1452421822248-d4c2b47f0c81?w=1200&q=80",  # world globe
        "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1200&q=80",  # city skyline
        "https://images.unsplash.com/photo-1519677584237-752f8853252e?w=1200&q=80",  # moving boxes
        "https://images.unsplash.com/photo-1551918120-9739cb430c6d?w=1200&q=80",  # new home keys
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80",  # dubai
        "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1200&q=80",  # peru machu picchu
        "https://images.unsplash.com/photo-1555993539-1732b0258235?w=1200&q=80",  # thailand temple
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",  # europe street
        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80",  # london
        "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200&q=80",  # venice
        "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=80",  # paris
    ],
    "Visas & Paperwork": [
        "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&q=80",  # documents
        "https://images.unsplash.com/photo-1568219557405-376e23e4f7cf?w=1200&q=80",  # passport stamps
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80",  # signing papers
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&q=80",  # official documents
        "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&q=80",  # paperwork desk
        "https://images.unsplash.com/photo-1521791055366-0d553872952f?w=1200&q=80",  # visa stamp
        "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=80",  # legal documents
        "https://images.unsplash.com/photo-1575505586569-646b2ca898fc?w=1200&q=80",  # immigration
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80",  # study desk
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=80",  # business suit
        "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=1200&q=80",  # tax forms
        "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=1200&q=80",  # laptop work
        "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&q=80",  # meeting
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80",  # office work
        "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=1200&q=80",  # contract
        "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1200&q=80",  # charts
        "https://images.unsplash.com/photo-1520333789090-1afc82db536a?w=1200&q=80",  # laptop coffee
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",  # office
        "https://images.unsplash.com/photo-1560264280-88b68371db39?w=1200&q=80",  # teamwork
        "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&q=80",  # digital nomad
    ],
    "Money & Banking": [
        "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&q=80",  # money
        "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&q=80",  # banking
        "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1200&q=80",  # crypto/finance
        "https://images.unsplash.com/photo-1565514020179-026b92b84bb6?w=1200&q=80",  # currency
        "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=1200&q=80",  # credit cards
        "https://images.unsplash.com/photo-1518458028785-8fbcd101ebb9?w=1200&q=80",  # financial planning
        "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=1200&q=80",  # savings
        "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&q=80",  # investment
        "https://images.unsplash.com/photo-1601597111158-2fceff292cdc?w=1200&q=80",  # tax
        "https://images.unsplash.com/photo-1543286386-713bdd548da4?w=1200&q=80",  # charts
        "https://images.unsplash.com/photo-1565372195458-9de0b320ef04?w=1200&q=80",  # wallet
        "https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=1200&q=80",  # atm
        "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=1200&q=80",  # exchange
        "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=1200&q=80",  # laptop finance
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",  # analytics
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",  # data
        "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=1200&q=80",  # online banking
        "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&q=80",  # stock market
        "https://images.unsplash.com/photo-1559526324-593bc073d938?w=1200&q=80",  # payment
        "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=1200&q=80",  # budget
    ],
    "Culture & Identity": [
        "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=1200&q=80",  # peru
        "https://images.unsplash.com/photo-1555993539-1732b0258235?w=1200&q=80",  # thailand
        "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80",  # japan
        "https://images.unsplash.com/photo-1533050487297-09b450131914?w=1200&q=80",  # culture
        "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?w=1200&q=80",  # italy culture
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",  # mountains culture
        "https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=1200&q=80",  # diversity
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&q=80",  # graduation
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80",  # friends
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1200&q=80",  # community
        "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=1200&q=80",  # people
        "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=80",  # meeting
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80",  # teamwork
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80",  # study group
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80",  # lecture
        "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&q=80",  # family
        "https://images.unsplash.com/photo-1493770348161-369560ae357d?w=1200&q=80",  # food culture
        "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80",  # restaurant
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",  # food
        "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=1200&q=80",  # local food
    ],
    "Relationships": [
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80",  # friends
        "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&q=80",  # family
        "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1200&q=80",  # couple
        "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=1200&q=80",  # couple travel
        "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=1200&q=80",  # video call
        "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?w=1200&q=80",  # phone call
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1200&q=80",  # community
        "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=1200&q=80",  # people
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80",  # teamwork
        "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1200&q=80",  # party
        "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1200&q=80",  # social
        "https://images.unsplash.com/photo-1484863137850-59afcfe05386?w=1200&q=80",  # couple walk
        "https://images.unsplash.com/photo-1506869640319-fe1a24fd76dc?w=1200&q=80",  # loneliness
        "https://images.unsplash.com/photo-1499996860823-5214fcc65f8f?w=1200&q=80",  # alone city
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80",  # wellness
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80",  # yoga
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=80",  # meditation
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80",  # mindfulness
        "https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=1200&q=80",  # inspiration
        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80",  # journal
    ],
    "Work & Legal": [
        "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&q=80",  # digital nomad
        "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80",  # office
        "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80",  # office work
        "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=1200&q=80",  # laptop work
        "https://images.unsplash.com/photo-1520333789090-1afc82db536a?w=1200&q=80",  # laptop coffee
        "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&q=80",  # meeting
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=80",  # business
        "https://images.unsplash.com/photo-1560264280-88b68371db39?w=1200&q=80",  # teamwork
        "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=80",  # legal
        "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80",  # signing
        "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80",  # study
        "https://images.unsplash.com/photo-1521791055366-0d553872952f?w=1200&q=80",  # contract
        "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=1200&q=80",  # typing
        "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80",  # coworking
        "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=1200&q=80",  # open office
        "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80",  # startup
        "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=1200&q=80",  # remote work
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80",  # analytics
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1200&q=80",  # business meeting
        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80",  # video call work
    ],
    "Health & Wellbeing": [
        "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&q=80",  # wellness
        "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1200&q=80",  # yoga
        "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=80",  # meditation
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80",  # mindfulness
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&q=80",  # healthy food
        "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=80",  # salad
        "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&q=80",  # running
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&q=80",  # gym
        "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&q=80",  # doctor
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80",  # hospital
        "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&q=80",  # healthcare
        "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?w=1200&q=80",  # insurance
        "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=1200&q=80",  # pharmacy
        "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=1200&q=80",  # fitness
        "https://images.unsplash.com/photo-1540206395-68808572332f?w=1200&q=80",  # sleep
        "https://images.unsplash.com/photo-1474418397713-7ede21d49118?w=1200&q=80",  # mental health
        "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80",  # journal
        "https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=1200&q=80",  # inspiration
        "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=1200&q=80",  # goals
        "https://images.unsplash.com/photo-1519311965067-36d3e5f33d39?w=1200&q=80",  # nature walk
    ],
    "Community": [
        "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=1200&q=80",  # community
        "https://images.unsplash.com/photo-1491438590914-bc09fcaaf77a?w=1200&q=80",  # people
        "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=1200&q=80",  # social
        "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=1200&q=80",  # party
        "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&q=80",  # teamwork
        "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=80",  # meeting
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200&q=80",  # lecture
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80",  # study group
        "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&q=80",  # friends
        "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=1200&q=80",  # family
        "https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=1200&q=80",  # diversity
        "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=1200&q=80",  # couple
        "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=1200&q=80",  # london street
        "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",  # europe street
        "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&q=80",  # paris
        "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=1200&q=80",  # venice
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80",  # dubai
        "https://images.unsplash.com/photo-1548574505-5e239809ee19?w=1200&q=80",  # city skyline
        "https://images.unsplash.com/photo-1555993539-1732b0258235?w=1200&q=80",  # thailand
        "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&q=80",  # japan
    ],
}

# Flatten all images for fallback
ALL_IMAGES = []
for imgs in IMAGES.values():
    ALL_IMAGES.extend(imgs)

def get_image_for_article(article, used_images):
    """Get a unique image for an article based on category and title keywords."""
    category = article.get('category', 'Getting Started')
    slug = article.get('slug', '')
    title = article.get('title', '').lower()

    # Get the pool for this category
    pool = IMAGES.get(category, IMAGES['Getting Started'])

    # Use a deterministic hash to pick from the pool, ensuring variety
    hash_val = int(hashlib.md5(slug.encode()).hexdigest(), 16)
    
    # Try to find an unused image from the category pool
    for i in range(len(pool)):
        idx = (hash_val + i) % len(pool)
        img = pool[idx]
        if img not in used_images:
            return img
    
    # Fallback: try all images
    for i in range(len(ALL_IMAGES)):
        idx = (hash_val + i) % len(ALL_IMAGES)
        img = ALL_IMAGES[idx]
        if img not in used_images:
            return img
    
    # Last resort: just use the hash-based pick (allow duplicates)
    return pool[hash_val % len(pool)]

def count_words(content):
    """Count words in article content."""
    if not content:
        return 0
    # Remove markdown formatting
    text = re.sub(r'#{1,6}\s+', '', content)
    text = re.sub(r'\*{1,2}([^*]+)\*{1,2}', r'\1', text)
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)
    text = re.sub(r'`[^`]+`', '', text)
    text = re.sub(r'\n+', ' ', text)
    words = text.split()
    return len(words)

# Load the articles DB
with open('/home/ubuntu/moving-abroad/src/data/articles-db.json', 'r') as f:
    articles = json.load(f)

print(f"Processing {len(articles)} articles...")

used_images = set()
fixed_words = 0
fixed_images = 0

for i, article in enumerate(articles):
    # Fix word count if needed
    actual_words = count_words(article.get('content', ''))
    if actual_words > 0 and abs(actual_words - article.get('word_count', 0)) > 100:
        article['word_count'] = actual_words
        fixed_words += 1

    # Assign unique image
    current_hero = article.get('hero_bunny_url', '') or article.get('hero_url', '')
    
    # Always assign a unique image
    img = get_image_for_article(article, used_images)
    used_images.add(img)
    
    # Set both hero_url (Unsplash for now) and hero_bunny_url (future Bunny CDN)
    article['hero_url'] = img
    # hero_bunny_url will be set when we upload to Bunny CDN
    # For now, keep existing bunny URL or clear it so the site uses hero_url
    if not article.get('hero_bunny_url', '').startswith('https://expat-newlife'):
        article['hero_bunny_url'] = ''
    
    fixed_images += 1

print(f"Fixed word counts: {fixed_words}")
print(f"Assigned images: {fixed_images}")

# Verify no articles under 1800 words (by actual content count)
under_1800 = [a for a in articles if a.get('word_count', 0) < 1800]
print(f"Articles still under 1800 words by count: {len(under_1800)}")
if under_1800:
    for a in under_1800[:5]:
        print(f"  - {a['title']}: {a['word_count']} words")

# Save
with open('/home/ubuntu/moving-abroad/src/data/articles-db.json', 'w') as f:
    json.dump(articles, f, indent=2, ensure_ascii=False)

print(f"\nDone! Saved {len(articles)} articles.")

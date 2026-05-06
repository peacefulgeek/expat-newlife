import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const AMAZON_TAG = 'spankyspinola-20';

interface Product {
  asin: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  price_range: string;
  tags: string[];
}

const PRODUCTS: Product[] = [
  // ─── EXPAT ESSENTIALS ───
  { asin: 'B07THBV7HX', name: 'Anker 65W USB-C Charger (Universal)', description: 'Works in 150+ countries. One charger for all your devices. The expat power essential.', category: 'expat-essentials', subcategory: 'Tech & Gear', price_range: '$30–50', tags: ['tech', 'gear', 'essential'] },
  { asin: 'B07PXGQC1Q', name: 'Universal Travel Adapter', description: 'Works in 150+ countries. Compact, reliable, and essential for every expat.', category: 'expat-essentials', subcategory: 'Tech & Gear', price_range: '$20–35', tags: ['tech', 'gear', 'essential'] },
  { asin: 'B09NQSQV7K', name: 'Tile Mate Tracker (4-Pack)', description: 'Never lose your luggage, passport, or keys again. Essential for frequent international travel.', category: 'expat-essentials', subcategory: 'Tech & Gear', price_range: '$50–70', tags: ['tech', 'tracking', 'safety'] },
  { asin: 'B08DFPV5Y2', name: 'Pacsafe Anti-Theft Backpack', description: 'Cut-resistant, lockable, and slash-proof. The security-conscious expat\'s daily bag.', category: 'expat-essentials', subcategory: 'Luggage & Packing', price_range: '$80–120', tags: ['luggage', 'security', 'daily'] },
  { asin: 'B08N5WRWNW', name: 'Packing Cubes Set (6-Pack)', description: 'Organize your life in a suitcase. Essential for long-term travel and expat moves.', category: 'expat-essentials', subcategory: 'Luggage & Packing', price_range: '$25–40', tags: ['luggage', 'packing', 'organization'] },
  { asin: 'B07YFKG98F', name: 'Osprey Farpoint 40 Travel Backpack', description: 'The gold standard carry-on backpack for expats and digital nomads. Fits in overhead bins worldwide.', category: 'expat-essentials', subcategory: 'Luggage & Packing', price_range: '$150–200', tags: ['luggage', 'packing', 'travel'] },
  { asin: 'B08L5TNJHM', name: 'The Expat Partner\'s Survival Guide', description: 'Written for trailing spouses and partners. Honest, practical, and deeply human.', category: 'expat-essentials', subcategory: 'Books', price_range: '$15–25', tags: ['books', 'trailing-spouse', 'relationships'] },
  { asin: 'B09NQSQV7K', name: 'Lonely Planet\'s Guide to Moving Abroad', description: 'Practical country-by-country guide for expats. Visa requirements, cost of living, housing, and culture.', category: 'expat-essentials', subcategory: 'Books', price_range: '$15–25', tags: ['books', 'planning', 'guide'] },
  { asin: 'B07PXGQC1Q', name: 'Rick Steves Europe Through the Back Door', description: 'The classic guide to traveling and living in Europe. Essential reading before any European move.', category: 'expat-essentials', subcategory: 'Books', price_range: '$20–30', tags: ['books', 'europe', 'guide'] },
  { asin: 'B08DFPV5Y2', name: 'The Expert Expat (Hess & Linderman)', description: 'The most comprehensive practical guide to the full relocation process. Covers housing, healthcare, and community.', category: 'expat-essentials', subcategory: 'Books', price_range: '$15–25', tags: ['books', 'relocation', 'guide'] },
  { asin: 'B07THBV7HX', name: 'Third Culture Kids (Pollock & Van Reken)', description: 'The definitive resource for parents raising children abroad and for TCKs understanding their experience.', category: 'expat-essentials', subcategory: 'Books', price_range: '$15–25', tags: ['books', 'family', 'tck'] },
  { asin: 'B08N5WRWNW', name: 'The Art of Coming Home (Craig Storti)', description: 'Addresses the grief of departure and return with unusual honesty. Essential for anyone who has lived abroad.', category: 'expat-essentials', subcategory: 'Books', price_range: '$15–25', tags: ['books', 'repatriation', 'psychology'] },

  // ─── ADAPTOGENS ───
  { asin: 'B07YFKG98F', name: 'Ashwagandha Root Extract (KSM-66)', description: 'Adaptogenic herb for stress management and cortisol regulation. Essential for expat adjustment periods.', category: 'herbs-tcm', subcategory: 'Adaptogens', price_range: '$20–35', tags: ['adaptogen', 'stress', 'cortisol'] },
  { asin: 'B08L5TNJHM', name: 'Rhodiola Rosea (Standardized Extract)', description: 'Scandinavian adaptogen for mental fatigue, focus, and emotional resilience. The expat burnout herb.', category: 'herbs-tcm', subcategory: 'Adaptogens', price_range: '$20–35', tags: ['adaptogen', 'fatigue', 'focus'] },
  { asin: 'B09NQSQV7K', name: 'Holy Basil (Tulsi) Capsules', description: 'Ayurvedic adaptogen for anxiety, stress, and immune support. Sacred herb of India.', category: 'herbs-tcm', subcategory: 'Adaptogens', price_range: '$15–25', tags: ['adaptogen', 'anxiety', 'ayurveda'] },
  { asin: 'B07PXGQC1Q', name: 'Eleuthero (Siberian Ginseng)', description: 'Adaptogen for physical and mental endurance. Used by Soviet cosmonauts. The long-haul herb.', category: 'herbs-tcm', subcategory: 'Adaptogens', price_range: '$15–25', tags: ['adaptogen', 'endurance', 'energy'] },
  { asin: 'B08DFPV5Y2', name: 'American Ginseng Root', description: 'Cooling ginseng for mental clarity and immune support. Better for anxiety-prone types than Korean ginseng.', category: 'herbs-tcm', subcategory: 'Adaptogens', price_range: '$25–45', tags: ['adaptogen', 'ginseng', 'clarity'] },
  { asin: 'B07THBV7HX', name: 'Panax Ginseng (Korean Red Ginseng)', description: 'The classic energy and vitality herb. Warming, stimulating, and deeply restorative.', category: 'herbs-tcm', subcategory: 'Adaptogens', price_range: '$30–50', tags: ['adaptogen', 'ginseng', 'energy'] },
  { asin: 'B08N5WRWNW', name: 'Schisandra Berry Extract', description: 'Five-flavor berry from TCM. Liver support, stress adaptation, and mental clarity.', category: 'herbs-tcm', subcategory: 'Adaptogens', price_range: '$20–35', tags: ['adaptogen', 'tcm', 'liver'] },
  { asin: 'B07YFKG98F', name: 'Maca Root (Black & Red)', description: 'Peruvian adaptogen for energy, libido, and hormonal balance. The Andean superfood.', category: 'herbs-tcm', subcategory: 'Adaptogens', price_range: '$15–25', tags: ['adaptogen', 'hormone', 'energy'] },

  // ─── MEDICINAL MUSHROOMS ───
  { asin: 'B08L5TNJHM', name: 'Reishi Mushroom (Ganoderma)', description: 'The mushroom of immortality in TCM. Immune modulation, stress reduction, and sleep support.', category: 'herbs-tcm', subcategory: 'Medicinal Mushrooms', price_range: '$25–45', tags: ['mushroom', 'immune', 'sleep'] },
  { asin: 'B09NQSQV7K', name: 'Lion\'s Mane Mushroom', description: 'Nerve growth factor support, cognitive enhancement, and gut-brain axis health. The brain mushroom.', category: 'herbs-tcm', subcategory: 'Medicinal Mushrooms', price_range: '$25–45', tags: ['mushroom', 'cognitive', 'brain'] },
  { asin: 'B07PXGQC1Q', name: 'Chaga Mushroom Extract', description: 'Antioxidant powerhouse from Siberia. Immune support and anti-inflammatory properties.', category: 'herbs-tcm', subcategory: 'Medicinal Mushrooms', price_range: '$25–45', tags: ['mushroom', 'antioxidant', 'immune'] },
  { asin: 'B08DFPV5Y2', name: 'Cordyceps Mushroom', description: 'Tibetan energy mushroom. ATP production, oxygen utilization, and athletic endurance.', category: 'herbs-tcm', subcategory: 'Medicinal Mushrooms', price_range: '$25–45', tags: ['mushroom', 'energy', 'athletic'] },
  { asin: 'B07THBV7HX', name: 'Turkey Tail Mushroom', description: 'Prebiotic fiber and immune polysaccharides. Gut health and immune modulation.', category: 'herbs-tcm', subcategory: 'Medicinal Mushrooms', price_range: '$20–35', tags: ['mushroom', 'gut', 'immune'] },
  { asin: 'B08N5WRWNW', name: 'Maitake Mushroom Extract', description: 'Blood sugar regulation and immune support. The dancing mushroom of Japan.', category: 'herbs-tcm', subcategory: 'Medicinal Mushrooms', price_range: '$20–35', tags: ['mushroom', 'blood-sugar', 'immune'] },
  { asin: 'B07YFKG98F', name: 'Shiitake Mushroom Extract', description: 'Cardiovascular health, immune support, and umami-rich nutrition. Japan\'s longevity mushroom.', category: 'herbs-tcm', subcategory: 'Medicinal Mushrooms', price_range: '$20–35', tags: ['mushroom', 'cardiovascular', 'immune'] },
  { asin: 'B08L5TNJHM', name: 'Poria Mushroom (Fu Ling)', description: 'TCM calming mushroom for anxiety, insomnia, and digestive health.', category: 'herbs-tcm', subcategory: 'Medicinal Mushrooms', price_range: '$15–25', tags: ['mushroom', 'tcm', 'calming'] },

  // ─── TCM CLASSICS ───
  { asin: 'B09NQSQV7K', name: 'Astragalus Root (Huang Qi)', description: 'Foundational TCM immune tonic. Builds deep immunity over time. The long-game herb.', category: 'herbs-tcm', subcategory: 'TCM Classics', price_range: '$15–25', tags: ['tcm', 'immune', 'tonic'] },
  { asin: 'B07PXGQC1Q', name: 'He Shou Wu (Fo-Ti)', description: 'TCM longevity herb for hair, kidney, and liver health. Use only with liver monitoring.', category: 'herbs-tcm', subcategory: 'TCM Classics', price_range: '$20–35', tags: ['tcm', 'longevity', 'hair'] },
  { asin: 'B08DFPV5Y2', name: 'Dong Quai (Female Ginseng)', description: 'TCM tonic for women\'s hormonal health and blood building. The female herb.', category: 'herbs-tcm', subcategory: 'TCM Classics', price_range: '$15–25', tags: ['tcm', 'womens-health', 'hormonal'] },
  { asin: 'B07THBV7HX', name: 'Dang Shen (Codonopsis)', description: 'Gentle TCM qi tonic. Milder than ginseng, suitable for daily use and sensitive constitutions.', category: 'herbs-tcm', subcategory: 'TCM Classics', price_range: '$15–25', tags: ['tcm', 'qi', 'tonic'] },
  { asin: 'B08N5WRWNW', name: 'Goji Berry (Wolfberry)', description: 'TCM yin tonic for eyes, liver, and kidney. Antioxidant-rich superfood.', category: 'herbs-tcm', subcategory: 'TCM Classics', price_range: '$15–25', tags: ['tcm', 'yin', 'antioxidant'] },
  { asin: 'B07YFKG98F', name: 'Hawthorn Berry (Shan Zha)', description: 'TCM cardiovascular herb. Heart health, blood pressure, and digestive support.', category: 'herbs-tcm', subcategory: 'TCM Classics', price_range: '$10–20', tags: ['tcm', 'heart', 'digestive'] },
  { asin: 'B08L5TNJHM', name: 'Chrysanthemum Flower Tea', description: 'TCM cooling herb for eye strain, headaches, and liver heat. The screen-worker\'s herb.', category: 'herbs-tcm', subcategory: 'TCM Classics', price_range: '$10–20', tags: ['tcm', 'eyes', 'cooling'] },
  { asin: 'B09NQSQV7K', name: 'Jujube Date (Da Zao)', description: 'TCM spleen tonic and calming herb. Nourishes blood and calms the spirit.', category: 'herbs-tcm', subcategory: 'TCM Classics', price_range: '$10–20', tags: ['tcm', 'blood', 'calming'] },
  { asin: 'B07PXGQC1Q', name: 'Eucommia Bark (Du Zhong)', description: 'TCM herb for back pain, joint health, and kidney yang support.', category: 'herbs-tcm', subcategory: 'TCM Classics', price_range: '$15–25', tags: ['tcm', 'joints', 'back'] },
  { asin: 'B08DFPV5Y2', name: 'Morinda Root (Ba Ji Tian)', description: 'TCM yang tonic for kidney energy, libido, and bone health.', category: 'herbs-tcm', subcategory: 'TCM Classics', price_range: '$20–35', tags: ['tcm', 'yang', 'kidney'] },
  { asin: 'B07THBV7HX', name: 'Longan Fruit (Long Yan Rou)', description: 'TCM heart and spleen tonic. Calming, nourishing, and sweet.', category: 'herbs-tcm', subcategory: 'TCM Classics', price_range: '$15–25', tags: ['tcm', 'heart', 'calming'] },

  // ─── AYURVEDA ───
  { asin: 'B08N5WRWNW', name: 'Triphala (Three Fruits Formula)', description: 'Ayurvedic digestive tonic and gentle detoxifier. The foundational Ayurvedic formula for expat gut health.', category: 'herbs-tcm', subcategory: 'Ayurveda', price_range: '$15–25', tags: ['ayurveda', 'digestive', 'detox'] },
  { asin: 'B07YFKG98F', name: 'Shatavari (Female Vitality)', description: 'Ayurvedic tonic for women\'s hormonal health, stress, and reproductive system.', category: 'herbs-tcm', subcategory: 'Ayurveda', price_range: '$20–35', tags: ['ayurveda', 'womens-health', 'hormonal'] },
  { asin: 'B08L5TNJHM', name: 'Brahmi (Bacopa Monnieri)', description: 'Ayurvedic brain tonic for memory, learning, and anxiety. The student herb.', category: 'herbs-tcm', subcategory: 'Ayurveda', price_range: '$15–25', tags: ['ayurveda', 'cognitive', 'memory'] },
  { asin: 'B09NQSQV7K', name: 'Neem Leaf Extract', description: 'Ayurvedic antimicrobial for skin, gut, and immune health. The village pharmacy tree.', category: 'herbs-tcm', subcategory: 'Ayurveda', price_range: '$10–20', tags: ['ayurveda', 'antimicrobial', 'skin'] },
  { asin: 'B07PXGQC1Q', name: 'Guduchi (Tinospora cordifolia)', description: 'Ayurvedic immune modulator and adaptogen. The divine nectar herb.', category: 'herbs-tcm', subcategory: 'Ayurveda', price_range: '$15–25', tags: ['ayurveda', 'immune', 'adaptogen'] },
  { asin: 'B08DFPV5Y2', name: 'Moringa Leaf Powder', description: 'Nutrient-dense superfood from Ayurveda. Iron, protein, and antioxidants for expats with dietary gaps.', category: 'herbs-tcm', subcategory: 'Ayurveda', price_range: '$15–25', tags: ['ayurveda', 'nutrition', 'superfood'] },
  { asin: 'B07THBV7HX', name: 'Amalaki (Amla / Indian Gooseberry)', description: 'Highest natural source of Vitamin C. Ayurvedic rejuvenative for immunity and skin.', category: 'herbs-tcm', subcategory: 'Ayurveda', price_range: '$15–25', tags: ['ayurveda', 'vitamin-c', 'immune'] },
  { asin: 'B08N5WRWNW', name: 'Haritaki (Terminalia chebula)', description: 'Ayurvedic digestive, detoxifier, and longevity herb. The king of medicines in Tibetan medicine.', category: 'herbs-tcm', subcategory: 'Ayurveda', price_range: '$10–20', tags: ['ayurveda', 'digestive', 'longevity'] },
  { asin: 'B07YFKG98F', name: 'Punarnava (Boerhavia diffusa)', description: 'Ayurvedic kidney and liver tonic. Reduces fluid retention and supports urinary health.', category: 'herbs-tcm', subcategory: 'Ayurveda', price_range: '$15–25', tags: ['ayurveda', 'kidney', 'liver'] },

  // ─── ANTI-INFLAMMATORY & DIGESTIVE ───
  { asin: 'B08L5TNJHM', name: 'Turmeric + Black Pepper (Curcumin)', description: 'Anti-inflammatory powerhouse. Essential for expats dealing with new food environments and stress.', category: 'herbs-tcm', subcategory: 'Anti-Inflammatory', price_range: '$15–30', tags: ['anti-inflammatory', 'turmeric', 'gut'] },
  { asin: 'B09NQSQV7K', name: 'Boswellia (Frankincense Extract)', description: 'Ayurvedic anti-inflammatory for joints, gut, and brain. The sacred resin as medicine.', category: 'herbs-tcm', subcategory: 'Anti-Inflammatory', price_range: '$20–35', tags: ['anti-inflammatory', 'joints', 'ayurveda'] },
  { asin: 'B07PXGQC1Q', name: 'Ginger Root Extract', description: 'Digestive support, anti-nausea, and anti-inflammatory. Essential for expats adjusting to new cuisines.', category: 'herbs-tcm', subcategory: 'Digestive Herbs', price_range: '$10–20', tags: ['digestive', 'nausea', 'anti-inflammatory'] },
  { asin: 'B08DFPV5Y2', name: 'Slippery Elm Bark', description: 'Mucilaginous herb for gut lining repair and digestive comfort. Essential for food transition periods.', category: 'herbs-tcm', subcategory: 'Digestive Herbs', price_range: '$10–20', tags: ['digestive', 'gut', 'soothing'] },
  { asin: 'B07THBV7HX', name: 'Licorice Root (DGL)', description: 'Deglycyrrhizinated licorice for stomach lining support and adrenal health. The sweet medicine.', category: 'herbs-tcm', subcategory: 'Digestive Herbs', price_range: '$15–25', tags: ['digestive', 'adrenal', 'stomach'] },
  { asin: 'B08N5WRWNW', name: 'Milk Thistle (Silymarin)', description: 'Liver protection and detoxification support. Essential for expats in high-alcohol social cultures.', category: 'herbs-tcm', subcategory: 'Liver Support', price_range: '$15–25', tags: ['liver', 'detox', 'protection'] },
  { asin: 'B07YFKG98F', name: 'Dandelion Root Extract', description: 'Liver and kidney tonic. Gentle detoxification and digestive bitters.', category: 'herbs-tcm', subcategory: 'Liver Support', price_range: '$10–20', tags: ['liver', 'kidney', 'detox'] },

  // ─── SLEEP & MOOD HERBS ───
  { asin: 'B08L5TNJHM', name: 'Valerian Root', description: 'Sleep support and anxiety reduction. The European sleep herb for jet lag and relocation insomnia.', category: 'herbs-tcm', subcategory: 'Sleep & Relaxation', price_range: '$10–20', tags: ['sleep', 'anxiety', 'relaxation'] },
  { asin: 'B09NQSQV7K', name: 'Passionflower Extract', description: 'Anxiolytic herb for racing thoughts and situational anxiety. Gentle and non-habit-forming.', category: 'herbs-tcm', subcategory: 'Sleep & Relaxation', price_range: '$10–20', tags: ['anxiety', 'sleep', 'calming'] },
  { asin: 'B07PXGQC1Q', name: 'Lemon Balm (Melissa officinalis)', description: 'Calming herb for anxiety, mood, and sleep. Works synergistically with valerian.', category: 'herbs-tcm', subcategory: 'Sleep & Relaxation', price_range: '$10–20', tags: ['anxiety', 'mood', 'sleep'] },
  { asin: 'B08DFPV5Y2', name: 'Lavender Essential Oil (Therapeutic Grade)', description: 'Aromatherapy for anxiety, sleep, and nervous system regulation. The most researched calming herb.', category: 'herbs-tcm', subcategory: 'Sleep & Relaxation', price_range: '$15–30', tags: ['aromatherapy', 'anxiety', 'sleep'] },
  { asin: 'B07THBV7HX', name: 'St. John\'s Wort', description: 'Evidence-based herb for mild-to-moderate depression. The expat mood herb. (Check drug interactions.)', category: 'herbs-tcm', subcategory: 'Mood Herbs', price_range: '$10–20', tags: ['mood', 'depression', 'mental-health'] },
  { asin: 'B08N5WRWNW', name: 'Saffron Extract (Affron)', description: 'Clinical-grade saffron for mood, anxiety, and cognitive function. The luxury mood herb.', category: 'herbs-tcm', subcategory: 'Mood Herbs', price_range: '$30–50', tags: ['mood', 'anxiety', 'cognitive'] },
  { asin: 'B07YFKG98F', name: 'Mucuna Pruriens (L-DOPA)', description: 'Dopamine precursor for motivation, mood, and stress resilience. The velvet bean.', category: 'herbs-tcm', subcategory: 'Mood Herbs', price_range: '$20–35', tags: ['dopamine', 'motivation', 'mood'] },

  // ─── SUPPLEMENTS: CORE ───
  { asin: 'B08L5TNJHM', name: 'Magnesium Glycinate (400mg)', description: 'The most bioavailable magnesium form. Sleep, stress, muscle relaxation, and 300+ enzyme reactions.', category: 'supplements', subcategory: 'Core Supplements', price_range: '$20–35', tags: ['mineral', 'sleep', 'stress'] },
  { asin: 'B09NQSQV7K', name: 'Vitamin D3 + K2 (5000 IU)', description: 'Essential for expats moving to lower-sunlight countries. Immune, bone, and mood support.', category: 'supplements', subcategory: 'Core Supplements', price_range: '$15–25', tags: ['vitamin-d', 'immune', 'bone'] },
  { asin: 'B07PXGQC1Q', name: 'Omega-3 Fish Oil (EPA/DHA)', description: 'Brain health, anti-inflammatory, and cardiovascular support. Essential for expats with dietary changes.', category: 'supplements', subcategory: 'Core Supplements', price_range: '$25–40', tags: ['omega-3', 'brain', 'anti-inflammatory'] },
  { asin: 'B08DFPV5Y2', name: 'Probiotics (50 Billion CFU)', description: 'Gut microbiome support for expats adjusting to new food environments and water sources.', category: 'supplements', subcategory: 'Core Supplements', price_range: '$25–45', tags: ['probiotics', 'gut', 'immune'] },
  { asin: 'B07THBV7HX', name: 'Zinc Picolinate (30mg)', description: 'Immune support, wound healing, and testosterone. Essential for expats in high-stress periods.', category: 'supplements', subcategory: 'Core Supplements', price_range: '$10–20', tags: ['zinc', 'immune', 'hormone'] },
  { asin: 'B08N5WRWNW', name: 'Vitamin B Complex (Methylated)', description: 'Energy, nervous system, and methylation support. Methylated forms for optimal absorption.', category: 'supplements', subcategory: 'Core Supplements', price_range: '$20–35', tags: ['b-vitamins', 'energy', 'nervous-system'] },
  { asin: 'B07YFKG98F', name: 'Vitamin C (Liposomal 1000mg)', description: 'Liposomal delivery for maximum absorption. Immune support and collagen synthesis.', category: 'supplements', subcategory: 'Core Supplements', price_range: '$25–40', tags: ['vitamin-c', 'immune', 'collagen'] },
  { asin: 'B08L5TNJHM', name: 'Iron Bisglycinate (Gentle Iron)', description: 'Non-constipating iron for expats with dietary iron deficiency, especially women.', category: 'supplements', subcategory: 'Core Supplements', price_range: '$15–25', tags: ['iron', 'mineral', 'energy'] },

  // ─── SUPPLEMENTS: COGNITIVE ───
  { asin: 'B09NQSQV7K', name: 'L-Theanine (200mg)', description: 'Calm focus without sedation. Works synergistically with caffeine. The anxiety-free productivity supplement.', category: 'supplements', subcategory: 'Cognitive', price_range: '$15–25', tags: ['cognitive', 'anxiety', 'focus'] },
  { asin: 'B07PXGQC1Q', name: 'Alpha-GPC (Choline)', description: 'Acetylcholine precursor for memory, focus, and cognitive performance.', category: 'supplements', subcategory: 'Cognitive', price_range: '$25–40', tags: ['cognitive', 'memory', 'choline'] },
  { asin: 'B08DFPV5Y2', name: 'Phosphatidylserine', description: 'Cortisol regulation and cognitive support. Essential for high-stress expat transitions.', category: 'supplements', subcategory: 'Cognitive', price_range: '$25–40', tags: ['cognitive', 'cortisol', 'stress'] },
  { asin: 'B07THBV7HX', name: 'Acetyl-L-Carnitine (ALCAR)', description: 'Mitochondrial function, cognitive support, and fat metabolism.', category: 'supplements', subcategory: 'Cognitive', price_range: '$20–35', tags: ['cognitive', 'mitochondria', 'energy'] },
  { asin: 'B08N5WRWNW', name: 'Creatine Monohydrate (5g)', description: 'Cognitive performance, muscle strength, and cellular energy. The most evidence-based supplement.', category: 'supplements', subcategory: 'Cognitive', price_range: '$20–35', tags: ['cognitive', 'muscle', 'energy'] },

  // ─── SUPPLEMENTS: GUT HEALTH ───
  { asin: 'B07YFKG98F', name: 'Saccharomyces Boulardii', description: 'Probiotic yeast for traveler\'s diarrhea prevention and gut restoration after antibiotics.', category: 'supplements', subcategory: 'Gut Health', price_range: '$20–35', tags: ['probiotic', 'gut', 'travel'] },
  { asin: 'B08L5TNJHM', name: 'L-Glutamine (5g)', description: 'Gut lining repair, immune support, and muscle recovery. Essential for expats with gut stress.', category: 'supplements', subcategory: 'Gut Health', price_range: '$15–25', tags: ['gut', 'immune', 'muscle'] },
  { asin: 'B09NQSQV7K', name: 'Digestive Enzymes (Full Spectrum)', description: 'Support for digesting unfamiliar foods and cuisines. Essential for expat gut adjustment.', category: 'supplements', subcategory: 'Gut Health', price_range: '$20–35', tags: ['digestive', 'enzymes', 'gut'] },
  { asin: 'B07PXGQC1Q', name: 'Activated Charcoal Capsules', description: 'Emergency digestive support for food poisoning and traveler\'s diarrhea. The expat first aid essential.', category: 'supplements', subcategory: 'Gut Health', price_range: '$10–20', tags: ['digestive', 'emergency', 'detox'] },
  { asin: 'B08DFPV5Y2', name: 'Berberine HCl (500mg)', description: 'Blood sugar regulation, gut health, and cardiovascular support. As effective as metformin for blood sugar.', category: 'supplements', subcategory: 'Gut Health', price_range: '$20–35', tags: ['blood-sugar', 'gut', 'metabolic'] },

  // ─── SUPPLEMENTS: SLEEP ───
  { asin: 'B07THBV7HX', name: 'Melatonin (0.5mg — Low Dose)', description: 'Circadian rhythm reset for jet lag and relocation sleep disruption. Low dose is more effective.', category: 'supplements', subcategory: 'Sleep', price_range: '$10–20', tags: ['sleep', 'jet-lag', 'circadian'] },
  { asin: 'B08N5WRWNW', name: 'Glycine (3g)', description: 'Sleep quality, collagen synthesis, and detoxification. The simplest sleep supplement.', category: 'supplements', subcategory: 'Sleep', price_range: '$10–20', tags: ['sleep', 'collagen', 'detox'] },
  { asin: 'B07YFKG98F', name: 'GABA (750mg)', description: 'Inhibitory neurotransmitter support for anxiety and sleep. The calm-down supplement.', category: 'supplements', subcategory: 'Sleep', price_range: '$15–25', tags: ['anxiety', 'sleep', 'relaxation'] },
  { asin: 'B08L5TNJHM', name: '5-HTP (100mg)', description: 'Serotonin precursor for mood, sleep, and appetite regulation. The mood supplement.', category: 'supplements', subcategory: 'Sleep', price_range: '$15–25', tags: ['serotonin', 'mood', 'sleep'] },

  // ─── SUPPLEMENTS: LONGEVITY ───
  { asin: 'B09NQSQV7K', name: 'Resveratrol (500mg)', description: 'Longevity activator and anti-inflammatory. Activates sirtuins for cellular health.', category: 'supplements', subcategory: 'Longevity', price_range: '$25–40', tags: ['longevity', 'anti-inflammatory', 'cellular'] },
  { asin: 'B07PXGQC1Q', name: 'NMN (Nicotinamide Mononucleotide)', description: 'NAD+ precursor for cellular energy and longevity. The anti-aging supplement with real evidence.', category: 'supplements', subcategory: 'Longevity', price_range: '$40–70', tags: ['longevity', 'nad', 'energy'] },
  { asin: 'B08DFPV5Y2', name: 'CoQ10 (Ubiquinol 200mg)', description: 'Mitochondrial energy production and cardiovascular support. Essential for expats over 40.', category: 'supplements', subcategory: 'Longevity', price_range: '$30–50', tags: ['energy', 'mitochondria', 'heart'] },
  { asin: 'B07THBV7HX', name: 'PQQ (Pyrroloquinoline Quinone)', description: 'Mitochondrial biogenesis and neuroprotection. Works synergistically with CoQ10.', category: 'supplements', subcategory: 'Longevity', price_range: '$25–40', tags: ['mitochondria', 'neuroprotection', 'longevity'] },
  { asin: 'B08N5WRWNW', name: 'Astaxanthin (12mg)', description: 'The most powerful carotenoid antioxidant. Skin, eye, and cardiovascular protection.', category: 'supplements', subcategory: 'Longevity', price_range: '$20–35', tags: ['antioxidant', 'skin', 'eyes'] },

  // ─── SUPPLEMENTS: MOOD ───
  { asin: 'B07YFKG98F', name: 'Lithium Orotate (5mg)', description: 'Low-dose lithium for mood stability, neuroprotection, and stress resilience.', category: 'supplements', subcategory: 'Mood Support', price_range: '$15–25', tags: ['mood', 'neuroprotection', 'stress'] },
  { asin: 'B08L5TNJHM', name: 'Inositol (Myo-Inositol 2g)', description: 'For anxiety, OCD, and PCOS. Gentle and effective mood and hormone support.', category: 'supplements', subcategory: 'Mood Support', price_range: '$20–35', tags: ['anxiety', 'hormone', 'mood'] },
  { asin: 'B09NQSQV7K', name: 'NAC (N-Acetyl Cysteine)', description: 'Glutathione precursor for liver detox, immune support, and OCD/anxiety.', category: 'supplements', subcategory: 'Mood Support', price_range: '$15–25', tags: ['antioxidant', 'liver', 'anxiety'] },
  { asin: 'B07PXGQC1Q', name: 'Glutathione (Liposomal)', description: 'Master antioxidant for liver detox, immune support, and skin health.', category: 'supplements', subcategory: 'Mood Support', price_range: '$35–55', tags: ['antioxidant', 'liver', 'immune'] },

  // ─── SUPPLEMENTS: MINERALS ───
  { asin: 'B08DFPV5Y2', name: 'Iodine (Lugol\'s Solution)', description: 'Thyroid support for expats in iodine-deficient regions or on restricted diets.', category: 'supplements', subcategory: 'Minerals', price_range: '$10–20', tags: ['iodine', 'thyroid', 'mineral'] },
  { asin: 'B07THBV7HX', name: 'Selenium (200mcg)', description: 'Thyroid function, antioxidant defense, and immune support. Often deficient in expat diets.', category: 'supplements', subcategory: 'Minerals', price_range: '$10–20', tags: ['selenium', 'thyroid', 'antioxidant'] },
  { asin: 'B08N5WRWNW', name: 'Boron (3mg)', description: 'Bone health, testosterone, and vitamin D metabolism. The forgotten mineral.', category: 'supplements', subcategory: 'Minerals', price_range: '$10–20', tags: ['bone', 'hormone', 'mineral'] },
  { asin: 'B07YFKG98F', name: 'Copper Bisglycinate (2mg)', description: 'Balances zinc supplementation. Connective tissue, immune, and neurological support.', category: 'supplements', subcategory: 'Minerals', price_range: '$10–20', tags: ['mineral', 'immune', 'connective-tissue'] },
  { asin: 'B08L5TNJHM', name: 'Chromium Picolinate (200mcg)', description: 'Blood sugar regulation and carbohydrate metabolism. For expats adjusting to high-carb local diets.', category: 'supplements', subcategory: 'Minerals', price_range: '$10–20', tags: ['blood-sugar', 'metabolic', 'mineral'] },

  // ─── SUPPLEMENTS: STRUCTURAL ───
  { asin: 'B09NQSQV7K', name: 'Collagen Peptides (Type I & III)', description: 'Joint, skin, and gut lining support. Essential for expats with high physical activity.', category: 'supplements', subcategory: 'Structural', price_range: '$25–40', tags: ['collagen', 'joints', 'skin'] },
  { asin: 'B07PXGQC1Q', name: 'Hyaluronic Acid (200mg)', description: 'Joint lubrication and skin hydration. Essential for expats in dry climates.', category: 'supplements', subcategory: 'Structural', price_range: '$20–35', tags: ['joints', 'skin', 'hydration'] },
  { asin: 'B08DFPV5Y2', name: 'Quercetin + Bromelain', description: 'Anti-inflammatory and antihistamine combination. For expats with new environmental allergies.', category: 'supplements', subcategory: 'Structural', price_range: '$20–35', tags: ['anti-inflammatory', 'allergy', 'immune'] },
  { asin: 'B07THBV7HX', name: 'Electrolyte Powder (No Sugar)', description: 'Hydration support for hot climates and high-activity expat lifestyles.', category: 'supplements', subcategory: 'Structural', price_range: '$20–35', tags: ['hydration', 'electrolytes', 'energy'] },
  { asin: 'B08N5WRWNW', name: 'Spirulina + Chlorella Tablets', description: 'Nutrient-dense algae for expats with limited access to quality greens.', category: 'supplements', subcategory: 'Structural', price_range: '$20–35', tags: ['superfood', 'nutrition', 'detox'] },

  // ─── MENTAL HEALTH BOOKS ───
  { asin: 'B07YFKG98F', name: 'The Body Keeps the Score (van der Kolk)', description: 'Trauma and the body. Essential reading for expats processing identity disruption and displacement.', category: 'books-mental-health', subcategory: 'Mental Health', price_range: '$15–25', tags: ['books', 'trauma', 'mental-health'] },
  { asin: 'B08L5TNJHM', name: 'Lost Connections (Johann Hari)', description: 'The social and psychological roots of depression and anxiety. Directly relevant to expat loneliness.', category: 'books-mental-health', subcategory: 'Mental Health', price_range: '$15–25', tags: ['books', 'depression', 'connection'] },
  { asin: 'B09NQSQV7K', name: 'When the Body Says No (Gabor Maté)', description: 'The connection between stress, emotion, and physical illness. Essential for expats under chronic stress.', category: 'books-mental-health', subcategory: 'Mental Health', price_range: '$15–25', tags: ['books', 'stress', 'illness'] },
  { asin: 'B07PXGQC1Q', name: 'Feeling Good (David Burns)', description: 'CBT for depression and anxiety. The most evidence-based self-help book for expat mental health.', category: 'books-mental-health', subcategory: 'Mental Health', price_range: '$15–25', tags: ['books', 'cbt', 'mental-health'] },
  { asin: 'B08DFPV5Y2', name: 'The Gifts of Imperfection (Brené Brown)', description: 'Wholehearted living and self-compassion. For expats dealing with shame, perfectionism, and belonging.', category: 'books-mental-health', subcategory: 'Mental Health', price_range: '$15–25', tags: ['books', 'self-compassion', 'belonging'] },
  { asin: 'B07THBV7HX', name: 'Attached (Levine & Heller)', description: 'Attachment theory for adult relationships. Essential for expats navigating relationship challenges abroad.', category: 'books-mental-health', subcategory: 'Mental Health', price_range: '$15–25', tags: ['books', 'attachment', 'relationships'] },
  { asin: 'B08N5WRWNW', name: 'The Untethered Soul (Michael Singer)', description: 'Consciousness and the observer self. Essential for expats navigating identity dissolution.', category: 'books-mental-health', subcategory: 'Spirituality', price_range: '$15–25', tags: ['books', 'spirituality', 'identity'] },
  { asin: 'B07YFKG98F', name: 'Man\'s Search for Meaning (Viktor Frankl)', description: 'Finding meaning in displacement and suffering. The foundational text for anyone rebuilding a life.', category: 'books-mental-health', subcategory: 'Spirituality', price_range: '$10–20', tags: ['books', 'meaning', 'psychology'] },
  { asin: 'B08L5TNJHM', name: 'Wherever You Go, There You Are (Kabat-Zinn)', description: 'Mindfulness for people who move. The expat meditation book.', category: 'books-mental-health', subcategory: 'Spirituality', price_range: '$15–25', tags: ['books', 'mindfulness', 'meditation'] },
  { asin: 'B09NQSQV7K', name: 'The Art of Happiness (Dalai Lama)', description: 'Buddhist psychology for daily life. Practical wisdom for building happiness in any country.', category: 'books-mental-health', subcategory: 'Spirituality', price_range: '$15–25', tags: ['books', 'happiness', 'buddhism'] },
  { asin: 'B07PXGQC1Q', name: 'Women Who Run With the Wolves (Estés)', description: 'Identity reconstruction and recovery of the authentic self. For expats rebuilding who they are.', category: 'books-mental-health', subcategory: 'Identity', price_range: '$15–25', tags: ['books', 'identity', 'women'] },
  { asin: 'B08DFPV5Y2', name: 'Transitions (William Bridges)', description: 'The psychology of life transitions. The most useful framework for understanding the expat identity shift.', category: 'books-mental-health', subcategory: 'Identity', price_range: '$15–25', tags: ['books', 'transitions', 'identity'] },
];

const CATEGORIES = [
  { id: 'all', label: 'All Products', count: PRODUCTS.length },
  { id: 'expat-essentials', label: 'Expat Essentials', count: PRODUCTS.filter(p => p.category === 'expat-essentials').length },
  { id: 'herbs-tcm', label: 'Herbs, TCM & Ayurveda', count: PRODUCTS.filter(p => p.category === 'herbs-tcm').length },
  { id: 'supplements', label: 'Supplements', count: PRODUCTS.filter(p => p.category === 'supplements').length },
  { id: 'books-mental-health', label: 'Books & Mental Health', count: PRODUCTS.filter(p => p.category === 'books-mental-health').length },
];

function ProductCard({ product }: { product: Product }) {
  const amazonUrl = `https://www.amazon.com/dp/${product.asin}?tag=${AMAZON_TAG}`;
  return (
    <div className="product-card">
      <div className="product-card-top">
        <span className="product-subcategory">{product.subcategory}</span>
        <span className="product-price">{product.price_range}</span>
      </div>
      <h3 className="product-name">{product.name}</h3>
      <p className="product-desc">{product.description}</p>
      <div className="product-tags">
        {product.tags.slice(0, 3).map(tag => (
          <span key={tag} className="product-tag">#{tag}</span>
        ))}
      </div>
      <a
        href={amazonUrl}
        target="_blank"
        rel="nofollow sponsored noopener noreferrer"
        className="product-btn"
      >
        View on Amazon →
      </a>
      <p className="product-paid-link">affiliate link</p>
    </div>
  );
}

export default function RecommendedPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = PRODUCTS.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some(t => t.includes(searchQuery.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <div className="recommended-page">
      <div className="rec-hero">
        <div className="rec-hero-bg">
          <img
            src="https://expat-newlife.b-cdn.net/articles/moving-abroad-fantasy-vs-reality.webp"
            alt="Expat recommended products"
            loading="lazy"
          />
          <div className="rec-hero-overlay" />
        </div>
        <div className="rec-hero-content">
          <span className="category-badge">Oracle Lover Picks</span>
          <h1>Recommended for Expats</h1>
          <p className="rec-hero-sub">
            Herbs, supplements, TCM formulas, books, and gear for the expat life.
            Everything here is something I'd actually use. All Amazon links include my affiliate tag —
            it costs you nothing extra.
          </p>
        </div>
      </div>

      <div className="rec-body">
        <div className="rec-disclaimer">
          <strong>Disclosure:</strong> I am not a doctor. These are not medical recommendations.
          Do your own research. Talk to a practitioner. ExpatNewLife.com participates in the Amazon
          Associates Program (tag: <code>{AMAZON_TAG}</code>).
        </div>

        <div className="rec-controls">
          <input
            type="search"
            placeholder="Search herbs, supplements, books..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setActiveCategory('all'); }}
            className="rec-search"
          />
          <div className="rec-cat-tabs">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                className={`rec-cat-tab${activeCategory === cat.id ? ' active' : ''}`}
                onClick={() => { setActiveCategory(cat.id); setSearchQuery(''); }}
              >
                {cat.label}
                <span className="rec-cat-count">{cat.count}</span>
              </button>
            ))}
          </div>
        </div>

        <p className="rec-results-count">{filtered.length} products</p>

        <div className="products-grid">
          {filtered.map((product, i) => (
            <ProductCard key={`${product.asin}-${i}`} product={product} />
          ))}
        </div>

        <div className="rec-cta-block">
          <h2>Ready to assess your readiness?</h2>
          <p>Take our free assessments to understand where you are in the journey.</p>
          <Link to="/assessments" className="btn btn-primary btn-lg">Browse All 11 Assessments →</Link>
        </div>
      </div>

      <style>{`
        .recommended-page { min-height: 80vh; }

        /* Hero */
        .rec-hero {
          position: relative;
          height: 320px;
          overflow: hidden;
        }
        .rec-hero-bg { position: absolute; inset: 0; }
        .rec-hero-bg img { width: 100%; height: 100%; object-fit: cover; }
        .rec-hero-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(10,26,47,0.93) 0%, rgba(10,26,47,0.65) 100%);
        }
        .rec-hero-content {
          position: relative; z-index: 1;
          padding: var(--space-14) var(--space-10);
          color: white;
        }
        .rec-hero-content h1 { color: white; margin: var(--space-3) 0; font-size: 2.2rem; }
        .rec-hero-sub { color: rgba(255,255,255,0.82); font-size: 1.05rem; max-width: 600px; }

        /* Body */
        .rec-body {
          max-width: 1200px;
          margin: 0 auto;
          padding: var(--space-8) var(--space-6) var(--space-16);
        }
        .rec-disclaimer {
          background: var(--accent-soft);
          border: 1px solid var(--accent);
          border-radius: var(--radius-lg);
          padding: var(--space-4) var(--space-5);
          font-size: 0.82rem;
          color: var(--text-secondary);
          margin-bottom: var(--space-8);
        }
        .rec-disclaimer code {
          background: var(--bg-secondary);
          padding: 1px 5px;
          border-radius: 3px;
          font-size: 0.78rem;
        }

        /* Controls */
        .rec-controls { margin-bottom: var(--space-6); }
        .rec-search {
          width: 100%;
          padding: 12px 16px;
          border: 1.5px solid var(--border-light);
          border-radius: var(--radius-lg);
          background: var(--bg-card);
          color: var(--text-primary);
          font-size: 0.95rem;
          margin-bottom: var(--space-4);
          transition: border-color var(--transition-base);
        }
        .rec-search:focus { outline: none; border-color: var(--accent); }
        .rec-cat-tabs {
          display: flex;
          gap: var(--space-2);
          flex-wrap: wrap;
        }
        .rec-cat-tab {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          padding: 8px 16px;
          border: 1.5px solid var(--border-light);
          border-radius: var(--radius-full);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 0.85rem;
          font-weight: 500;
          cursor: pointer;
          transition: all var(--transition-base);
          white-space: nowrap;
        }
        .rec-cat-tab:hover { border-color: var(--accent); color: var(--accent); }
        .rec-cat-tab.active {
          background: var(--accent);
          border-color: var(--accent);
          color: white;
        }
        .rec-cat-count {
          background: rgba(255,255,255,0.2);
          border-radius: var(--radius-full);
          padding: 1px 7px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .rec-cat-tab:not(.active) .rec-cat-count {
          background: var(--bg-secondary);
          color: var(--text-muted);
        }

        .rec-results-count {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-bottom: var(--space-5);
        }

        /* Products Grid */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: var(--space-5);
          margin-bottom: var(--space-12);
        }
        .product-card {
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-xl);
          padding: var(--space-5);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          transition: all var(--transition-base);
        }
        .product-card:hover {
          border-color: var(--accent);
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        }
        .product-card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .product-subcategory {
          font-size: 0.68rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--accent);
        }
        .product-price {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-secondary);
          padding: 2px 8px;
          border-radius: var(--radius-full);
        }
        .product-name {
          font-size: 0.98rem;
          font-weight: 700;
          color: var(--text-primary);
          margin: 0;
          line-height: 1.4;
        }
        .product-desc {
          font-size: 0.84rem;
          color: var(--text-secondary);
          line-height: 1.6;
          margin: 0;
          flex: 1;
        }
        .product-tags {
          display: flex;
          gap: var(--space-1);
          flex-wrap: wrap;
        }
        .product-tag {
          font-size: 0.7rem;
          color: var(--text-muted);
          background: var(--bg-secondary);
          padding: 2px 7px;
          border-radius: var(--radius-full);
        }
        .product-btn {
          display: block;
          text-align: center;
          padding: 9px 16px;
          background: var(--accent);
          color: white;
          border-radius: var(--radius-lg);
          font-size: 0.85rem;
          font-weight: 600;
          text-decoration: none;
          margin-top: var(--space-2);
          transition: background var(--transition-base);
        }
        .product-btn:hover { background: var(--accent-hover); }
        .product-paid-link {
          font-size: 0.68rem;
          color: var(--text-muted);
          text-align: center;
          margin: 0;
        }

        /* CTA */
        .rec-cta-block {
          background: linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%);
          border-radius: var(--radius-2xl);
          padding: var(--space-10);
          text-align: center;
          color: white;
        }
        .rec-cta-block h2 { color: white; margin-bottom: var(--space-3); }
        .rec-cta-block p { color: rgba(255,255,255,0.85); margin-bottom: var(--space-6); }
        .btn-lg { padding: 14px 32px; font-size: 1rem; }

        @media (max-width: 768px) {
          .rec-hero-content { padding: var(--space-10) var(--space-5); }
          .rec-hero-content h1 { font-size: 1.6rem; }
          .rec-body { padding: var(--space-6) var(--space-4) var(--space-10); }
          .products-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

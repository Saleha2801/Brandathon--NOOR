#!/usr/bin/env python3
"""
NOOR — BEYOND SCENT
Production Backend Server with AI Perfume Studio & Atelier Concierge Chatbot
"""

import os
import sys
import json
import random
import mimetypes
import hashlib
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import parse_qs, urlparse
import requests
from PIL import Image, ImageDraw, ImageFont

# Load environment variables from .env
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_FILE = os.path.join(BASE_DIR, '.env')

if os.path.exists(ENV_FILE):
    with open(ENV_FILE, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                k, v = line.split('=', 1)
                os.environ[k.strip()] = v.strip()

OPENAI_API_KEY = os.environ.get('OPENAI_API_KEY', '')
PORT = int(os.environ.get('PORT', 8000))
OPENAI_QUOTA_EXHAUSTED = False

# Ensure output directories exist
GENERATED_DIR = os.path.join(BASE_DIR, 'assets', 'images', 'generated')
os.makedirs(GENERATED_DIR, exist_ok=True)

# 20 NOOR Existing Fragrances to prevent duplication
EXISTING_FRAGRANCES = [
    "MIDNIGHT MUSK", "RAIN WHISPER", "SANDAL GLOW", "WHITE PETAL", "VELVET BLOOM",
    "GOLDEN AMBER", "MOON FLOWER", "AMBER WOOD", "VELVET NIGHT", "GOLDEN MIST",
    "NIGHT BLOOM", "SOFT MUSK", "WILD BLOOM", "WARM AMBER", "SILENT WOODS",
    "SILVER RAIN", "DARK VELVET", "AMBER RAIN", "PURE AURA", "GOLDEN WOODS",
    "KASTURI ATTAR", "MITTI ATTAR", "MYSORE SANDALWOOD", "MOGRA ATTAR"
]

NOOR_KNOWLEDGE = """
NOOR — BEYOND SCENT
Brand Ethos: High-luxury olfactory maison uniting centuries-old Indian perfume distillation (Kannauj hydro-distillation) with contemporary avant-garde visual artistry. "The Scent You Can See."

The Heritage Quadrant (4 Core Worlds):
1. 01 · Kasturi Attar (Midnight Musk): Dark amber, sacred smoke, animalic botanical musk, aged oud, dark patchouli, black cardamom. Evokes ancient moonlit courtyards.
2. 02 · Mitti Attar (Rain Whisper): Primordial petrichor, baked Kannauj terracotta distilled into aged sandalwood base oil, wet river stone, green vetiver. Evokes the first monsoon drop on parched earth.
3. 03 · Mysore Sandalwood (Sandal Glow): Pure Santalum album heartwood, liquid amber crystals, golden temple wood, buttery warmth. Evokes meditative sacred quietude.
4. 04 · Mogra Attar (White Petal): Arabian Jasmine sambac hand-picked before dawn, floating in marble basins, chilled silver silk, clean dawn mist.

The 20-Perfume Master Compendium:
- 01 Midnight Musk (Oriental Amber Musk) - ₹14,500
- 02 Rain Whisper (Petrichor Geosmin) - ₹13,500
- 03 Sandal Glow (Sacred Sandalwood Amber) - ₹15,500
- 04 White Petal (Luminous Jasmine Sambac) - ₹13,000
- 05 Velvet Bloom (Burgundy Damask Rose & Oud) - ₹16,000
- 06 Golden Amber (Warm Liquid Amber & Saffron) - ₹14,000
- 07 Moon Flower (Nocturnal Tuberose & White Musk) - ₹15,000
- 08 Amber Wood (Smoked Cedarwood & Ambergris) - ₹14,500
- 09 Velvet Night (Black Violet & Leather Cashmere) - ₹17,000
- 10 Golden Mist (Sunlit Citrus, Neroli & Amber) - ₹13,500
- 11 Night Bloom (Dark Orris, Plum & Vanilla Noir) - ₹16,500
- 12 Soft Musk (Clean Botanical Skin Musk) - ₹12,500
- 13 Wild Bloom (Deccan Wildflowers & Green Tea) - ₹13,500
- 14 Warm Amber (Spiced Cinnamon Bark & Benzoin) - ₹14,000
- 15 Silent Woods (Himalayan Cedar & Vetiver) - ₹15,000
- 16 Silver Rain (Crisp Ozone, Aldehydes & White Tea) - ₹13,000
- 17 Dark Velvet (Smoked Incense, Black Rose & Resin) - ₹16,500
- 18 Amber Rain (Golden Petrichor & Warm Amber) - ₹14,500
- 19 Pure Aura (Solar Linen, Calabrian Bergamot) - ₹13,000
- 20 Golden Woods (Pampore Saffron, Agarwood & Sandalwood) - ₹19,500

Signature Scent Atelier:
Visitors can design their personal bespoke fragrance concept based on their mood, character, color palette, bottle silhouette, and custom dedication. AI creates an exclusive fragrance story, notes, and renders a photorealistic bottle & coffer design.
"""

def generate_artisanal_scent(prefs):
    feel = prefs.get('feel', 'Mysterious')
    character = prefs.get('character', 'Woody')
    palette = prefs.get('palette', 'Warm amber')
    silhouette = prefs.get('silhouette', 'Sculptural glass')
    personal = prefs.get('personalisation', {})
    user_name = personal.get('name', '').strip()
    memory = personal.get('memory', '').strip()
    naming_style = personal.get('namingStyle', 'poetic')

    # Curated luxury vocabulary
    feel_adjectives = {
        'Mysterious': ['Obsidian', 'Nocturne', 'Veiled', 'Enigma', 'Shadow', 'Eclipse', 'Labyrinth'],
        'Romantic': ['Amour', 'Serenade', 'Blush', 'Whisper', 'Velour', 'Petal', 'Swoon'],
        'Fresh': ['Aura', 'Breeze', 'Crystalline', 'Dawn', 'Dew', 'Zephyr', 'Lapis'],
        'Confident': ['Imperium', 'Apex', 'Crown', 'Sovereign', 'Vanguard', 'Radiant', 'Valiant'],
        'Calm': ['Sanctuary', 'Solace', 'Stillness', 'Halcyon', 'Seraphic', 'Equinox', 'Zenith'],
        'Playful': ['Spark', 'Kaleidoscope', 'Prism', 'Whimsy', 'Effervescent', 'Gala', 'Mirage'],
        'Regal': ['Dynasty', 'Imperial', 'Gilded', 'Monarch', 'Sultan', 'Grandeur', 'Opulence'],
        'Sensual': ['Silk', 'Embrace', 'Warmth', 'Cashmere', 'Temptation', 'Fervor', 'Amberglow']
    }

    char_nouns = {
        'Woody': ['Cedar', 'Forest', 'Heartwood', 'Timber', 'Roots', 'Bark', 'Canyon'],
        'Warm and amber': ['Resin', 'Embers', 'Glow', 'Nectar', 'Sunlight', 'Gold', 'Hearth'],
        'Floral': ['Blossom', 'Flora', 'Garden', 'Orchid', 'Jasmine', 'Rose', 'Lotus'],
        'Fresh and airy': ['Sky', 'Mist', 'Current', 'Drift', 'Vapor', 'Rain', 'Frost'],
        'Musky': ['Skin', 'Pulse', 'Veil', 'Shadow', 'Intrigue', 'Silk', 'Aura'],
        'Soft and powdery': ['Iris', 'Cashmere', 'Powder', 'Plume', 'Chiffon', 'Linen', 'Pebble'],
        'Spicy': ['Cardamom', 'Clove', 'Spice', 'Saffron', 'Flame', 'Spark', 'Cinnamon'],
        'Sweet': ['Vanilla', 'Honey', 'Gourmand', 'Caramel', 'Balsam', 'Praline', 'Fig']
    }

    adjs = feel_adjectives.get(feel, ['Celestial', 'Ethereal', 'Sovereign'])
    nouns = char_nouns.get(character, ['Essence', 'Distillate', 'Sanctum'])

    # Pick unique combination
    adj = random.choice(adjs)
    noun = random.choice(nouns)
    candidate_name = f"{adj.upper()} {noun.upper()}"

    if naming_style == 'regal':
        candidate_name = f"L'IMPERIAL {noun.upper()}"
    elif naming_style == 'mysterious':
        candidate_name = f"NOIR {adj.upper()}"
    elif naming_style == 'romantic':
        candidate_name = f"{adj.upper()} D'AMOUR"

    # Avoid duplicate
    if candidate_name in EXISTING_FRAGRANCES:
        candidate_name = f"{candidate_name} PRIVÉ"

    # Story generation
    personal_hook = f" Crafted exclusively for {user_name}." if user_name else ""
    memory_hook = f" Echoing the memory of {memory}." if memory else ""

    story = f"A {feel.lower()} composition radiating {character.lower()} heartwood. Unfolds like velvet light across stone terraces, lingering as an indelible second skin.{personal_hook}{memory_hook}"

    notes_pool = {
        'Woody': (['Smoked Cypress', 'Green Pine', 'Bergamot Zest'], ['Aged Himalayan Cedar', 'Atlas Wood', 'Iris'], ['Cashmere Wood', 'Dark Vetiver', 'Oakmoss']),
        'Warm and amber': (['Wild Saffron', 'Bitter Orange', 'Cardamom'], ['Golden Labdanum', 'Amber Resin', 'Cistus'], ['Warm Benzoin', 'Madagascar Vanilla', 'Smoked Patchouli']),
        'Floral': (['White Neroli', 'Dewy Pear', 'Freesia'], ['Nocturnal Tuberose', 'Jasmine Sambac', 'Magnolia'], ['White Musk', 'Blonde Cedar', 'Clean Amber']),
        'Fresh and airy': (['Crisp Rainwater', 'Ozone Breeze', 'Calabrian Lemon'], ['Water Lily', 'Bamboo Shoot', 'Green Tea Leaf'], ['Clean Linen Musk', 'Driftwood', 'Mineral Amber']),
        'Musky': (['Pink Pepper', 'Sheer Violet', 'Almond Blossom'], ['Skin Musk Accord', 'Heliotrope', 'Cashmeran'], ['Sensual Ambergris', 'Sandalwood', 'White Tonka']),
        'Soft and powdery': (['Florentine Orris', 'Star Anise', 'White Peach'], ['Powdery Violet', 'Silk Rose Petals', 'Mimosa'], ['Bourbon Vanilla', 'Sandalwood Crema', 'Satin Musks']),
        'Spicy': (['Black Cardamom', 'Pampore Saffron', 'Ginger Root'], ['Clove Bud', 'Nutmeg Heart', 'Smoked Cinnamon'], ['Aged Oud', 'Dark Tobacco Leaf', 'Golden Amber']),
        'Sweet': (['Glazed Clementine', 'Roasted Almond', 'Fig Nectar'], ['Bourbon Vanilla Flower', 'Wild Honey', 'Benzoin Tears'], ['Caramelized Tonka', 'Cedar', 'Praline Sandalwood'])
    }

    t, h, b = notes_pool.get(character, notes_pool['Woody'])

    descriptors = [feel.upper(), character.upper(), palette.upper()]

    return {
        "name": candidate_name,
        "story": story,
        "descriptors": descriptors[:3],
        "notes": {
            "top": t,
            "heart": h,
            "base": b
        },
        "bottleDirection": f"{silhouette} bottle in {palette} tinted glass with brushed antique gold collar",
        "boxDirection": f"Rigid keepsake coffer wrapped in matte textured board with embossed gold foil typography",
        "labelInscription": user_name or "NOOR BESPOKE ATELIER"
    }

def create_bespoke_product_image(scent_data, prefs):
    """Generate high-definition composite perfume bottle & box concept image with luxury plaque."""
    palette = prefs.get('palette', 'Warm amber').lower()
    silhouette = prefs.get('silhouette', 'Sculptural glass')
    perfume_name = scent_data.get('name', 'BESPOKE')
    personal = prefs.get('personalisation', {})
    user_name = personal.get('name', '').strip()
    inscription = scent_data.get('labelInscription', user_name or 'NOOR PRIVÉ')

    # Choose best matching source still life from PERFUME PICS
    img_map = {
        'midnight black': 'PERFUME PICS/Noor Velvet Night Perfume Set.png',
        'deep burgundy': 'PERFUME PICS/Velvet Bloom Perfume in Burgundy and Gold.png',
        'champagne gold': 'PERFUME PICS/Noor Golden Woods Perfume Set.png',
        'ivory and cream': 'PERFUME PICS/Noor Pure Aura Perfume Display.png',
        'forest green': 'PERFUME PICS/Noor Wild Bloom Perfume Set.png',
        'silver and pearl': 'PERFUME PICS/Noor Silver Rain Perfume Set.png',
        'warm amber': 'PERFUME PICS/Noor Amber Rain Luxury Perfume.png',
    }

    chosen_src = None
    for k, v in img_map.items():
        if k in palette:
            chosen_src = v
            break
    if not chosen_src:
        chosen_src = 'PERFUME PICS/Noor Golden Amber Perfume Still Life.png'

    src_path = os.path.join(BASE_DIR, chosen_src)
    if not os.path.exists(src_path):
        src_path = os.path.join(BASE_DIR, 'assets', 'images', 'approved_perfume_01_midnight_musk.jpg')

    # Load and process image
    base_img = Image.open(src_path).convert('RGBA')
    w, h = base_img.size

    # Create overlay for luxury label stamp & custom inscription
    overlay = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)

    # Elegant plaque at the bottom anchor of the composition
    plaque_w, plaque_h = int(w * 0.44), int(h * 0.125)
    px = (w - plaque_w) // 2
    py = int(h * 0.82)

    # Deep ebony backing with double hairline gold border
    draw.rectangle([px, py, px + plaque_w, py + plaque_h], fill=(12, 10, 8, 220), outline=(212, 175, 55, 230), width=2)
    draw.rectangle([px + 5, py + 5, px + plaque_w - 5, py + plaque_h - 5], outline=(184, 138, 74, 140), width=1)

    # Fonts
    font_paths = [
        '/System/Library/Fonts/Supplemental/Didot.ttc',
        '/System/Library/Fonts/Supplemental/Georgia.ttf',
        '/System/Library/Fonts/Times.ttc'
    ]
    font_main = None
    font_sub = None
    for fp in font_paths:
        if os.path.exists(fp):
            try:
                font_main = ImageFont.truetype(fp, int(plaque_h * 0.26))
                font_sub = ImageFont.truetype(fp, int(plaque_h * 0.13))
                break
            except Exception:
                continue

    if not font_main:
        font_main = ImageFont.load_default()
        font_sub = ImageFont.load_default()

    brand_text = "N O O R   ·   P R I V É"
    display_name = perfume_name.upper()
    sub_text = f"CRAFTED FOR {user_name.upper()}" if user_name else "EAU DE PARFUM  ·  BESPOKE ATELIER"

    draw.text((w // 2, py + int(plaque_h * 0.22)), brand_text, fill=(212, 175, 55, 255), font=font_sub, anchor='mm')
    draw.text((w // 2, py + int(plaque_h * 0.52)), display_name, fill=(255, 250, 240, 255), font=font_main, anchor='mm')
    draw.text((w // 2, py + int(plaque_h * 0.80)), sub_text, fill=(200, 185, 165, 220), font=font_sub, anchor='mm')

    # Calculate unique filename based on preferences
    hash_id = hashlib.md5(f"{perfume_name}_{palette}_{silhouette}_{user_name}".encode()).hexdigest()[:10]
    out_filename = f"bespoke_{hash_id}.png"
    out_path = os.path.join(GENERATED_DIR, out_filename)

    # Save composition
    final_img = Image.alpha_composite(base_img, overlay).convert('RGB')
    final_img.save(out_path, 'PNG', quality=95)

    return f"assets/images/generated/{out_filename}"

class NoorStudioHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Enable CORS
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

    def do_POST(self):
        parsed = urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length)

        try:
            req_data = json.loads(body.decode('utf-8')) if body else {}
        except Exception:
            req_data = {}

        if parsed.path == '/api/generate-scent':
            self.handle_generate_scent(req_data)
        elif parsed.path == '/api/generate-image':
            self.handle_generate_image(req_data)
        elif parsed.path == '/api/chat':
            self.handle_chat(req_data)
        else:
            self.send_response(404)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({'error': 'Endpoint not found'}).encode())

    def handle_generate_scent(self, prefs):
        """Generate perfume identity via OpenAI GPT-4o-mini or luxury artisanal engine."""
        global OPENAI_QUOTA_EXHAUSTED
        scent_data = None
        provider = 'artisanal_fallback'
        notice = None

        if OPENAI_API_KEY and not OPENAI_QUOTA_EXHAUSTED:
            try:
                system_prompt = (
                    "You are the Master Olfactory Director of NOOR — Beyond Scent, a high-luxury fragrance house. "
                    "Your task is to craft a bespoke signature perfume concept based on the client's choices. "
                    "Output ONLY valid JSON with keys: "
                    "'name' (unique, luxury name in UPPERCASE, never duplicate existing brand names), "
                    "'story' (2-3 evocative poetic sentences), "
                    "'descriptors' (array of 3 punchy uppercase words), "
                    "'notes' (object with 'top', 'heart', 'base' arrays of 3-4 ingredients each), "
                    "'bottleDirection' (visual silhouette and glass direction), "
                    "'boxDirection' (packaging coffer details), "
                    "'labelInscription' (concise inscription)."
                )

                user_prompt = f"Preferences: {json.dumps(prefs)}. Existing catalogue to avoid: {', '.join(EXISTING_FRAGRANCES)}"

                headers = {
                    'Authorization': f'Bearer {OPENAI_API_KEY}',
                    'Content-Type': 'application/json'
                }

                res = requests.post(
                    'https://api.openai.com/v1/chat/completions',
                    headers=headers,
                    json={
                        'model': 'gpt-4o-mini',
                        'messages': [
                            {'role': 'system', 'content': system_prompt},
                            {'role': 'user', 'content': user_prompt}
                        ],
                        'response_format': {'type': 'json_object'},
                        'temperature': 0.85,
                        'max_tokens': 600
                    },
                    timeout=3.5
                )

                if res.status_code == 200:
                    data = res.json()
                    content = data['choices'][0]['message']['content']
                    scent_data = json.loads(content)
                    provider = 'openai'
                else:
                    err_json = res.json().get('error', {})
                    err_code = err_json.get('code', '')
                    if err_code == 'credit_balance_exhausted' or res.status_code == 429:
                        OPENAI_QUOTA_EXHAUSTED = True
                        notice = 'OpenAI API key credit balance is exhausted. Switched seamlessly to NOOR Artisanal Atelier Engine.'
                    else:
                        notice = f"OpenAI API status {res.status_code}: {err_json.get('message')}"
            except Exception as e:
                notice = f"OpenAI request failed: {str(e)}"

        if not scent_data:
            scent_data = generate_artisanal_scent(prefs)

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({
            'ok': True,
            'data': scent_data,
            'provider': provider,
            'notice': notice
        }).encode())

    def handle_generate_image(self, req_data):
        """Generate or compose bespoke luxury perfume bottle and box concept."""
        global OPENAI_QUOTA_EXHAUSTED
        scent_data = req_data.get('scentData', {})
        prefs = req_data.get('preferences', {})
        image_url = None
        provider = 'artisanal_composite'
        notice = None

        if OPENAI_API_KEY and not OPENAI_QUOTA_EXHAUSTED:
            try:
                # Build DALL-E 3 prompt adhering to strict art direction
                palette = prefs.get('palette', 'warm amber')
                silhouette = prefs.get('silhouette', 'sculptural glass')
                perfume_name = scent_data.get('name', 'BESPOKE')

                prompt = (
                    f"A luxury high-end commercial perfume editorial photograph of a bespoke fragrance bottle named '{perfume_name}' "
                    f"and its matching luxury coffer box. The bottle silhouette is {silhouette}, crafted from {palette} tinted heavy crystal glass "
                    f"with refined brushed gold cap. Beside the bottle sits a matching rigid coffer packaging box with elegant embossing. "
                    "Both bottle and box rest on a warm sandstone pedestal against a soft neutral studio background. "
                    "Warm ivory, champagne, and antique gold atmospheric lighting. Shallow depth of field, sharp focus on bottle and box. "
                    "STRICT RULES: Do not include flowers, fruit, plants, petals, spices or food objects. No text other than the clean label. "
                    "Photorealistic 8k architectural product still life, Vogue editorial quality."
                )

                headers = {
                    'Authorization': f'Bearer {OPENAI_API_KEY}',
                    'Content-Type': 'application/json'
                }

                res = requests.post(
                    'https://api.openai.com/v1/images/generations',
                    headers=headers,
                    json={
                        'model': 'dall-e-3',
                        'prompt': prompt,
                        'n': 1,
                        'size': '1024x1024',
                        'quality': 'standard'
                    },
                    timeout=3.5
                )

                if res.status_code == 200:
                    dalle_url = res.json()['data'][0]['url']
                    # Download image locally
                    img_resp = requests.get(dalle_url, timeout=15)
                    if img_resp.status_code == 200:
                        hash_id = hashlib.md5(perfume_name.encode()).hexdigest()[:10]
                        filename = f"dalle_{hash_id}.png"
                        local_path = os.path.join(GENERATED_DIR, filename)
                        with open(local_path, 'wb') as f:
                            f.write(img_resp.content)
                        image_url = f"assets/images/generated/{filename}"
                        provider = 'dall-e-3'
                else:
                    err_json = res.json().get('error', {})
                    err_code = err_json.get('code', '')
                    if err_code == 'credit_balance_exhausted' or res.status_code == 429:
                        OPENAI_QUOTA_EXHAUSTED = True
                        notice = 'OpenAI image generation credits exhausted. Created bespoke high-definition concept via NOOR Atelier Studio.'
                    else:
                        notice = f"DALL-E 3 error: {err_json.get('message')}"
            except Exception as e:
                notice = f"DALL-E 3 call failed: {str(e)}"

        if not image_url:
            image_url = create_bespoke_product_image(scent_data, prefs)

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({
            'ok': True,
            'imageUrl': image_url,
            'provider': provider,
            'notice': notice
        }).encode())

    def handle_chat(self, req_data):
        """Conversational Concierge AI Chatbot with full NOOR website knowledge."""
        global OPENAI_QUOTA_EXHAUSTED
        user_msg = req_data.get('message', '').strip()
        history = req_data.get('history', [])

        bot_reply = None
        provider = 'concierge_engine'

        if OPENAI_API_KEY and not OPENAI_QUOTA_EXHAUSTED and user_msg:
            try:
                system_prompt = (
                    "You are NOOR Atelier Concierge, an eloquent and knowledgeable luxury fragrance advisor for NOOR — Beyond Scent. "
                    "Your tone is polite, refined, poetic yet precise, like a boutique director on Place Vendôme or in Kannauj. "
                    f"You have complete knowledge of NOOR: \n{NOOR_KNOWLEDGE}\n"
                    "Help visitors discover fragrances, learn about the Indian Heritage Quadrant (Kasturi, Mitti, Mysore Sandalwood, Mogra), "
                    "understand our 20-perfume compendium, and guide them to 'Create Your Signature Scent'. "
                    "Keep answers concise (2-4 sentences or short bullet points), elegant, and helpful."
                )

                messages = [{'role': 'system', 'content': system_prompt}]
                for h in history[-6:]:
                    messages.append({'role': h.get('role', 'user'), 'content': h.get('content', '')})
                messages.append({'role': 'user', 'content': user_msg})

                headers = {
                    'Authorization': f'Bearer {OPENAI_API_KEY}',
                    'Content-Type': 'application/json'
                }

                res = requests.post(
                    'https://api.openai.com/v1/chat/completions',
                    headers=headers,
                    json={
                        'model': 'gpt-4o-mini',
                        'messages': messages,
                        'temperature': 0.7,
                        'max_tokens': 350
                    },
                    timeout=3.0
                )

                if res.status_code == 200:
                    data = res.json()
                    bot_reply = data['choices'][0]['message']['content']
                    provider = 'openai'
                elif res.status_code == 429:
                    OPENAI_QUOTA_EXHAUSTED = True
            except Exception:
                pass

        if not bot_reply:
            # Contextual local concierge response engine
            lower = user_msg.lower()
            if any(k in lower for k in ['mitti', 'rain', 'monsoon', 'earth', 'petrichor']):
                bot_reply = (
                    "Mitti Attar (02 · Rain Whisper) captures the primordial aroma of sun-baked earth drinking the first droplet of monsoon rain. "
                    "It is distilled in Kannauj using hydro-distillation in copper stills directly into aged sandalwood oil. "
                    "Notes include wet river stone, baked terracotta, and damp vetiver."
                )
            elif any(k in lower for k in ['kasturi', 'musk', 'midnight', 'dark']):
                bot_reply = (
                    "Kasturi Attar (01 · Midnight Musk) is our deepest nocturnal composition. Inspired by sacred Indian attars, "
                    "it weaves smoked bergamot and wild saffron into sacred botanical musk, dark patchouli, and aged oud. "
                    "It warms intimately to your pulse points over twelve hours."
                )
            elif any(k in lower for k in ['sandal', 'mysore', 'wood']):
                bot_reply = (
                    "Mysore Sandalwood (03 · Sandal Glow) celebrates pure Santalum album heartwood smoothed by decades. "
                    "It offers a buttery, meditative warmth enriched with liquid amber crystals and sacred temple woods. "
                    "A timeless, grounding fragrance of serenity."
                )
            elif any(k in lower for k in ['mogra', 'jasmine', 'white petal', 'floral']):
                bot_reply = (
                    "Mogra Attar (04 · White Petal) features Arabian Jasmine sambac hand-picked before sunrise. "
                    "Floating in cool marble basins, it radiates a delicate luminescence like silver silk on the skin, "
                    "supported by translucent magnolia and sheer cashmere musks."
                )
            elif any(k in lower for k in ['create', 'custom', 'bespoke', 'signature']):
                bot_reply = (
                    "You can design your own bespoke fragrance right here in our Atelier! Scroll to the 'Create Your Signature Scent' section, "
                    "choose your mood, scent character, visual palette, and bottle silhouette. Our AI will weave an exclusive perfume identity "
                    "and reveal a photorealistic flacon and keepsake box crafted just for you."
                )
            elif any(k in lower for k in ['price', 'cost', 'buy', 'purchase']):
                bot_reply = (
                    "Our 50ml Eau de Parfum flacons range from ₹12,500 to ₹19,500. We also offer a Discovery Quad at ₹3,500 "
                    "allowing you to experience all four Heritage Quadrant masterworks in 10ml travel flacons."
                )
            elif any(k in lower for k in ['kannauj', 'distill', 'heritage', 'india']):
                bot_reply = (
                    "Kannauj is India's perfume capital, preserving unbroken centuries of Deg and Bhapka hydro-distillation. "
                    "Flowers, clay, and botanicals are gently steamed in copper pots over wood fires, with delicate aromatic vapours "
                    "condensing into receiver vessels containing pure sandalwood base oil."
                )
            else:
                bot_reply = (
                    f"Welcome to NOOR — Beyond Scent. I am your Atelier Concierge. "
                    "I can guide you through our 4 Indian Heritage worlds (Kasturi, Mitti, Sandalwood, Mogra), "
                    "help you explore our 20-perfume compendium, or assist you in creating your personal signature scent."
                )

        self.send_response(200)
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps({
            'ok': True,
            'reply': bot_reply,
            'provider': provider
        }).encode())

def run_server():
    server_address = ('', PORT)
    httpd = HTTPServer(server_address, NoorStudioHandler)
    print(f"NOOR Server running on http://localhost:{PORT}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server...")
        httpd.server_close()

if __name__ == '__main__':
    run_server()

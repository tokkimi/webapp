"""
Moonlings Animation Script
==========================
Generates animated MP4 episodes from static PNG character images and backgrounds.

Usage (Google Colab or local):
    pip install Pillow imageio imageio-ffmpeg
    python animate.py --episode 1 --fps 24 --output output/

Requirements:
    assets/characters/mochi.png  (transparent background PNG)
    assets/characters/piri.png
    assets/characters/pofu.png
    assets/characters/zumu.png
    assets/characters/gizo.png
    assets/backgrounds/lac_etoile.png
    assets/backgrounds/foret_lucioles.png
    assets/backgrounds/village.png
    assets/backgrounds/colline_etoiles.png
    assets/backgrounds/riviere_argentee.png
    assets/backgrounds/maison_mochi.png
"""

import argparse
import os
import math
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
    PIL_OK = True
except ImportError:
    print("Installing Pillow...")
    os.system("pip install Pillow -q")
    from PIL import Image, ImageDraw, ImageFont
    PIL_OK = True

try:
    import imageio
    IMAGEIO_OK = True
except ImportError:
    print("Installing imageio...")
    os.system("pip install imageio imageio-ffmpeg -q")
    import imageio
    IMAGEIO_OK = True

import numpy as np

# ─── Configuration ─────────────────────────────────────────────────────────────

CANVAS_W = 1280
CANVAS_H = 720
CHAR_SIZE = 220        # px — character height on screen
DURATION_PER_SCENE = 4  # seconds per scene
TRANSITION_FRAMES = 12  # fade frames between scenes

CHAR_COLORS = {
    "mochi":  "#F5E6C8",
    "piri":   "#FFD700",
    "pofu":   "#E8EDF2",
    "zumu":   "#5BB8F5",
    "gizo":   "#7ED4A4",
}

LOCATION_MAP = {
    "Maison de Mochi":      "maison_mochi",
    "Lac Étoilé":           "lac_etoile",
    "Forêt des Lucioles":   "foret_lucioles",
    "Colline des Étoiles":  "colline_etoiles",
    "Village des Moonlings":"village",
    "Rivière Argentée":     "riviere_argentee",
    "Rivière des Rêves":    "riviere_argentee",
    "Jardin de Mochi":      "maison_mochi",
    "Atelier de Gizo":      "village",
    "Forêt inconnue":       "foret_lucioles",
    "Grande place":         "village",
    "Cœur de la Forêt":     "foret_lucioles",
    "Dans le ciel":         "colline_etoiles",
    "Derrière l'arbre":     "village",
    "Piste de course":      "village",
    "Clairière secrète":    "foret_lucioles",
    "Rive du Lac":          "lac_etoile",
    "Centre du Lac":        "lac_etoile",
    "Lisière de la Forêt des Lucioles": "foret_lucioles",
    "Coin tranquille du Village": "village",
    "Village des Moonlings rénové": "village",
    "Buisson d'étoiles":    "lac_etoile",
    "Chemin du Lac":        "lac_etoile",
    "Chemin du Lac Étoilé": "lac_etoile",
}

# ─── Episode Data (embed a few for standalone testing) ─────────────────────────

EPISODES_EMBEDDED = {
    1: {
        "title": "La Première Étoile",
        "moral": "La gentillesse fait briller quelque chose en nous.",
        "scenes": [
            {"scene": 1, "title": "Un matin spécial", "location": "Maison de Mochi",
             "characters": ["mochi"],
             "action": "Mochi se réveille et remarque que son étoile dorée ne brille pas.",
             "dialogue": [
                 {"character": "Mochi", "text": "Oh… mon étoile est toute terne aujourd'hui !"},
                 {"character": "Mochi", "text": "Je dois faire quelque chose de spécial !"},
             ]},
            {"scene": 2, "title": "La rencontre", "location": "Chemin du Lac Étoilé",
             "characters": ["mochi", "piri"],
             "action": "Mochi croise Piri coincée dans un buisson d'étoiles.",
             "dialogue": [
                 {"character": "Piri", "text": "Au secours ! Mes pointes sont coincées !"},
                 {"character": "Mochi", "text": "Ne t'inquiète pas, Piri ! Je vais t'aider !"},
             ]},
            {"scene": 3, "title": "L'aide précieuse", "location": "Lac Étoilé",
             "characters": ["mochi", "piri"],
             "action": "Mochi dégage doucement Piri des branches.",
             "dialogue": [
                 {"character": "Mochi", "text": "Doucement… doucement… voilà ! Tu es libre !"},
                 {"character": "Piri", "text": "Oh merci Mochi ! Tu es tellement gentil !"},
             ]},
            {"scene": 4, "title": "L'étoile brille !", "location": "Lac Étoilé",
             "characters": ["mochi", "piri"],
             "action": "L'étoile de Mochi se met à briller d'une lumière douce.",
             "dialogue": [
                 {"character": "Piri", "text": "Mochi ! Ton étoile… elle brille !"},
                 {"character": "Mochi", "text": "La gentillesse fait briller l'étoile !"},
             ]},
            {"scene": 5, "title": "Ensemble sous les étoiles", "location": "Lac Étoilé",
             "characters": ["mochi", "piri"],
             "action": "Mochi et Piri s'assoient au bord du lac.",
             "dialogue": [
                 {"character": "Mochi", "text": "Tu veux être mon amie ?"},
                 {"character": "Piri", "text": "C'est le plus beau jour de ma vie !"},
             ]},
        ]
    }
}

# ─── Helpers ───────────────────────────────────────────────────────────────────

def hex_to_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def load_image(path, size=None):
    """Load PNG with transparency; resize if needed."""
    if not os.path.exists(path):
        return None
    img = Image.open(path).convert("RGBA")
    if size:
        img = img.resize(size, Image.LANCZOS)
    return img


def create_placeholder_bg(location, w=CANVAS_W, h=CANVAS_H):
    """Create a colored gradient background when no PNG is available."""
    colors = {
        "lac_etoile":        ("#0a1040", "#1a3080"),
        "foret_lucioles":    ("#051505", "#0d3010"),
        "village":           ("#1a0a30", "#2a1050"),
        "colline_etoiles":   ("#050515", "#150530"),
        "riviere_argentee":  ("#0a1530", "#1a3050"),
        "maison_mochi":      ("#200820", "#401040"),
    }
    top, bot = colors.get(location, ("#0a0520", "#1a0a40"))
    img = Image.new("RGB", (w, h))
    draw = ImageDraw.Draw(img)
    t = hex_to_rgb(top)
    b = hex_to_rgb(bot)
    for y in range(h):
        r = t[0] + int((b[0] - t[0]) * y / h)
        g = t[1] + int((b[1] - t[1]) * y / h)
        bl = t[2] + int((b[2] - t[2]) * y / h)
        draw.line([(0, y), (w, y)], fill=(r, g, bl))
    # Draw some stars
    import random
    rng = random.Random(42)
    for _ in range(80):
        x = rng.randint(0, w)
        y = rng.randint(0, h // 2)
        r2 = rng.randint(1, 3)
        bright = rng.randint(180, 255)
        draw.ellipse([x-r2, y-r2, x+r2, y+r2], fill=(bright, bright, bright))
    return img.convert("RGBA")


def create_placeholder_char(name, size=CHAR_SIZE):
    """Create a colored circle placeholder when no character PNG is available."""
    color = hex_to_rgb(CHAR_COLORS.get(name, "#FFFFFF"))
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    margin = 10
    draw.ellipse([margin, margin, size-margin, size-margin],
                 fill=(*color, 220), outline=(255, 255, 255, 150), width=3)
    # Eyes
    eye_y = size // 2 - size // 10
    for ex in [size//3, 2*size//3]:
        ew = size // 10
        draw.ellipse([ex-ew, eye_y-ew, ex+ew, eye_y+ew], fill=(30, 30, 60, 255))
    # Smile
    sm_x1, sm_y1 = size//3, size//2 + size//12
    sm_x2, sm_y2 = 2*size//3, size//2 + size//5
    draw.arc([sm_x1, sm_y1, sm_x2, sm_y2], start=0, end=180, fill=(80, 30, 30, 200), width=3)
    # Name
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size//8)
    except Exception:
        font = ImageFont.load_default()
    draw.text((size//2, size - size//6), name.upper(), fill=(255,255,255,200),
              font=font, anchor="mm")
    return img


def get_bg(location_name, assets_dir):
    key = LOCATION_MAP.get(location_name, "village")
    path = os.path.join(assets_dir, "backgrounds", f"{key}.png")
    img = load_image(path, (CANVAS_W, CANVAS_H))
    if img is None:
        img = create_placeholder_bg(key)
    return img


def get_char(name, assets_dir):
    path = os.path.join(assets_dir, "characters", f"{name}.png")
    img = load_image(path)
    if img is None:
        img = create_placeholder_char(name)
    # Resize keeping aspect ratio so height = CHAR_SIZE
    w, h = img.size
    new_w = int(w * CHAR_SIZE / h)
    img = img.resize((new_w, CHAR_SIZE), Image.LANCZOS)
    return img


def draw_subtitle(canvas, text, char_name):
    """Draw subtitle box at the bottom of the canvas."""
    draw = ImageDraw.Draw(canvas)
    w, h = canvas.size
    padding = 16
    box_h = 80

    # Semi-transparent black bar
    overlay = Image.new("RGBA", (w, box_h), (0, 0, 0, 0))
    bar = ImageDraw.Draw(overlay)
    bar.rectangle([0, 0, w, box_h], fill=(0, 0, 10, 180))
    canvas.alpha_composite(overlay, (0, h - box_h))

    draw = ImageDraw.Draw(canvas)
    color = hex_to_rgb(CHAR_COLORS.get(char_name.lower(), "#FFD700"))

    try:
        font_name = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 18)
        font_text = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 22)
    except Exception:
        font_name = font_text = ImageFont.load_default()

    draw.text((padding, h - box_h + 10), char_name.upper() + ":", fill=(*color, 255), font=font_name)
    # Wrap text
    max_chars = 80
    lines = []
    words = text.split()
    line = ""
    for word in words:
        if len(line + " " + word) > max_chars:
            lines.append(line)
            line = word
        else:
            line = (line + " " + word).strip()
    if line:
        lines.append(line)
    for i, l in enumerate(lines[:2]):
        draw.text((padding, h - box_h + 36 + i * 26), l, fill=(255, 255, 255, 255), font=font_text)


def apply_bounce(char_img, frame, total_frames, amplitude=8):
    """Apply a gentle vertical bounce to the character image."""
    t = frame / max(total_frames - 1, 1)
    offset = int(amplitude * math.sin(t * math.pi * 2))
    return char_img, offset


def composite_scene(bg, characters_on_scene, assets_dir, frame, total_frames, dialogue):
    """Composite one frame of a scene."""
    canvas = bg.copy()

    n = len(characters_on_scene)
    for i, char_name in enumerate(characters_on_scene):
        char_img = get_char(char_name, assets_dir)
        cw, ch = char_img.size

        # Horizontal spread
        if n == 1:
            cx = (CANVAS_W - cw) // 2
        else:
            spacing = CANVAS_W // (n + 1)
            cx = spacing * (i + 1) - cw // 2

        # Vertical — bottom anchored with bounce
        _, bounce = apply_bounce(char_img, frame, total_frames)
        cy = CANVAS_H - ch - 80 + bounce

        canvas.alpha_composite(char_img, (max(0, cx), max(0, cy)))

    # Subtitle
    if dialogue:
        draw_subtitle(canvas, dialogue["text"], dialogue["character"])

    return canvas


def fade_frames(frame_a, frame_b, n=TRANSITION_FRAMES):
    """Yield n blended frames transitioning from A to B."""
    a = np.array(frame_a.convert("RGB"))
    b = np.array(frame_b.convert("RGB"))
    for i in range(n):
        t = i / n
        blended = (a * (1 - t) + b * t).astype(np.uint8)
        yield Image.fromarray(blended)


def render_episode(episode_data, assets_dir, fps, output_dir, ep_num):
    """Render all scenes of an episode to an MP4 file."""
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, f"EP{ep_num:02d}_{episode_data['title'].replace(' ', '_')}.mp4")

    frames_per_scene = fps * DURATION_PER_SCENE
    all_frames = []

    print(f"\n🎬 Rendu de l'épisode {ep_num} : {episode_data['title']}")
    print(f"   {len(episode_data['scenes'])} scènes · {fps} fps · {DURATION_PER_SCENE}s/scène")

    for scene_idx, scene in enumerate(episode_data["scenes"]):
        print(f"   Scène {scene['scene']}: {scene['title']} ({scene['location']})")
        bg = get_bg(scene["location"], assets_dir)
        chars = scene.get("characters", ["mochi"])
        dialogues = scene.get("dialogue", [])

        scene_frames = []
        for f in range(frames_per_scene):
            # Cycle through dialogue lines across the scene duration
            if dialogues:
                di = int(f / frames_per_scene * len(dialogues))
                di = min(di, len(dialogues) - 1)
                dlg = dialogues[di]
            else:
                dlg = None
            frame_img = composite_scene(bg, chars, assets_dir, f, frames_per_scene, dlg)
            scene_frames.append(frame_img)

        # Add transition from previous scene
        if all_frames and scene_frames:
            for blended in fade_frames(all_frames[-1], scene_frames[0]):
                all_frames.append(blended)

        all_frames.extend(scene_frames)

    # Write MP4
    print(f"   Encodage MP4 → {output_path}")
    writer = imageio.get_writer(output_path, fps=fps, codec="libx264",
                                 quality=8, pixelformat="yuv420p")
    for frame in all_frames:
        writer.append_data(np.array(frame.convert("RGB")))
    writer.close()
    print(f"   ✅ Terminé : {output_path}")
    return output_path


# ─── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Moonlings Animation Generator")
    parser.add_argument("--episode", type=int, default=1, help="Episode number to render (default: 1)")
    parser.add_argument("--fps", type=int, default=24, help="Frames per second (default: 24)")
    parser.add_argument("--output", default="output", help="Output directory (default: output/)")
    parser.add_argument("--assets", default="assets", help="Assets directory (default: assets/)")
    parser.add_argument("--all", action="store_true", help="Render all embedded episodes")
    args = parser.parse_args()

    assets_dir = args.assets

    if args.all:
        for ep_num, ep_data in EPISODES_EMBEDDED.items():
            render_episode(ep_data, assets_dir, args.fps, args.output, ep_num)
    else:
        ep_num = args.episode
        if ep_num not in EPISODES_EMBEDDED:
            print(f"⚠️  Épisode {ep_num} non trouvé dans les données embarquées.")
            print(f"   Disponibles: {list(EPISODES_EMBEDDED.keys())}")
            return
        render_episode(EPISODES_EMBEDDED[ep_num], assets_dir, args.fps, args.output, ep_num)


if __name__ == "__main__":
    main()

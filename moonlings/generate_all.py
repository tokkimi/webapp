"""
Moonlings — Générateur de tous les épisodes en MP4
Lit episodes.js et génère un MP4 par épisode avec visuels placeholder.
"""
import os, re, json, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import imageio

CANVAS_W, CANVAS_H = 1280, 720
FPS = 24
DURATION_PER_SCENE = 5   # secondes
TRANSITION_FRAMES = 10

CHAR_COLORS = {
    "mochi": ("#f5e6c8", "#d4a855"),
    "piri":  ("#ffd700", "#e8a020"),
    "pofu":  ("#dce9f0", "#7fbfd4"),
    "zumu":  ("#5bb8f5", "#2a7fc1"),
    "gizo":  ("#7ed4a4", "#3d9b6e"),
}
CHAR_EMOJI = {"mochi": "🌙", "piri": "⭐", "pofu": "☁️", "zumu": "💫", "gizo": "🔧"}

BG_COLORS = {
    "lac":      ("#061228", "#0d2a5a"),
    "foret":    ("#040e04", "#0a2010"),
    "village":  ("#120520", "#25103c"),
    "colline":  ("#040408", "#100424"),
    "riviere":  ("#061020", "#123048"),
    "maison":   ("#1a0618", "#30103a"),
}

LOCATION_MAP = {
    "Lac Étoilé": "lac", "Maison de Mochi": "maison", "Forêt des Lucioles": "foret",
    "Colline des Étoiles": "colline", "Village des Moonlings": "village",
    "Rivière Argentée": "riviere", "Rivière des Rêves": "riviere",
    "Jardin de Mochi": "maison", "Atelier de Gizo": "village",
    "Forêt inconnue": "foret", "Grande place": "village",
    "Cœur de la Forêt": "foret", "Dans le ciel": "colline",
    "Derrière l'arbre": "village", "Piste de course": "village",
    "Clairière secrète": "foret", "Rive du Lac": "lac",
    "Centre du Lac": "lac", "Lisière de la Forêt des Lucioles": "foret",
    "Coin tranquille du Village": "village",
    "Village des Moonlings rénové": "village",
    "Buisson d'étoiles": "lac", "Chemin du Lac Étoilé": "lac",
    "Chemin du Lac": "lac",
}

try:
    FONT_BOLD = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 28)
    FONT_REGULAR = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
    FONT_SMALL = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 18)
    FONT_TITLE = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 42)
except Exception:
    FONT_BOLD = FONT_REGULAR = FONT_SMALL = FONT_TITLE = ImageFont.load_default()


def hex_rgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def make_bg(location, stars_seed=0):
    key = LOCATION_MAP.get(location, "village")
    top, bot = BG_COLORS.get(key, ("#0a0520", "#1a0a40"))
    t, b = hex_rgb(top), hex_rgb(bot)
    img = Image.new("RGB", (CANVAS_W, CANVAS_H))
    draw = ImageDraw.Draw(img)
    for y in range(CANVAS_H):
        r = int(t[0] + (b[0]-t[0]) * y/CANVAS_H)
        g = int(t[1] + (b[1]-t[1]) * y/CANVAS_H)
        bl = int(t[2] + (b[2]-t[2]) * y/CANVAS_H)
        draw.line([(0,y),(CANVAS_W,y)], fill=(r,g,bl))
    rng = np.random.default_rng(stars_seed)
    n_stars = 120
    xs = rng.integers(0, CANVAS_W, n_stars)
    ys = rng.integers(0, CANVAS_H*6//10, n_stars)
    for x, y in zip(xs, ys):
        bright = rng.integers(160, 255)
        sz = rng.integers(1, 3)
        draw.ellipse([x-sz, y-sz, x+sz, y+sz], fill=(bright, bright, bright))
    # Lune
    moon_x, moon_y = CANVAS_W - 130, 80
    draw.ellipse([moon_x-45, moon_y-45, moon_x+45, moon_y+45], fill=(255,240,180))
    draw.ellipse([moon_x+12, moon_y-38, moon_x+58, moon_y+38], fill=t)  # crescent cutout
    return img.convert("RGBA")


def make_char(name, size=200, bounce=0):
    fill, outline = CHAR_COLORS.get(name, ("#cccccc", "#aaaaaa"))
    fc = hex_rgb(fill)
    oc = hex_rgb(outline)
    img = Image.new("RGBA", (size, size+bounce*2), (0,0,0,0))
    draw = ImageDraw.Draw(img)
    m = 12
    y_off = bounce
    # Body
    draw.ellipse([m, m+y_off, size-m, size-m+y_off], fill=(*fc, 230), outline=(*oc, 255), width=4)
    # Glow
    glow = Image.new("RGBA", (size, size+bounce*2), (0,0,0,0))
    gd = ImageDraw.Draw(glow)
    for expand in range(15, 0, -3):
        alpha = int(30 * expand / 15)
        gd.ellipse([m-expand, m-expand+y_off, size-m+expand, size-m+expand+y_off],
                   fill=(*fc, alpha))
    img = Image.alpha_composite(glow, img)
    draw = ImageDraw.Draw(img)
    # Eyes
    ey = m + (size-2*m)*2//5 + y_off
    for ex in [size//3, 2*size//3]:
        ew = size//9
        draw.ellipse([ex-ew, ey-ew, ex+ew, ey+ew], fill=(20,20,50,255))
        draw.ellipse([ex-ew//3, ey-ew//2, ex, ey-ew//6], fill=(255,255,255,200))
    # Cheeks
    ck_y = ey + size//8
    for ck_x in [size//4, 3*size//4]:
        draw.ellipse([ck_x-14, ck_y-7, ck_x+14, ck_y+7], fill=(255,120,120,100))
    # Smile
    sm = size//4
    draw.arc([sm, ey+size//10, size-sm, ey+size//4+y_off], start=0, end=180, fill=(80,30,30,200), width=3)
    # Special details
    if name == "mochi":
        star_cx, star_cy = size//2, size*2//3+y_off
        star_pts = [(star_cx+int(18*math.cos(math.radians(a-90))),
                     star_cy+int(18*math.sin(math.radians(a-90)))) for a in range(0,360,72)]
        inner = [(star_cx+int(8*math.cos(math.radians(a-90))),
                  star_cy+int(8*math.sin(math.radians(a-90)))) for a in range(36,396,72)]
        pts = [p for pair in zip(star_pts, inner) for p in pair]
        draw.polygon(pts, fill=(255,215,0,200))
    elif name == "piri":
        pts = []
        for a in range(0, 360, 72):
            pts.append((size//2+int((size//2-m)*math.cos(math.radians(a-90))),
                        size//2+int((size//2-m)*math.sin(math.radians(a-90)))+y_off))
            pts.append((size//2+int((size//4)*math.cos(math.radians(a-54))),
                        size//2+int((size//4)*math.sin(math.radians(a-54)))+y_off))
    elif name == "zumu":
        tail_pts = [(size-m, size//2+y_off), (size+30, size//4+y_off),
                    (size+60, size//2+y_off), (size+30, size*3//4+y_off)]
        draw.polygon(tail_pts, fill=(*hex_rgb("#aaddff"), 180))
    elif name == "pofu":
        for bx, by_ in [(size//4, m+y_off), (size//2, m-8+y_off), (3*size//4, m+y_off)]:
            draw.ellipse([bx-16, by_-12, bx+16, by_+12], fill=(*fc, 180))
    elif name == "gizo":
        for gx in [m+4, size-m-4]:
            for gy_offset in [-1, 1]:
                gcy = size//3 + gy_offset*(size//6) + y_off
                draw.rectangle([gx-5, gcy-12, gx+5, gcy+12], fill=(*oc, 200))
    # Name label
    draw.text((size//2, size-m+y_off), name.upper(), fill=(*oc, 220), font=FONT_SMALL, anchor="mm")
    return img


def wrap_text(text, max_chars=55):
    words = text.split()
    lines, line = [], ""
    for w in words:
        if len(line+" "+w) > max_chars:
            if line: lines.append(line)
            line = w
        else:
            line = (line+" "+w).strip()
    if line: lines.append(line)
    return lines[:3]


def draw_subtitle(canvas, char_name, text):
    w, h = canvas.size
    bar_h = 100
    bar = Image.new("RGBA", (w, bar_h), (0, 0, 12, 200))
    canvas.alpha_composite(bar, (0, h-bar_h))
    draw = ImageDraw.Draw(canvas)
    fill_c, _ = CHAR_COLORS.get(char_name.lower(), ("#ffd700", "#ffa500"))
    fc = hex_rgb(fill_c)
    draw.text((20, h-bar_h+12), char_name.upper()+" :", fill=(*fc, 255), font=FONT_BOLD)
    lines = wrap_text(text)
    for i, ln in enumerate(lines):
        draw.text((20, h-bar_h+44+i*26), ln, fill=(255,255,255,255), font=FONT_REGULAR)


def make_title_card(ep_num, title, moral):
    img = make_bg("Lac Étoilé", stars_seed=ep_num*7)
    draw = ImageDraw.Draw(img)
    # Gradient overlay
    overlay = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0,0,0,0))
    od = ImageDraw.Draw(overlay)
    od.rectangle([0,0,CANVAS_W, CANVAS_H], fill=(0,0,20,140))
    img.alpha_composite(overlay)
    draw = ImageDraw.Draw(img)
    # Episode number
    draw.text((CANVAS_W//2, 180), f"ÉPISODE {ep_num:02d}", fill=(200,160,80,255),
              font=FONT_SMALL, anchor="mm")
    # Title
    font_big = FONT_TITLE
    draw.text((CANVAS_W//2+2, 242), title, fill=(80,40,0,180), font=font_big, anchor="mm")
    draw.text((CANVAS_W//2, 240), title, fill=(255,220,80,255), font=font_big, anchor="mm")
    # Moral
    lines = wrap_text(moral, max_chars=60)
    for i, ln in enumerate(lines):
        draw.text((CANVAS_W//2, 340+i*32), ln, fill=(180,200,255,200), font=FONT_REGULAR, anchor="mm")
    # Moonlings logo
    draw.text((CANVAS_W//2, CANVAS_H-60), "✦ MOONLINGS ✦", fill=(255,215,0,180), font=FONT_BOLD, anchor="mm")
    return img


def render_episode(ep, output_dir):
    ep_num = ep.get("id", ep.get("episodeNumber", 1))
    title  = ep.get("title", f"Épisode {ep_num}")
    moral  = ep.get("moral", "")
    scenes = ep.get("scenes", [])
    season = ep.get("season", 1)

    safe_title = re.sub(r'[^\w\s-]', '', title).strip().replace(' ', '_')
    out_path = os.path.join(output_dir, f"S{season}_EP{ep_num:02d}_{safe_title}.mp4")

    print(f"\n🎬 EP{ep_num:02d} — {title}")

    frames_per_scene = FPS * DURATION_PER_SCENE
    all_frames = []

    # Title card (3s)
    title_img = make_title_card(ep_num, title, moral)
    for _ in range(FPS * 3):
        all_frames.append(np.array(title_img.convert("RGB")))

    prev_last = title_img
    for sc in scenes:
        location = sc.get("location", "Village des Moonlings")
        chars = [c.lower() for c in sc.get("characters", ["mochi"])]
        dialogues = sc.get("dialogue", [])
        bg = make_bg(location, stars_seed=hash(location) % 1000)

        print(f"   Scène {sc.get('scene', sc.get('id','?'))}: {sc.get('title', location)} ({location})")

        scene_frames = []
        for f in range(frames_per_scene):
            canvas = bg.copy()
            t_norm = f / frames_per_scene

            # Bounce offset
            bounce_offset = int(6 * math.sin(t_norm * math.pi * 3))

            n = len(chars)
            for i, cname in enumerate(chars):
                char_size = 200
                ch_img = make_char(cname, char_size)
                cw, ch_ = ch_img.size
                if n == 1:
                    cx = (CANVAS_W - cw) // 2
                elif n == 2:
                    cx = [CANVAS_W//4 - cw//2, 3*CANVAS_W//4 - cw//2][i]
                else:
                    cx = int(CANVAS_W * (i+1) / (n+1)) - cw//2
                cy = CANVAS_H - ch_ - 90 + bounce_offset
                canvas.alpha_composite(ch_img, (max(0, cx), max(0, cy)))

            # Subtitle
            if dialogues:
                di = min(int(t_norm * len(dialogues)), len(dialogues)-1)
                dlg = dialogues[di]
                draw_subtitle(canvas, dlg.get("character","?"), dlg.get("text",""))

            scene_frames.append(canvas)

        # Fade transition
        if all_frames and scene_frames:
            a_arr = np.array(prev_last.convert("RGB"))
            b_arr = np.array(scene_frames[0].convert("RGB"))
            for fi in range(TRANSITION_FRAMES):
                t_ = fi / TRANSITION_FRAMES
                blended = (a_arr*(1-t_) + b_arr*t_).astype(np.uint8)
                all_frames.append(blended)

        for fr in scene_frames:
            all_frames.append(np.array(fr.convert("RGB")))
        prev_last = scene_frames[-1]

    # End card (2s)
    end = make_title_card(ep_num, "Fin ✦", moral)
    for _ in range(FPS * 2):
        all_frames.append(np.array(end.convert("RGB")))

    os.makedirs(output_dir, exist_ok=True)
    print(f"   Encodage → {out_path}")
    writer = imageio.get_writer(out_path, fps=FPS, codec="libx264",
                                quality=7, pixelformat="yuv420p")
    for frame in all_frames:
        writer.append_data(frame)
    writer.close()
    size_mb = os.path.getsize(out_path) / 1024 / 1024
    print(f"   ✅ {size_mb:.1f} MB")
    return out_path


def parse_episodes_js(js_path):
    with open(js_path) as f:
        content = f.read()
    # Strip JS var declaration
    content = re.sub(r'^var\s+\w+\s*=\s*', '', content.strip()).rstrip(';')

    # Parse field by field — extract each episode block
    episodes = []
    # Use a simple regex-based extraction
    # Find all top-level episode objects
    ep_matches = list(re.finditer(r'\{\s*id:\s*(\d+),\s*season:\s*(\d+),\s*episodeNumber:\s*(\d+),', content))
    for idx, m in enumerate(ep_matches):
        start = m.start()
        end = ep_matches[idx+1].start() if idx+1 < len(ep_matches) else len(content)
        block = content[start:end].rstrip(',\n ')

        ep = {
            "id": int(m.group(1)),
            "season": int(m.group(2)),
            "episodeNumber": int(m.group(3)),
        }

        title_m = re.search(r'title:\s*"([^"]*)"', block)
        if title_m: ep["title"] = title_m.group(1)

        moral_m = re.search(r'moral:\s*"([^"]*)"', block)
        if moral_m: ep["moral"] = moral_m.group(1)

        summary_m = re.search(r'summary:\s*"([^"]*)"', block)
        if summary_m: ep["summary"] = summary_m.group(1)

        # Extract characters array
        char_m = re.search(r'characters:\s*\[([^\]]*)\]', block)
        if char_m:
            ep["characters"] = [c.strip().strip('"') for c in char_m.group(1).split(',') if c.strip()]

        # Extract scenes — supports id: "1-1" or id: "scene_1" or no id
        scenes = []
        # Find scene objects within the scenes: [...] block
        scenes_m = re.search(r'scenes:\s*\[(.+)\]\s*(?=\})', block, re.DOTALL)
        if not scenes_m:
            scenes_m = re.search(r'scenes:\s*\[(.*)', block, re.DOTALL)
        scenes_content = scenes_m.group(1) if scenes_m else ""

        # Split into individual scene blocks by finding opening braces
        # Simple approach: find each dialogue block set
        scene_splits = re.split(r'(?=\{\s*(?:id:|location:))', scenes_content)
        scene_idx = 0
        for sb in scene_splits:
            sb = sb.strip().rstrip(',')
            if not sb or 'location:' not in sb:
                continue
            scene_idx += 1
            scene = {"scene": scene_idx}

            # Try to get id number
            id_m = re.search(r'id:\s*"[^"]*?(\d+)"', sb)
            if id_m: scene["scene"] = int(id_m.group(1)) or scene_idx
            loc_m = re.search(r'location:\s*"([^"]*)"', sb)
            if loc_m: scene["location"] = loc_m.group(1)
            act_m = re.search(r'action:\s*"([^"]*)"', sb)
            if act_m: scene["action"] = act_m.group(1)

            chars_m = re.search(r'characters:\s*\[([^\]]*)\]', sb)
            if chars_m:
                scene["characters"] = [c.strip().strip('"') for c in chars_m.group(1).split(',') if c.strip()]

            dlg_matches = re.finditer(r'\{\s*character:\s*"([^"]+)",\s*text:\s*"([^"]+)"\s*\}', sb)
            scene["dialogue"] = [{"character": d.group(1), "text": d.group(2)} for d in dlg_matches]

            scenes.append(scene)

        ep["scenes"] = scenes
        episodes.append(ep)

    return episodes


if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", default="output")
    parser.add_argument("--episodes", default="data/episodes.js")
    parser.add_argument("--season", type=int, default=0, help="0=all, 1=S1, 2=S2")
    args = parser.parse_args()

    print("📖 Lecture des épisodes...")
    episodes = parse_episodes_js(args.episodes)
    print(f"   {len(episodes)} épisodes trouvés")

    if args.season:
        episodes = [e for e in episodes if e.get("season") == args.season]
        print(f"   Filtrage Saison {args.season} : {len(episodes)} épisodes")

    generated = []
    for ep in episodes:
        path = render_episode(ep, args.output)
        generated.append(path)

    print(f"\n✅ {len(generated)} vidéos générées dans '{args.output}/'")
    for p in generated:
        size = os.path.getsize(p)/1024/1024
        print(f"   {os.path.basename(p)} — {size:.1f} MB")

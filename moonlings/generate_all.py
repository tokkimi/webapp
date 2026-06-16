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
    "cafe":     ("#3a2615", "#6b4a2a"),
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
    "Café des Moonlings": "cafe", "Comptoir du Café": "cafe",
    "Table du Café": "cafe", "Entrée du Café": "cafe",
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

    if key == "cafe":
        # Warm hanging lights instead of stars, wooden counter line
        n_lights = 10
        xs = np.linspace(80, CANVAS_W-80, n_lights)
        for x in xs:
            y = 60 + int(15 * math.sin(x / 80))
            for glow_r in range(26, 0, -4):
                alpha = int(70 * glow_r / 26)
                gc = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0,0,0,0))
                gd = ImageDraw.Draw(gc)
                gd.ellipse([x-glow_r, y-glow_r, x+glow_r, y+glow_r], fill=(255,210,120,alpha))
                img2 = Image.alpha_composite(img.convert("RGBA"), gc)
                img = img2.convert("RGB")
            draw = ImageDraw.Draw(img)
            draw.ellipse([x-7, y-7, x+7, y+7], fill=(255,225,150))
        # Counter / table line
        counter_y = int(CANVAS_H * 0.72)
        draw.rectangle([0, counter_y, CANVAS_W, CANVAS_H], fill=hex_rgb("#4a3018"))
        draw.rectangle([0, counter_y, CANVAS_W, counter_y+6], fill=hex_rgb("#7a5530"))
        return img.convert("RGBA")

    n_stars = 160
    xs = rng.integers(0, CANVAS_W, n_stars)
    ys = rng.integers(0, CANVAS_H*7//10, n_stars)
    for x, y in zip(xs, ys):
        bright = rng.integers(160, 255)
        sz = rng.integers(1, 3)
        draw.ellipse([x-sz, y-sz, x+sz, y+sz], fill=(bright, bright, bright))
        if sz == 2:
            draw.line([(x-4,y),(x+4,y)], fill=(bright,bright,bright,120))
            draw.line([(x,y-4),(x,y+4)], fill=(bright,bright,bright,120))
    # Lune
    moon_x, moon_y = CANVAS_W - 130, 90
    glow = Image.new("RGBA", (CANVAS_W, CANVAS_H), (0,0,0,0))
    gd = ImageDraw.Draw(glow)
    gd.ellipse([moon_x-90, moon_y-90, moon_x+90, moon_y+90], fill=(255,240,180,40))
    glow = glow.filter(__import__("PIL.ImageFilter", fromlist=["ImageFilter"]).GaussianBlur(20))
    img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")
    draw = ImageDraw.Draw(img)
    draw.ellipse([moon_x-45, moon_y-45, moon_x+45, moon_y+45], fill=(255,240,180))
    draw.ellipse([moon_x+12, moon_y-38, moon_x+58, moon_y+38], fill=t)  # crescent cutout

    horizon_y = int(CANVAS_H * 0.74)
    if key == "lac":
        draw.rectangle([0, horizon_y, CANVAS_W, CANVAS_H], fill=hex_rgb("#0a2a55"))
        for i in range(40):
            ly = horizon_y + 10 + i*((CANVAS_H-horizon_y-10)//40)
            lx = rng.integers(0, CANVAS_W)
            lw = rng.integers(30, 90)
            draw.line([(lx,ly),(lx+lw,ly)], fill=(180,210,255,60), width=2)
        rdraw = ImageDraw.Draw(img, "RGBA")
        rdraw.ellipse([moon_x-30, horizon_y+18, moon_x+30, horizon_y+38], fill=(255,240,180,90))
    elif key == "foret":
        draw.rectangle([0, horizon_y+30, CANVAS_W, CANVAS_H], fill=hex_rgb("#020a02"))
        for i in range(14):
            tx = int(CANVAS_W * i / 13) + rng.integers(-20,20)
            th = rng.integers(80, 200)
            tw = rng.integers(30, 60)
            draw.polygon([(tx, horizon_y+40), (tx-tw, horizon_y+40+th), (tx+tw, horizon_y+40+th)],
                         fill=hex_rgb("#0a200f"))
            for _ in range(4):
                fx = tx + rng.integers(-tw//2, tw//2)
                fy = horizon_y + 40 + rng.integers(10, th)
                draw.ellipse([fx-3,fy-3,fx+3,fy+3], fill=(255,225,120,200))
    elif key == "village":
        draw.rectangle([0, horizon_y+20, CANVAS_W, CANVAS_H], fill=hex_rgb("#0a0414"))
        for i in range(6):
            hx = 120 + i*200 + rng.integers(-30,30)
            hw, hh = 70, rng.integers(60,110)
            roof_c = hex_rgb("#3a1a4a")
            wall_c = hex_rgb("#241038")
            draw.polygon([(hx-hw//2-8, horizon_y+20), (hx, horizon_y+20-40), (hx+hw//2+8, horizon_y+20)], fill=roof_c)
            draw.rectangle([hx-hw//2, horizon_y+20, hx+hw//2, horizon_y+20+hh], fill=wall_c)
            draw.rectangle([hx-12, horizon_y+20+10, hx+12, horizon_y+20+30], fill=(255,225,150,200))
    elif key == "colline":
        draw.ellipse([-200, horizon_y, CANVAS_W*0.6, CANVAS_H+200], fill=hex_rgb("#0c0420"))
        draw.ellipse([CANVAS_W*0.3, horizon_y+30, CANVAS_W+200, CANVAS_H+200], fill=hex_rgb("#150830"))
    elif key == "riviere":
        draw.rectangle([0, horizon_y, CANVAS_W, CANVAS_H], fill=hex_rgb("#0c2840"))
        for i in range(30):
            ly = horizon_y + rng.integers(0, CANVAS_H-horizon_y)
            lx = rng.integers(0, CANVAS_W)
            draw.line([(lx,ly),(lx+rng.integers(20,70),ly)], fill=(200,230,255,70), width=2)
    elif key == "maison":
        draw.rectangle([0, horizon_y-10, CANVAS_W, CANVAS_H], fill=hex_rgb("#1c0c2a"))
        draw.rectangle([CANVAS_W*0.2, horizon_y-60, CANVAS_W*0.8, CANVAS_H], fill=hex_rgb("#28103a"))
        draw.polygon([(CANVAS_W*0.15, horizon_y-60), (CANVAS_W*0.5, horizon_y-130), (CANVAS_W*0.85, horizon_y-60)],
                     fill=hex_rgb("#3a1850"))
        draw.rectangle([CANVAS_W*0.42, horizon_y+10, CANVAS_W*0.58, CANVAS_H], fill=hex_rgb("#160a20"))

    return img.convert("RGBA")


def _shade(rgb, factor):
    return tuple(max(0, min(255, int(c*factor))) for c in rgb)


def make_char(name, size=200, bounce=0):
    fill, outline = CHAR_COLORS.get(name, ("#cccccc", "#aaaaaa"))
    fc = hex_rgb(fill)
    oc = hex_rgb(outline)
    light = _shade(fc, 1.25)
    shadow = _shade(fc, 0.72)
    pad = 70
    W, H = size + pad, size + pad + bounce*2
    img = Image.new("RGBA", (W, H), (0,0,0,0))
    y_off = bounce
    cx = W // 2
    body_top = 50 + y_off
    body_bot = H - 30
    body_w = size * 0.42

    # Soft drop shadow on the ground
    shadow_img = Image.new("RGBA", (W, H), (0,0,0,0))
    sd = ImageDraw.Draw(shadow_img)
    sd.ellipse([cx-body_w*0.8, body_bot-14, cx+body_w*0.8, body_bot+16], fill=(0,0,0,70))
    shadow_img = shadow_img.filter(__import__("PIL.ImageFilter", fromlist=["ImageFilter"]).GaussianBlur(6))
    img = Image.alpha_composite(img, shadow_img)
    draw = ImageDraw.Draw(img)

    # Ears (drawn behind body) — shape differs per character
    ear_h = size*0.22
    if name == "gizo":
        for ex in (cx-body_w*0.55, cx+body_w*0.55):
            draw.rectangle([ex-9, body_top-ear_h+6, ex+9, body_top+14], fill=oc, outline=_shade(oc,0.7), width=2)
            draw.ellipse([ex-12, body_top-ear_h-2, ex+12, body_top-ear_h+18], fill=light, outline=oc, width=2)
    else:
        for ex in (cx-body_w*0.62, cx+body_w*0.62):
            draw.ellipse([ex-16, body_top-ear_h*0.8, ex+16, body_top+ear_h*0.5],
                         fill=light, outline=oc, width=3)

    # Stubby arms
    arm_y = (body_top+body_bot)/2 + size*0.05
    for ax, sign in [(cx-body_w*0.92, -1), (cx+body_w*0.92, 1)]:
        draw.ellipse([ax-16, arm_y-14, ax+16, arm_y+14], fill=fc, outline=oc, width=3)

    # Main body — soft rounded blob (wider at the bottom, plush feel)
    body_box = [cx-body_w, body_top, cx+body_w, body_bot]
    draw.ellipse(body_box, fill=fc, outline=oc, width=4)

    # Belly highlight (top-left light source)
    hl = Image.new("RGBA", (W, H), (0,0,0,0))
    hd = ImageDraw.Draw(hl)
    hd.ellipse([cx-body_w*0.55, body_top+body_w*0.15, cx+body_w*0.05, body_top+body_w*1.05],
               fill=(*light, 90))
    hl = hl.filter(__import__("PIL.ImageFilter", fromlist=["ImageFilter"]).GaussianBlur(10))
    img = Image.alpha_composite(img, hl)
    # Lower shadow for volume
    sh = Image.new("RGBA", (W, H), (0,0,0,0))
    shd = ImageDraw.Draw(sh)
    shd.ellipse([cx-body_w*0.7, body_bot-body_w*0.7, cx+body_w*0.85, body_bot+10], fill=(*shadow, 70))
    sh = sh.filter(__import__("PIL.ImageFilter", fromlist=["ImageFilter"]).GaussianBlur(14))
    img = Image.alpha_composite(img, sh)
    draw = ImageDraw.Draw(img)
    draw.ellipse(body_box, outline=oc, width=4)

    # Feet
    foot_y = body_bot - 6
    for fx in (cx-body_w*0.4, cx+body_w*0.4):
        draw.ellipse([fx-15, foot_y-8, fx+15, foot_y+14], fill=_shade(fc,0.85), outline=oc, width=2)

    # Eyes (big, expressive, with shine)
    ey = body_top + (body_bot-body_top)*0.38
    eye_w = size*0.11
    for ex in (cx-size*0.16, cx+size*0.16):
        draw.ellipse([ex-eye_w, ey-eye_w*1.15, ex+eye_w, ey+eye_w*1.15], fill=(255,255,255,255))
        draw.ellipse([ex-eye_w*0.72, ey-eye_w*0.85, ex+eye_w*0.72, ey+eye_w*0.95], fill=(35,25,45,255))
        draw.ellipse([ex-eye_w*0.28, ey-eye_w*0.75, ex+eye_w*0.05, ey-eye_w*0.25], fill=(255,255,255,230))
    # Cheeks
    ck_y = ey + size*0.14
    for ck_x in (cx-size*0.26, cx+size*0.26):
        draw.ellipse([ck_x-14, ck_y-8, ck_x+14, ck_y+8], fill=(255,140,140,90))
    # Smile
    sm_w = size*0.13
    draw.arc([cx-sm_w, ey+size*0.10, cx+sm_w, ey+size*0.24], start=10, end=170,
              fill=(90,50,50,220), width=4)

    # Special accessories per character
    if name == "mochi":
        scx, scy = cx, body_bot - size*0.22
        pts_outer = [(scx+18*math.cos(math.radians(a-90)), scy+18*math.sin(math.radians(a-90))) for a in range(0,360,72)]
        pts_inner = [(scx+7*math.cos(math.radians(a-90)), scy+7*math.sin(math.radians(a-90))) for a in range(36,396,72)]
        pts = [p for pair in zip(pts_outer, pts_inner) for p in pair]
        draw.polygon(pts, fill=(255,215,0,240), outline=(200,150,0,255))
    elif name == "piri":
        scx, scy = cx, body_bot - size*0.22
        pts_outer = [(scx+16*math.cos(math.radians(a-90)), scy+16*math.sin(math.radians(a-90))) for a in range(0,360,72)]
        pts_inner = [(scx+7*math.cos(math.radians(a-90)), scy+7*math.sin(math.radians(a-90))) for a in range(36,396,72)]
        pts = [p for pair in zip(pts_outer, pts_inner) for p in pair]
        draw.polygon(pts, fill=(255,255,255,160))
    elif name == "zumu":
        tail_pts = [(cx+body_w-6, (body_top+body_bot)/2), (cx+body_w+34, (body_top+body_bot)/2-22),
                    (cx+body_w+58, (body_top+body_bot)/2), (cx+body_w+34, (body_top+body_bot)/2+22)]
        draw.polygon(tail_pts, fill=(*hex_rgb("#cfeeff"), 200), outline=oc)
    elif name == "pofu":
        for bx, by_ in [(cx-size*0.2, body_top+6), (cx, body_top-6), (cx+size*0.2, body_top+6)]:
            draw.ellipse([bx-18, by_-13, bx+18, by_+13], fill=fc, outline=oc, width=2)
    elif name == "gizo":
        pouch_y = body_bot - size*0.18
        draw.rounded_rectangle([cx-26, pouch_y-16, cx+26, pouch_y+16], radius=6,
                                fill=_shade(fc,0.8), outline=oc, width=2)

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

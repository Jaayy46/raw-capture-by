#!/usr/bin/env python3
"""Derive the web-facing image set from the originals.

Nothing on a web page can be made undownloadable — what the browser
renders, the visitor already has. The only real lever is to serve less:
these derivatives are sized for screens, so a lifted copy is fine on a
display and poor for print or resale. The originals in images/ are never
touched and never shipped.

Outputs (committed, consumed by v4/scripts/sync-assets.mjs):
    images/web/full/<name>.webp     1600px long edge  — lightbox
    images/web/thumb/<name>.webp     900px long edge  — grid tiles
    images/hero/<name>.webp         1200px long edge  — 3D corridor
    images/hero/<name>@sm.webp       700px long edge  — corridor, phones

All carry a discreet corner watermark and EXIF copyright. The hero set
is included because those files are fetchable directly by URL — leaving
them clean would have been an open side door.

Run:  python3 scripts/derive-web-images.py
"""
from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import re, sys

ROOT   = Path(__file__).resolve().parent.parent
SRC    = ROOT / "images"
OUT    = ROOT / "images" / "web"
HERO   = ROOT / "images" / "hero"
PHOTOS = ROOT / "v4" / "src" / "data" / "photos.js"
HEROJS = ROOT / "v4" / "src" / "data" / "hero.js"

FULL_EDGE  = 1600   # lightbox
THUMB_EDGE = 900    # grid tiles
HERO_EDGE  = 1200   # 3D corridor
HERO_SM    = 700    # corridor on phones
QUALITY    = 82

MARK       = "raw_capture_by"
AUTHOR     = "Livio Raschle"
# EXIF Copyright/Artist are ASCII fields — a "©" or em dash comes back as
# "?" in every reader. Spelled out instead.
COPYRIGHT  = f"(c) {AUTHOR} - raw-capture-by.com. Alle Rechte vorbehalten."

FONTS = [
    "/System/Library/Fonts/Supplemental/Courier New Bold.ttf",
    "/System/Library/Fonts/Menlo.ttc",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
]


def load_font(size):
    for p in FONTS:
        if Path(p).exists():
            try:
                return ImageFont.truetype(p, size)
            except OSError:
                continue
    return ImageFont.load_default()


def watermark(im):
    """Discreet mark, bottom-left. Sized relative to the image so it
    reads the same on a thumb and on the full version."""
    im = im.convert("RGB")
    w, h = im.size
    size   = max(11, int(w * 0.022))
    pad    = int(w * 0.028)
    font   = load_font(size)

    layer = Image.new("RGBA", im.size, (0, 0, 0, 0))
    d     = ImageDraw.Draw(layer)

    box   = d.textbbox((0, 0), MARK, font=font)
    tw, th = box[2] - box[0], box[3] - box[1]
    x, y  = pad, h - pad - th

    # Soft shadow first so the mark stays legible on light frames
    d.text((x + 1, y + 1), MARK, font=font, fill=(0, 0, 0, 90))
    d.text((x, y),         MARK, font=font, fill=(255, 255, 255, 140))

    return Image.alpha_composite(im.convert("RGBA"), layer).convert("RGB")


def exif_for(im):
    ex = im.getexif()
    ex[0x8298] = COPYRIGHT      # Copyright
    ex[0x013B] = AUTHOR         # Artist
    return ex


def derive(name):
    src = SRC / f"{name}.jpg"
    if not src.exists():
        return None
    made = []
    with Image.open(src) as im:
        im = im.convert("RGB")
        for folder, edge in (("full", FULL_EDGE), ("thumb", THUMB_EDGE)):
            c = im.copy()
            c.thumbnail((edge, edge), Image.LANCZOS)
            c = watermark(c)
            dest = OUT / folder / f"{name}.webp"
            dest.parent.mkdir(parents=True, exist_ok=True)
            c.save(dest, "WEBP", quality=QUALITY, method=5, exif=exif_for(c))
            made.append((folder, c.size, dest.stat().st_size))
    return made


def derive_hero(name):
    """The corridor frames. Fetchable by URL like any other file, so they
    get the same treatment."""
    src = SRC / f"{name}.jpg"
    if not src.exists():
        return None
    total = 0
    with Image.open(src) as im:
        im = im.convert("RGB")
        for suffix, edge in (("", HERO_EDGE), ("@sm", HERO_SM)):
            c = im.copy()
            c.thumbnail((edge, edge), Image.LANCZOS)
            c = watermark(c)
            HERO.mkdir(parents=True, exist_ok=True)
            dest = HERO / f"{name}{suffix}.webp"
            c.save(dest, "WEBP", quality=86, method=5, exif=exif_for(c))
            total += dest.stat().st_size
    return total


def main():
    if not PHOTOS.exists():
        sys.exit(f"photos.js nicht gefunden: {PHOTOS}")
    names = re.findall(r'file:\s*"([^"]+)"', PHOTOS.read_text(encoding="utf-8"))
    names = list(dict.fromkeys(names))
    if not names:
        sys.exit("Keine Bilder in photos.js gefunden")

    total, missing = 0, []
    for n in names:
        made = derive(n)
        if made is None:
            missing.append(n)
            continue
        total += sum(m[2] for m in made)

    print(f"derive-web-images: {len(names) - len(missing)} Bilder "
          f"→ {FULL_EDGE}px + {THUMB_EDGE}px, {total / 1048576:.1f} MB")

    # Hero corridor — file list comes from hero.js so it cannot drift
    if HEROJS.exists():
        picks = re.findall(r"\[\s*'([^']+)'", HEROJS.read_text(encoding="utf-8"))
        picks = list(dict.fromkeys(picks))
        hero_total, hero_missing = 0, []
        for n in picks:
            got = derive_hero(n)
            if got is None:
                hero_missing.append(n)
            else:
                hero_total += got
        print(f"derive-web-images: {len(picks) - len(hero_missing)} Hero-Frames "
              f"→ {HERO_EDGE}px + {HERO_SM}px, {hero_total / 1048576:.1f} MB")
        missing += hero_missing

    if missing:
        print(f"FEHLEN ({len(missing)}): {', '.join(missing[:8])}")
        sys.exit(1)


if __name__ == "__main__":
    main()

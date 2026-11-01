#!/usr/bin/env python3
"""Baut die Galerie aus einem Ordner voller Bilder.

So fügst du Bilder hinzu oder tauschst sie aus:

    images/gallery/<kategorie>/<Bildunterschrift>.jpg

Der Dateiname IST die Bildunterschrift.
Die Bilder erscheinen in alphabetischer Reihenfolge. Willst du sie
selbst ordnen, stell eine Zahl voran — "01 Seealpsee.jpg" steht dann
zuoberst und zeigt trotzdem nur "Seealpsee". "Seealpsee · Appenzell.jpg"
erscheint auf der Seite als "Seealpsee · Appenzell". Danach einmal:

    python3 scripts/build-gallery.py

Das Skript liest die Aufnahmedaten aus den EXIF, erzeugt die
ausgelieferten Fassungen (verkleinert, mit Wasserzeichen) und schreibt
v5/src/data/photos.js neu. Die Originale bleiben unangetastet und
werden nie ausgeliefert.

Welche Kategorien es gibt und in welcher Reihenfolge sie erscheinen,
steht in images/gallery/_kategorien.json.
"""
from PIL import Image, ImageDraw, ImageFont
from PIL.ExifTags import TAGS
from pathlib import Path
import json, re, sys, unicodedata

ROOT    = Path(__file__).resolve().parent.parent
GALLERY = ROOT / "images" / "gallery"
WEB     = ROOT / "images" / "web"
PHOTOS  = ROOT / "v5" / "src" / "data" / "photos.js"
CONFIG  = GALLERY / "_kategorien.json"

FULL_EDGE, THUMB_EDGE, QUALITY = 1600, 900, 84
MARK, AUTHOR = "raw_capture_by", "Livio Raschle"
COPYRIGHT = f"© {AUTHOR} — raw-capture-by.com. Alle Rechte vorbehalten."
SUFFIXES = {".jpg", ".jpeg", ".png", ".webp", ".tif", ".tiff"}

FONTS = ["/System/Library/Fonts/Supplemental/Courier New Bold.ttf",
         "/System/Library/Fonts/Menlo.ttc",
         "/System/Library/Fonts/Supplemental/Arial.ttf"]


def font(size):
    for p in FONTS:
        if Path(p).exists():
            try: return ImageFont.truetype(p, size)
            except OSError: continue
    return ImageFont.load_default()


def slug(text):
    """Dateiname → URL-tauglicher Name. Umlaute werden umschrieben.

    Erst nach NFC zusammenziehen: macOS legt Dateinamen zerlegt ab
    ("a" + Trema statt "ä"), sonst greift das Ersetzen nicht und der
    Umlaut fiele beim ASCII-Schritt ersatzlos weg — aus "Säntis"
    würde "santis" statt "saentis".
    """
    text = unicodedata.normalize("NFC", text)
    t = text.replace("ä", "ae").replace("ö", "oe").replace("ü", "ue").replace("ß", "ss")
    t = t.replace("Ä", "Ae").replace("Ö", "Oe").replace("Ü", "Ue")
    t = unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode()
    t = re.sub(r"[^a-zA-Z0-9]+", "-", t).strip("-").lower()
    return t or "bild"


def watermark(im):
    im = im.convert("RGBA")
    w, h = im.size
    f = font(max(11, int(w * 0.022)))
    pad = int(w * 0.028)
    layer = Image.new("RGBA", im.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    box = d.textbbox((0, 0), MARK, font=f)
    y = h - pad - (box[3] - box[1])
    d.text((pad + 1, y + 1), MARK, font=f, fill=(0, 0, 0, 90))
    d.text((pad, y),         MARK, font=f, fill=(255, 255, 255, 140))
    return Image.alpha_composite(im, layer).convert("RGB")


def shutter(v):
    v = float(v)
    return f"1/{int(round(1 / v))}s" if v < 1 else f"{v:g}s"


def lens_name(raw):
    if not raw: return None
    s = str(raw).strip()
    if "100-400" in s: return "Sony FE 100-400mm GM"
    if "24-70"   in s: return "Sigma 24-70mm f/2.8 Art"
    if "16mm"    in s: return "Sony FE 16mm f/1.8 G"
    return s


def read_exif(im):
    out = {"camera": "Sony A7 IV"}
    try:
        e = {TAGS.get(k, k): v for k, v in (im.getexif() or {}).items()}
        ifd = im.getexif().get_ifd(0x8769) if hasattr(im, "getexif") else {}
        e.update({TAGS.get(k, k): v for k, v in (ifd or {}).items()})
    except Exception:
        return out
    if str(e.get("Model", "")).strip() == "ILCE-7M4": out["camera"] = "Sony A7 IV"
    if (l := lens_name(e.get("LensModel"))):   out["lens"] = l
    if (f := e.get("FocalLength")):            out["focal"] = f"{float(f):g}mm"
    if (a := e.get("FNumber")):                out["aperture"] = f"f/{float(a):g}"
    if (t := e.get("ExposureTime")):           out["shutter"] = shutter(t)
    if (i := e.get("ISOSpeedRatings") or e.get("PhotographicSensitivity")):
        out["iso"] = str(i)
    return out


def js(s):
    return s.replace("\\", "\\\\").replace('"', '\\"')


def main():
    if not CONFIG.exists():
        sys.exit(f"Fehlt: {CONFIG}\nLege sie an, siehe Kopf dieses Skripts.")
    cats = json.loads(CONFIG.read_text(encoding="utf-8"))

    for sub in ("full", "thumb"):
        (WEB / sub).mkdir(parents=True, exist_ok=True)

    lines = ["// AUTOMATISCH ERZEUGT von scripts/build-gallery.py — nicht von Hand ändern.",
             "// Bilder hinzufügen: Datei nach images/gallery/<kategorie>/ legen,",
             "// der Dateiname wird zur Bildunterschrift. Dann das Skript laufen lassen.",
             "", "export const CATEGORIES = ["]

    total, seen, empty = 0, set(), []

    for cat in cats:
        folder = GALLERY / cat["id"]
        if not folder.is_dir():
            empty.append(cat["id"]); continue
        files = sorted(p for p in folder.iterdir()
                       if p.suffix.lower() in SUFFIXES and not p.name.startswith("."))
        if not files:
            empty.append(cat["id"]); continue

        lines.append("  {")
        lines.append(f'    id: "{cat["id"]}", label: "{js(cat["label"])}", '
                     f'desc: "{js(cat.get("desc", ""))}",')
        lines.append("    photos: [")

        for src in files:
            # Eine Zahl am Anfang steuert nur die Reihenfolge und wird
            # nicht angezeigt: "01 Seealpsee.jpg" erscheint als "Seealpsee".
            caption = re.sub(r"^\d+[\s._-]+", "", src.stem)
            name = slug(caption)
            if name in seen:                      # Namenskollision auflösen
                n = 2
                while f"{name}-{n}" in seen: n += 1
                name = f"{name}-{n}"
            seen.add(name)

            with Image.open(src) as im:
                im = im.convert("RGB") if im.mode != "RGB" else im
                meta = read_exif(im)
                w, h = im.size
                ex = im.getexif()
                ex[0x8298], ex[0x013B] = COPYRIGHT, AUTHOR
                for sub, edge in (("full", FULL_EDGE), ("thumb", THUMB_EDGE)):
                    c = im.copy()
                    c.thumbnail((edge, edge), Image.LANCZOS)
                    watermark(c).save(WEB / sub / f"{name}.webp", "WEBP",
                                      quality=QUALITY, method=5, exif=ex)

            fields = [f'file: "{name}"', f'caption: "{js(caption)}"',
                      f"w: {w}", f"h: {h}", f'camera: "{meta["camera"]}"']
            for k in ("lens", "focal", "aperture", "shutter", "iso"):
                if meta.get(k): fields.append(f'{k}: "{js(meta[k])}"')
            lines.append("      { " + ", ".join(fields) + " },")
            total += 1

        lines.append("    ],")
        lines.append("  },")

    lines += ["]", "",
              "// Nur die ausgelieferten Fassungen — die Originale verlassen den Rechner nie.",
              "export const thumb = (p) => `/media/thumb/${p.file}.webp`",
              "export const full  = (p) => `/media/full/${p.file}.webp`",
              "export const ALL   = CATEGORIES.flatMap(c => c.photos.map(p => ({ ...p, cat: c.id })))",
              ""]

    PHOTOS.write_text("\n".join(lines), encoding="utf-8")

    # Wird ein Bild umbenannt oder entfernt, bleibt sonst seine alte
    # Fassung liegen und wird weiter ausgeliefert.
    keep = seen | {"portrait-livio"}
    stale = 0
    for sub in ("full", "thumb"):
        for f in (WEB / sub).glob("*.webp"):
            if f.stem not in keep:
                f.unlink(); stale += 1

    print(f"{total} Bilder in {len(cats) - len(empty)} Kategorien → photos.js")
    print(f"Ausgeliefert: images/web/full ({FULL_EDGE}px) und thumb ({THUMB_EDGE}px), mit Wasserzeichen")
    if stale:
        print(f"{stale} veraltete Fassungen entfernt")
    if empty:
        print(f"Leer oder nicht vorhanden: {', '.join(empty)}")
    if not total:
        sys.exit("Keine Bilder gefunden — nichts geschrieben.")


if __name__ == "__main__":
    main()

// AUTOMATISCH ERZEUGT von scripts/build-gallery.py — nicht von Hand ändern.
// Bilder hinzufügen: Datei nach images/gallery/<kategorie>/ legen,
// der Dateiname wird zur Bildunterschrift. Dann das Skript laufen lassen.

export const CATEGORIES = [
  {
    id: "landschaft", label: "Landschaft", desc: "Berge, Seen und Licht — Schweiz und Japan.",
    photos: [
      { file: "fuji-chureito-pagode", caption: "Fuji · Chureito-Pagode", w: 2000, h: 1333, camera: "Sony A7 IV", lens: "Sigma 24-70mm f/2.8 Art", focal: "29.8mm", aperture: "f/7.1", shutter: "1/250s", iso: "2000" },
      { file: "fuji-san-sonnenuntergang", caption: "Fuji-san · Sonnenuntergang", w: 2000, h: 1333, camera: "Sony A7 IV", lens: "Sony FE 100-400mm GM", focal: "100mm", aperture: "f/6.3", shutter: "1/250s", iso: "1000" },
      { file: "kawaguchiko-fuji", caption: "Kawaguchiko · Fuji", w: 2000, h: 1333, camera: "Sony A7 IV", lens: "Sigma 24-70mm f/2.8 Art", focal: "37mm", aperture: "f/7.1", shutter: "1/320s", iso: "640" },
      { file: "nationalpark-morgenstimmung", caption: "Nationalpark - Morgenstimmung", w: 7008, h: 4672, camera: "Sony A7 IV", lens: "Sony FE 100-400mm GM", focal: "100mm", aperture: "f/9", shutter: "1/800s", iso: "1250" },
      { file: "nationalpark-schweiz", caption: "Nationalpark - Schweiz", w: 7008, h: 4672, camera: "Sony A7 IV", lens: "28-70mm F2.8 DG DN | Contemporary 021", focal: "70mm", aperture: "f/6.3", shutter: "1/60s", iso: "1000" },
      { file: "saentis-schweiz", caption: "Säntis - Schweiz", w: 7008, h: 4672, camera: "Sony A7 IV", lens: "Sigma 24-70mm f/2.8 Art", focal: "44.6mm", aperture: "f/4", shutter: "1/250s", iso: "5000" },
      { file: "seealpsee-appenzell", caption: "Seealpsee · Appenzell", w: 1800, h: 1199, camera: "Sony A7 IV" },
      { file: "winterabend-alpen", caption: "Winterabend · Alpen", w: 1800, h: 1199, camera: "Sony A7 IV" },
    ],
  },
  {
    id: "street", label: "Street", desc: "Tokyo, Osaka, Kyoto — Nächte und Gassen.",
    photos: [
      { file: "altstadtgasse-tokyo", caption: "Altstadtgasse · Tokyo", w: 1333, h: 2000, camera: "Sony A7 IV", lens: "Sigma 24-70mm f/2.8 Art", focal: "70mm", aperture: "f/9", shutter: "1/200s", iso: "200" },
      { file: "dotonbori-osaka", caption: "Dotonbori · Osaka", w: 1333, h: 2000, camera: "Sony A7 IV", lens: "Sigma 24-70mm f/2.8 Art", focal: "24mm", aperture: "f/5.6", shutter: "1/200s", iso: "1600" },
      { file: "izakaya-japan", caption: "Izakaya · Japan", w: 1333, h: 2000, camera: "Sony A7 IV", lens: "Sigma 24-70mm f/2.8 Art", focal: "46.9mm", aperture: "f/5.6", shutter: "1/160s", iso: "3200" },
      { file: "metro-tunnel-tokyo", caption: "Metro · Tunnel · Tokyo", w: 1333, h: 2000, camera: "Sony A7 IV", lens: "Sigma 24-70mm f/2.8 Art", focal: "24mm", aperture: "f/7.1", shutter: "1/250s", iso: "4000" },
      { file: "shibuya-crossing-tokyo", caption: "Shibuya Crossing · Tokyo", w: 1333, h: 2000, camera: "Sony A7 IV", lens: "Sigma 24-70mm f/2.8 Art", focal: "26.3mm", aperture: "f/8", shutter: "1/320s", iso: "1250" },
      { file: "shibuya-b-w", caption: "Shibuya · B&W", w: 1333, h: 2000, camera: "Sony A7 IV", lens: "Sigma 24-70mm f/2.8 Art", focal: "70mm", aperture: "f/8", shutter: "1/320s", iso: "1250" },
      { file: "shinjuku-nacht-tokyo", caption: "Shinjuku · Nacht · Tokyo", w: 2000, h: 1333, camera: "Sony A7 IV", lens: "Sigma 24-70mm f/2.8 Art", focal: "24mm", aperture: "f/8", shutter: "1.3s", iso: "100" },
    ],
  },
  {
    id: "konzerte", label: "Konzerte", desc: "Bühnenlicht, Silhouetten, Energie.",
    photos: [
      { file: "atmosphaere-konzert", caption: "Atmosphäre · Konzert", w: 1920, h: 2880, camera: "Sony A7 IV" },
      { file: "crowd-energie", caption: "Crowd · Energie", w: 1920, h: 2879, camera: "Sony A7 IV" },
      { file: "dj-set", caption: "DJ Set", w: 1800, h: 1199, camera: "Sony A7 IV" },
      { file: "silhouetten-buehne", caption: "Silhouetten · Bühne", w: 1365, h: 2048, camera: "Sony A7 IV" },
      { file: "theater-buehne", caption: "Theater · Bühne", w: 1365, h: 2048, camera: "Sony A7 IV" },
    ],
  },
  {
    id: "sport", label: "Sport", desc: "Klettern, Wandern, Gegenlicht.",
    photos: [
      { file: "chalk-detail", caption: "Chalk · Detail", w: 1800, h: 1012, camera: "Sony A7 IV" },
      { file: "fingertechnik-crimp", caption: "Fingertechnik · Crimp", w: 1365, h: 2048, camera: "Sony A7 IV" },
      { file: "gipfel-gegenlicht", caption: "Gipfel · Gegenlicht", w: 1365, h: 2048, camera: "Sony A7 IV" },
      { file: "klettern-sichern", caption: "Klettern · Sichern", w: 1365, h: 2048, camera: "Sony A7 IV" },
      { file: "schneewanderung", caption: "Schneewanderung", w: 1800, h: 1199, camera: "Sony A7 IV" },
    ],
  },
  {
    id: "motorsport", label: "Motorsport", desc: "F1, GT3 und JDM-Kultur.",
    photos: [
      { file: "ferrari-f1-austria-gp", caption: "Ferrari F1 · Austria GP", w: 1800, h: 1012, camera: "Sony A7 IV" },
      { file: "jdm-car-meet-japan", caption: "JDM Car Meet · Japan", w: 1333, h: 2000, camera: "Sony A7 IV", lens: "Sigma 24-70mm f/2.8 Art", focal: "30.4mm", aperture: "f/4", shutter: "1/100s", iso: "8000" },
      { file: "jdm-nacht-japan", caption: "JDM Nacht · Japan", w: 1333, h: 2000, camera: "Sony A7 IV", lens: "Sigma 24-70mm f/2.8 Art", focal: "60mm", aperture: "f/4.5", shutter: "1/125s", iso: "8000" },
      { file: "porsche-911-gt3", caption: "Porsche 911 GT3", w: 1800, h: 1199, camera: "Sony A7 IV" },
      { file: "silvia-tokyo", caption: "Silvia - Tokyo", w: 4672, h: 7008, camera: "Sony A7 IV", lens: "Sigma 24-70mm f/2.8 Art", focal: "44.3mm", aperture: "f/6.3", shutter: "1/160s", iso: "4000" },
    ],
  },
  {
    id: "wildlife", label: "Wildlife", desc: "Makaken in Arashiyama, Rotwild im Herbst.",
    photos: [
      { file: "hirsch-portrait-schweiz", caption: "Hirsch · Portrait · Schweiz", w: 1365, h: 2048, camera: "Sony A7 IV" },
      { file: "makake-arashiyama-japan", caption: "Makake · Arashiyama · Japan", w: 1333, h: 2000, camera: "Sony A7 IV", lens: "Sony FE 100-400mm GM", focal: "400mm", aperture: "f/5.6", shutter: "1/320s", iso: "4000" },
      { file: "nihonzaru-portrait-japan", caption: "Nihonzaru · Portrait · Japan", w: 1333, h: 2000, camera: "Sony A7 IV", lens: "Sony FE 100-400mm GM", focal: "400mm", aperture: "f/5.6", shutter: "1/320s", iso: "2500" },
      { file: "rehkitz-herbst-schweiz", caption: "Rehkitz · Herbst · Schweiz", w: 1365, h: 2048, camera: "Sony A7 IV" },
    ],
  },
  {
    id: "architektur", label: "Architektur", desc: "Torii, Burgen und Linien.",
    photos: [
      { file: "fushimi-inari-kyoto", caption: "Fushimi Inari · Kyoto", w: 1333, h: 2000, camera: "Sony A7 IV", lens: "Sigma 24-70mm f/2.8 Art", focal: "24mm", aperture: "f/6.3", shutter: "1/250s", iso: "5000" },
      { file: "matsumoto-castle-japan", caption: "Matsumoto Castle · Japan", w: 1500, h: 2000, camera: "Sony A7 IV", lens: "Sigma 24-70mm f/2.8 Art", focal: "30.7mm", aperture: "f/6.3", shutter: "1/160s", iso: "400" },
      { file: "santana-madeira", caption: "Santana · Madeira", w: 1800, h: 1199, camera: "Sony A7 IV" },
      { file: "torii-tunnel-fushimi-inari", caption: "Torii-Tunnel · Fushimi Inari", w: 1333, h: 2000, camera: "Sony A7 IV", lens: "Sigma 24-70mm f/2.8 Art", focal: "37.3mm", aperture: "f/7.1", shutter: "1/200s", iso: "8000" },
    ],
  },
]

// Nur die ausgelieferten Fassungen — die Originale verlassen den Rechner nie.
export const thumb = (p) => `/media/thumb/${p.file}.webp`
export const full  = (p) => `/media/full/${p.file}.webp`
export const ALL   = CATEGORIES.flatMap(c => c.photos.map(p => ({ ...p, cat: c.id })))

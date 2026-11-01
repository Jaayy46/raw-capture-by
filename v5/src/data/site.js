/* Everything the site says about Livio, in one place. */

export const SITE = {
  name:      'Livio Raschle',
  first:     'Livio',
  handle:    'raw_capture_by',
  location:  'Kanton Zürich',
  country:   'Schweiz',
  domain:    'raw-capture-by.com',
  email:     'raw.capture.by@gmail.com',
  instagram: 'raw_capture_by',
  unsplash:  'Livio Raschle',
  camera:    'Sony A7 IV',
}

export const NAV = [
  { label: 'Arbeiten',   id: 'arbeiten' },
  { label: 'Japan',      id: 'japan' },
  { label: 'Leistungen', id: 'leistungen' },
  { label: 'Über mich',  id: 'ueber' },
  { label: 'Anfrage',    id: 'anfrage' },
]

/* Weighted to the two audiences Livio named: bands and promoters,
   and private clients. Deliberately no prices — enquiry-based. */
export const SERVICES = [
  {
    title: 'Konzerte und Events',
    for:   'Bands, Veranstalter, Clubs',
    body:  'Bühne, Publikum und die Stunde davor. Ich arbeite ohne Blitz und bleibe aus dem Weg, auch wenn das Licht schwierig wird.',
    deliver: 'Bearbeitete Bilder innerhalb einer Woche, eine Auswahl fürs Social-Media-Posting noch in derselben Nacht.',
  },
  {
    title: 'Portraits und private Anlässe',
    for:   'Privatkunden',
    body:  'Draussen, bei Tageslicht oder zur blauen Stunde. Ohne Studio, ohne steife Posen — wir laufen und reden, und die Bilder entstehen nebenbei.',
    deliver: 'Gemeinsame Bildauswahl, bearbeitete Dateien in Web- und Druckauflösung.',
  },
  {
    title: 'Reise- und Ortsaufnahmen',
    for:   'Tourismus, Gastronomie, Hotellerie',
    body:  'Landschaft, Architektur und Atmosphäre eines Orts — so, wie er sich zur richtigen Tageszeit zeigt.',
    deliver: 'Bildstrecke zur freien Verwendung, auf Wunsch mit Nutzungsrechten für Print.',
  },
  {
    title: 'Bewegtbild',
    for:   'Alle',
    body:  'Kurze Cuts fürs Netz, vertikal oder im Breitbild. Aufnahme und Schnitt von mir, Musik lizenziert.',
    deliver: 'Fertiger Cut in den Formaten, die du brauchst.',
  },
]

/* The light a picture was made in, rather than its subject. Livio's
   own stated theme — he gets up before four for it — and it is the
   one thing an alpine sunrise and a stage share. */
export const LIGHT = [
  { id: 'alle',   label: 'Alles' },
  { id: 'morgen', label: 'Morgenlicht', cats: ['landschaft'] },
  { id: 'tag',    label: 'Tageslicht',  cats: ['wildlife', 'sport', 'architektur'] },
  { id: 'blau',   label: 'Blaue Stunde', cats: ['street'] },
  { id: 'nacht',  label: 'Kunstlicht',  cats: ['konzerte', 'motorsport'] },
]

export const SERIES = {
  id:    'japan',
  title: 'Japan',
  lead:  'Drei Wochen zwischen Tokyo, Osaka und dem Fuji.',
  body:  `Angefangen hat es mit den Morgenstunden am Kawaguchiko, wo der Berg
          nur in der ersten halben Stunde ohne Wolke dasteht. Danach war es
          umgekehrt: Je später es wurde, desto mehr gab die Stadt her —
          Dotonbori im Neon, die Gassen hinter Shinjuku, ein Car Meet um
          zwei Uhr nachts. Zwischendurch die Makaken in Arashiyama, die sich
          kein bisschen für die Kamera interessiert haben.`,
  // Files picked from the gallery data — all real frames from the trip.
  frames: ['_A7_9302', '_A7_8079', '_A7_7305', '_A7_2632', '_A7_0044', '_A7_8226'],
  film: {
    title:    'Japan',
    duration: '0:42',
    sources: [
      { minWidth: 1024, src: '/media/video/japan-1080.mp4' },
      { minWidth: 561,  src: '/media/video/japan-720.mp4'  },
      { minWidth: 0,    src: '/media/video/japan-540.mp4'  },
    ],
    poster: '/media/video/japan-poster.jpg',
  },
}

export const PROJECT_TYPES = [
  'Konzert oder Event',
  'Portrait oder privater Anlass',
  'Reise- und Ortsaufnahmen',
  'Bewegtbild',
  'Etwas anderes',
]

export const BUDGETS = [
  'Noch offen',
  'bis CHF 500',
  'CHF 500 – 1500',
  'CHF 1500 – 3000',
  'über CHF 3000',
]

export const GEAR = [
  'Sony A7 IV',
  'Sony FE 16mm f/1.8 G',
  'Sigma 24-70mm f/2.8 DG DN Art',
  'Sony FE 100-400mm f/4.5-5.6 GM OSS',
]

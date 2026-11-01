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
  unsplash:  'raw_capture_by',
  unsplashUrl: 'https://unsplash.com/de/@raw_capture_by',
  camera:    'Sony A7 IV',
}

/* Das Bild auf der Startseite. Der Wert ist der `file`-Name aus
   photos.js — also der Dateiname in images/gallery/, kleingeschrieben
   und mit Bindestrichen. */
export const HERO_IMAGE = 'seealpsee-appenzell'

export const NAV = [
  { label: 'Arbeiten',   id: 'arbeiten' },
  { label: 'Film',       id: 'film' },
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
    deliver: 'Eine erste Auswahl bekommst du noch in derselben Nacht, den Rest innerhalb einer Woche.',
  },
  {
    title: 'Portraits und private Anlässe',
    for:   'Privatkunden',
    body:  'Draussen, bei Tageslicht oder zur blauen Stunde. Ohne Studio, ohne steife Posen — wir laufen und reden, und die Bilder entstehen nebenbei.',
    deliver: 'Wir suchen die Bilder zusammen aus. Du bekommst sie fürs Netz und zum Ausdrucken.',
  },
  {
    title: 'Reise- und Ortsaufnahmen',
    for:   'Tourismus, Gastronomie, Hotellerie',
    body:  'Landschaft, Architektur und Atmosphäre eines Orts — so, wie er sich zur richtigen Tageszeit zeigt.',
    deliver: 'Eine Bildstrecke, die du frei verwenden kannst — für Print sprechen wir kurz darüber.',
  },
  {
    title: 'Bewegtbild',
    for:   'Alle',
    body:  'Kurze Cuts fürs Netz, vertikal oder im Breitbild. Aufnahme und Schnitt von mir, Musik lizenziert.',
    deliver: 'Der fertige Cut in den Formaten, die du brauchst.',
  },
]

export const FILM = {
  title:    'Japan',
  duration: '0:42',
  blurb:    'Drei Wochen zwischen Tokyo, Osaka und dem Fuji, auf 42 Sekunden.',
  sources: [
    { minWidth: 1024, src: '/media/video/japan-1080.mp4' },
    { minWidth: 561,  src: '/media/video/japan-720.mp4'  },
    { minWidth: 0,    src: '/media/video/japan-540.mp4'  },
  ],
  poster: '/media/video/japan-poster.jpg',
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

export const GEAR =
  'Ich arbeite mit Sony — ein Gehäuse und drei Objektive, vom Weitwinkel ' +
  'bis 400 Millimeter. Mehr braucht es selten.'

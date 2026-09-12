/* Single source of truth for everything the site says about Livio.
   Components read from here — no more hunting the same fact through
   five files when it changes. */

export const SITE = {
  handle:   'raw_capture_by',
  name:     'Livio Raschle',
  first:    'Livio',
  role:     'Fotografie & Film',
  location: 'Kanton Zürich',
  country:  'Schweiz',
  camera:   'Sony A7 IV',
  domain:   'raw-capture-by.com',
  email:    'raw.capture.by@gmail.com',
  instagram:'raw_capture_by',
  since:    2022,
}

export const LINKS = [
  { label: 'Instagram', value: `@${SITE.instagram}`, href: `https://instagram.com/${SITE.instagram}` },
  { label: 'Mail',      value: SITE.email,           href: `mailto:${SITE.email}` },
  { label: 'Web',       value: SITE.domain,          href: `https://${SITE.domain}` },
  { label: 'Standort',  value: `${SITE.location}, ${SITE.country}`, href: null },
]

export const NAV = [
  { label: 'Arbeiten', id: 'work' },
  { label: 'Über',     id: 'about' },
  { label: 'Film',     id: 'video' },
  { label: 'Kontakt',  id: 'contact' },
]

// Derived from the EXIF in the photos themselves
export const GEAR = [
  { name: 'Sony A7 IV',                         type: 'Body' },
  { name: 'Sigma 24-70mm f/2.8 DG DN Art',      type: 'Objektiv' },
  { name: 'Sony FE 100-400mm f/4.5-5.6 GM OSS', type: 'Objektiv' },
  { name: 'Adobe Lightroom Classic',            type: 'Entwicklung' },
  { name: 'Adobe Premiere Pro',                 type: 'Schnitt' },
]

export const FILM = {
  title:    'Japan',
  year:     '2026',
  duration: '0:42',
  places:   'Tokyo · Osaka · Kawaguchiko',
  blurb:    'Ein Cut aus drei Wochen Japan — Strassen, Autos und die Morgenstunden am Fuji.',
  // Source files live in the repo's /video folder; sync-assets copies
  // them to /media/video at build time. Widest match wins — picked in
  // JS rather than via <source media>, because appending sources to a
  // <video> after it has loaded does not re-run source selection.
  sources: [
    { minWidth: 1024, src: '/media/video/japan-1080.mp4' },  // 16 MB
    { minWidth: 561,  src: '/media/video/japan-720.mp4'  },  // 9.4 MB
    { minWidth: 0,    src: '/media/video/japan-540.mp4'  },  // 4.4 MB
  ],
  poster:      '/media/video/japan-poster.webp',
  posterJpg:   '/media/video/japan-poster.jpg',
}

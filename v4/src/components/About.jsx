import { motion } from 'framer-motion'
import BlurImage from './BlurImage'
import { CATEGORIES, webp } from '../data/photos'

// Gear — aus den EXIF-Daten der Bilder abgeleitet
const GEAR = [
  { name: 'Sony A7 IV',                  type: 'Body' },
  { name: 'Sigma 24-70mm f/2.8 DG DN Art', type: 'Objektiv' },
  { name: 'Sony FE 100-400mm f/4.5-5.6 GM OSS', type: 'Objektiv' },
  { name: 'Adobe Lightroom Classic',     type: 'Entwicklung' },
  { name: 'Adobe Premiere Pro',          type: 'Schnitt' },
]

// Ranges read back out of the photos' own EXIF, so they stay honest
// if the gallery changes.
const nums = (key) => CATEGORIES
  .flatMap(c => c.photos)
  .map(p => p[key] && parseFloat(p[key]))
  .filter(Boolean)

const focals = nums('focal')
const isos   = nums('iso')

const STATS = [
  { value: String(CATEGORIES.length), label: 'Bereiche' },
  { value: '4+', label: 'Jahre' },
  { value: `${Math.min(...focals)}–${Math.max(...focals)}`, label: 'mm Brennweite' },
  { value: `${Math.min(...isos)}–${Math.max(...isos)}`,     label: 'ISO' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] } },
}

export default function About() {
  // Portrait-Platzhalter: stärkstes Landschaftsbild, bis ein echtes Portrait da ist
  const portrait = CATEGORIES.find(c => c.id === 'landschaft').photos[0]

  return (
    <section id="about" className="py-24 md:py-32 px-6 md:px-10 border-t border-border">
      <div className="flex items-center gap-5 mb-10">
        <div className="w-8 h-px bg-fg2/40" />
        <p className="section-label">Über mich</p>
      </div>

      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-20">
        <motion.div
          variants={{ show: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          <motion.h2 variants={fadeUp}
            className="font-display text-[clamp(36px,5.5vw,68px)] font-bold tracking-tighter
              text-fg leading-[0.94] mb-8">
            Fotograf &amp;<br /><span className="text-fg2">Videograf</span>
          </motion.h2>

          <motion.p variants={fadeUp}
            className="font-display text-[15px] text-fg2 leading-relaxed max-w-lg mb-5">
            Ich bin Livio, 21 und wohne im Kanton Zürich. Angefangen hat alles mit dem
            Licht — mit Sonnenaufgängen, für die ich vor vier aufstehe, und mit
            Sonnenuntergängen, die ich bis zum letzten Rest Farbe ausreize. Der Seealpsee
            im Morgendunst, der Fuji über dem Kawaguchiko, die blaue Stunde über Shinjuku:
            Es ist immer dieselbe Jagd.
          </motion.p>

          <motion.p variants={fadeUp}
            className="font-display text-[15px] text-fg2 leading-relaxed max-w-lg mb-5">
            Auf ein Thema festlegen wollte ich mich nie. Konzerte, Motorsport, Wildlife,
            Street, Architektur — was mich interessiert, nehme ich mit. Darum sind es sieben
            Bereiche geworden statt einer Nische, und zwischen 24 und 400 Millimetern alles,
            was die Situation gerade verlangt.
          </motion.p>

          <motion.p variants={fadeUp}
            className="font-display text-[15px] text-fg2 leading-relaxed max-w-lg mb-14">
            Für Aufträge, Events und längere Projekte erreichbar.
          </motion.p>

          {/* Stats */}
          <motion.dl variants={fadeUp}
            className="grid grid-cols-2 sm:grid-cols-4 gap-5 mb-14 max-w-lg">
            {STATS.map(s => (
              <div key={s.label}>
                <dt className="font-display text-xl md:text-2xl font-bold text-fg tabular-nums
                  tracking-tighter whitespace-nowrap">{s.value}</dt>
                <dd className="font-mono text-[8px] tracking-[0.18em] text-fg2 uppercase mt-1">
                  {s.label}
                </dd>
              </div>
            ))}
          </motion.dl>

          {/* Gear */}
          <motion.div variants={fadeUp} className="max-w-lg">
            <p className="section-label mb-5">Ausrüstung</p>
            <ul className="space-y-0">
              {GEAR.map(g => (
                <li key={g.name}
                  className="flex items-baseline justify-between gap-4
                    border-b border-border py-3.5">
                  <span className="font-display text-sm text-fg">{g.name}</span>
                  <span className="font-mono text-[8px] tracking-[0.18em] text-fg2 uppercase shrink-0">
                    {g.type}
                  </span>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>

        {/* Bild */}
        <motion.figure
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="relative self-start overflow-hidden rounded-2xl"
        >
          <BlurImage
            src={webp(portrait)}
            alt={portrait.caption}
            className="w-full object-cover aspect-[4/5]"
          />
          <figcaption className="absolute bottom-3 left-3 bg-bg/75 backdrop-blur-md px-3.5 py-2">
            <p className="font-mono text-[9px] tracking-[0.18em] text-fg/85 uppercase">
              {portrait.caption}
            </p>
          </figcaption>
        </motion.figure>
      </div>
    </section>
  )
}

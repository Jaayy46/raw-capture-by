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

const STATS = [
  { value: String(CATEGORIES.reduce((n, c) => n + c.photos.length, 0)), label: 'Bilder online' },
  { value: String(CATEGORIES.length), label: 'Kategorien' },
  { value: '2',  label: 'Länder' },
  { value: '4+', label: 'Jahre' },
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
            Ich bin Livio Raschle, wohne in St. Gallen und fotografiere seit über vier Jahren.
            Am liebsten dort, wo das Licht knapp und der Moment kurz ist — auf einem Gipfel im
            Appenzell, in einem Club in der Ostschweiz oder nachts an einer Kreuzung in Tokyo.
          </motion.p>

          <motion.p variants={fadeUp}
            className="font-display text-[15px] text-fg2 leading-relaxed max-w-lg mb-14">
            Sieben Bereiche, ein Ansatz: wenig Ausrüstung, viel Geduld, und lieber ein Bild zu
            wenig als eines zu viel. Für Aufträge, Events und längere Projekte erreichbar.
          </motion.p>

          {/* Stats */}
          <motion.dl variants={fadeUp} className="grid grid-cols-4 gap-4 mb-14 max-w-lg">
            {STATS.map(s => (
              <div key={s.label}>
                <dt className="font-display text-2xl md:text-3xl font-bold text-fg tabular-nums
                  tracking-tighter">{s.value}</dt>
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
          className="relative self-start"
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

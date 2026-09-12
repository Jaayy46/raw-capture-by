import { motion } from 'framer-motion'
import BlurImage from '../ui/BlurImage'
import { CATEGORIES, webp } from '../../data/photos'
import { GEAR } from '../../data/site.js'


const STATS = [
  { value: String(CATEGORIES.length), label: 'Bereiche' },
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
            Ich bin Livio, 21, und wohne im Kanton Zürich. Angefangen hat alles vor etwa
            vier Jahren, als ich spontan eine Kamera in die Hand gedrückt bekommen habe.
            Schnell habe ich gemerkt, dass mich das sehr interessiert — und dass es mir
            vor allem Spass macht, Momente einzufangen und Erinnerungen festzuhalten.
          </motion.p>

          <motion.p variants={fadeUp}
            className="font-display text-[15px] text-fg2 leading-relaxed max-w-lg mb-5">
            Sonnenauf- und -untergänge sind etwas vom Schönsten überhaupt. Darum gebe ich
            mir Mühe, mich auch mal früh aus dem Bett zu holen, damit ich die Morgenstunden
            nicht verpasse. Der Seealpsee im Morgendunst, der Mt. Fuji im Morgenlicht, die
            blaue Stunde in Shinjuku.
          </motion.p>

          <motion.p variants={fadeUp}
            className="font-display text-[15px] text-fg2 leading-relaxed max-w-lg mb-5">
            Auf ein Thema festlegen? Eher nicht. Konzerte, Motorsport, Wildlife, Street,
            Architektur — was mich interessiert, nehme ich mit.
          </motion.p>

          <motion.p variants={fadeUp}
            className="font-display text-[15px] text-fg2 leading-relaxed max-w-lg mb-14">
            Für Aufträge, Events und längere Projekte bin ich erreichbar.
          </motion.p>

          {/* Stats */}
          <motion.dl variants={fadeUp}
            className="flex gap-14 mb-14">
            {STATS.map(s => (
              <div key={s.label}>
                <dt className="font-display text-3xl md:text-4xl font-bold text-fg tabular-nums
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

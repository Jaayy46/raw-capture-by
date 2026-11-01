import { motion } from 'framer-motion'
import { CATEGORIES } from '../data/photos.js'
import { SITE } from '../data/site.js'

/* The most characteristic thing in a photographer's world is a
   photograph, shown properly. So: one frame, uncropped by text, with
   the words beside it rather than over it — the way a print is hung
   and labelled. The whole page-load arrival happens here and nowhere
   else. */

const open = CATEGORIES.find(c => c.id === 'landschaft').photos[0]   // Seealpsee

const rise = {
  hidden: { opacity: 0, y: 18 },
  show: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.7, delay: 0.1 + i * 0.09, ease: [0.22, 1, 0.36, 1] },
  }),
}

export default function Hero() {
  const go = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section className="pt-28 md:pt-36 pb-16 md:pb-24 px-5 md:px-10">
      <div className="mx-auto max-w-[1500px] grid lg:grid-cols-[1fr_minmax(0,1.15fr)]
        gap-10 lg:gap-16 items-end">

        <div className="order-2 lg:order-1">
          <motion.h1 variants={rise} initial="hidden" animate="show" custom={0}
            className="display display-xl text-ink">
            Fotografie,<br />die bleibt
          </motion.h1>

          <motion.p variants={rise} initial="hidden" animate="show" custom={1}
            className="lede mt-6">
            Ich bin {SITE.first}, Fotograf und Videograf im {SITE.location}.
            Ich fotografiere Konzerte, Menschen und Landschaften — meistens
            dann, wenn das Licht knapp wird.
          </motion.p>

          <motion.div variants={rise} initial="hidden" animate="show" custom={2}
            className="mt-9 flex flex-wrap items-center gap-4">
            <button onClick={() => go('anfrage')}
              className="bg-ink text-paper text-[0.9375rem] font-medium
                px-7 py-3.5 hover:bg-ink2 transition-colors">
              Projekt anfragen
            </button>
            <button onClick={() => go('arbeiten')}
              className="text-[0.9375rem] text-ink2 underline underline-offset-4
                decoration-rule hover:text-ink hover:decoration-ink transition-colors
                px-1 py-3.5">
              Arbeiten ansehen
            </button>
          </motion.div>
        </div>

        <motion.figure
          initial={{ opacity: 0, scale: 1.015 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="order-1 lg:order-2 m-0"
        >
          <img
            src={`/media/full/${open.file}.webp`}
            alt={open.caption}
            width={1600} height={1066}
            fetchpriority="high"
            decoding="async"
            className="w-full h-auto aspect-[3/2] object-cover bg-paper2"
          />
          <figcaption className="mt-3 text-[0.8125rem] text-ink3">
            {open.caption}
          </figcaption>
        </motion.figure>
      </div>
    </section>
  )
}

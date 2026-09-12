import { motion } from 'framer-motion'
import { CATEGORIES, webp } from '../data/photos'

/* Platzhalter bis echte Clips da sind — Thumbnails sind echte Bilder,
   `url` später auf YouTube/Vimeo-Embeds zeigen lassen. */
const pick = (catId, i = 0) => CATEGORIES.find(c => c.id === catId).photos[i]

const REELS = [
  { title: 'Japan 2025',     sub: 'Travel Film',  thumb: pick('street', 1),      dur: '2:14', url: null },
  { title: 'Konzert Reel',   sub: 'Music',        thumb: pick('konzerte', 4),    dur: '0:48', url: null },
  { title: 'Appenzell',      sub: 'Landschaft',   thumb: pick('landschaft', 2),  dur: '1:32', url: null },
  { title: 'Tokyo Nights',   sub: 'Street',       thumb: pick('street', 5),      dur: '1:05', url: null },
  { title: 'JDM Culture',    sub: 'Motorsport',   thumb: pick('motorsport', 3),  dur: '0:56', url: null },
]

function Reel({ reel, index }) {
  return (
    <motion.article
      initial={{ opacity: 0, x: 28 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ delay: index * 0.07, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex-none w-[190px] md:w-[230px] group"
      data-cursor="play"
    >
      <div className="relative overflow-hidden aspect-[9/16] bg-bg2">
        <img
          src={webp(reel.thumb)}
          alt={reel.title}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-[900ms]
            ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-bg/20" />

        {/* Play */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border border-fg/25 bg-bg/25 backdrop-blur-sm
            flex items-center justify-center
            transition-transform duration-500 group-hover:scale-110">
            <span className="text-fg/80 text-[10px] ml-0.5">▶</span>
          </div>
        </div>

        {/* Dauer */}
        <span className="absolute top-3 right-3 font-mono text-[8px] tracking-[0.14em]
          text-fg/80 bg-bg/50 backdrop-blur-sm px-2 py-1 tabular-nums">
          {reel.dur}
        </span>

        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="font-mono text-[8px] tracking-[0.2em] text-fg2 uppercase mb-1">
            {reel.sub}
          </p>
          <p className="font-display text-sm font-medium text-fg">{reel.title}</p>
        </div>
      </div>
    </motion.article>
  )
}

export default function Videos() {
  return (
    <section id="video" className="py-24 md:py-32 border-t border-border">
      <div className="px-6 md:px-10">
        <div className="flex items-center gap-5 mb-10">
          <div className="w-8 h-px bg-fg2/40" />
          <p className="section-label">Video</p>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[clamp(40px,7vw,84px)] font-bold tracking-tighter
            text-fg leading-[0.92] mb-4"
        >
          Bewegte<br /><span className="text-fg2">Bilder</span>
        </motion.h2>

        <p className="font-display text-sm text-fg2 max-w-md mb-12">
          Vertikale Cuts aus Reisen, Konzerten und Car Meets.
        </p>
      </div>

      <div className="video-scroll px-6 md:px-10">
        {REELS.map((reel, i) => <Reel key={reel.title} reel={reel} index={i} />)}
      </div>

      <p className="px-6 md:px-10 mt-5 font-mono text-[9px] tracking-[0.22em]
        text-fg2/45 uppercase">
        ← Horizontal scrollen →
      </p>
    </section>
  )
}

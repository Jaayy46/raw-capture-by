import { useRef, useState } from 'react'
import { motion } from 'framer-motion'

const FILM = {
  title:    'Japan',
  year:     '2026',
  duration: '0:42',
  places:   'Tokyo · Osaka · Kawaguchiko',
  poster:   '/video/japan-poster.webp',
  posterFallback: '/video/japan-poster.jpg',
  src1080:  '/video/japan-1080.mp4',
  src720:   '/video/japan-720.mp4',
}

export default function Videos() {
  const videoRef = useRef(null)
  const [started, setStarted] = useState(false)

  // Nothing downloads until this runs — preload is "none" and the
  // <source> elements are only mounted on play.
  const start = () => {
    setStarted(true)
    requestAnimationFrame(() => videoRef.current?.play().catch(() => {}))
  }

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
          Ein Cut aus drei Wochen Japan — Strassen, Autos und die
          Morgenstunden am Fuji.
        </p>
      </div>

      {/* Player */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="px-6 md:px-10"
      >
        <div className="relative w-full max-w-5xl mx-auto overflow-hidden
          rounded-2xl bg-bg2 aspect-video group">

          {/* Poster — swapped out once playback starts */}
          {!started && (
            <picture>
              <source srcSet={FILM.poster} type="image/webp" />
              <img
                src={FILM.posterFallback}
                alt={`Standbild aus ${FILM.title} ${FILM.year}`}
                className="absolute inset-0 w-full h-full object-cover
                  transition-transform duration-[1200ms]
                  ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
              />
            </picture>
          )}

          <video
            ref={videoRef}
            className={`absolute inset-0 w-full h-full object-cover
              transition-opacity duration-500 ${started ? 'opacity-100' : 'opacity-0'}`}
            poster={FILM.posterFallback}
            preload="none"
            controls={started}
            playsInline
          >
            {started && <>
              <source src={FILM.src1080} type="video/mp4" media="(min-width: 1024px)" />
              <source src={FILM.src720}  type="video/mp4" />
            </>}
          </video>

          {/* Play overlay */}
          {!started && (
            <button
              onClick={start}
              aria-label={`${FILM.title} ${FILM.year} abspielen`}
              className="absolute inset-0 flex flex-col items-center justify-center
                bg-gradient-to-t from-bg/80 via-bg/10 to-bg/30
                transition-colors duration-500 hover:from-bg/70"
              data-cursor="play"
            >
              <span className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-fg/40
                bg-bg/30 backdrop-blur-sm flex items-center justify-center
                transition-transform duration-500 group-hover:scale-110">
                <span className="text-fg text-sm ml-1">▶</span>
              </span>
              <span className="font-mono text-[9px] tracking-[0.24em] text-fg/80
                uppercase mt-5">
                Film ansehen · {FILM.duration}
              </span>
            </button>
          )}
        </div>

        {/* Caption */}
        <div className="w-full max-w-5xl mx-auto mt-5 flex flex-wrap
          items-baseline justify-between gap-3">
          <div>
            <h3 className="font-display text-xl font-semibold text-fg tracking-tight">
              {FILM.title} <span className="text-fg2">{FILM.year}</span>
            </h3>
            <p className="font-mono text-[9px] tracking-[0.2em] text-fg2 uppercase mt-1.5">
              {FILM.places}
            </p>
          </div>
          <p className="font-mono text-[9px] tracking-[0.2em] text-fg2 uppercase">
            Sony A7 IV · {FILM.duration}
          </p>
        </div>
      </motion.div>
    </section>
  )
}

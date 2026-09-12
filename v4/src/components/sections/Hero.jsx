import { lazy, Suspense, useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { SITE } from '../../data/site.js'

// three + fiber + drei are ~800 kB. Kept out of the entry bundle so the
// page paints first and the corridor fades in when it is ready.
const Corridor = lazy(() => import('../../three/Corridor.jsx'))

// Phones get a lighter corridor. Checks the SHORT edge plus pointer
// type, so a handset in landscape is not mistaken for a desktop.
const isSmall = () => typeof window !== 'undefined' && (
  Math.min(window.innerWidth, window.innerHeight) < 640 ||
  window.matchMedia('(pointer: coarse)').matches
)

export default function Hero() {
  const containerRef = useRef(null)
  const scrollProg   = useRef(0)

  const [small]   = useState(isSmall)
  const [reduced] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  useEffect(() => scrollYProgress.on('change', v => { scrollProg.current = v }), [scrollYProgress])

  const introOp  = useTransform(scrollYProgress, [0,    0.16], [1, 0])
  const introY   = useTransform(scrollYProgress, [0,    0.16], ['0px', '-30px'])
  const nameOp   = useTransform(scrollYProgress, [0.55, 0.82], [0, 1])
  const nameY    = useTransform(scrollYProgress, [0.55, 0.82], ['40px', '0px'])
  const nameBlur = useTransform(scrollYProgress, [0.55, 0.82], ['blur(14px)', 'blur(0px)'])
  const barW     = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    // svh, not vh — vh jumps on mobile when the browser chrome collapses
    // mid-scroll and the sticky frame would resize under the reader.
    <section ref={containerRef} className="relative h-[420svh]" id="work">
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-bg">

        <Suspense fallback={null}>
          <motion.div
            className="absolute inset-0 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <Corridor scrollProg={scrollProg} reduced={reduced} small={small} />
          </motion.div>
        </Suspense>

        {/* Edge vignette */}
        <div className="absolute inset-0 z-20 pointer-events-none"
          style={{ background:
            'radial-gradient(ellipse 92% 88% at 50% 50%, transparent 46%, rgba(10,10,11,0.92) 100%)' }} />

        {/* Scrim behind the centred copy. On a narrow screen the frames
            crowd the middle and the text loses contrast. */}
        <div className="absolute inset-0 z-20 pointer-events-none"
          style={{ background:
            'radial-gradient(ellipse 62% 34% at 50% 50%, rgba(10,10,11,0.72) 0%, transparent 72%)' }} />

        {/* Intro — fades as the flight begins */}
        <motion.div
          style={{ opacity: introOp, y: introY }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center
            pointer-events-none px-6"
        >
          <p className="font-mono text-[10px] md:text-[11px] tracking-[0.34em]
            text-fg/70 uppercase text-center">
            {SITE.role}
          </p>
          <div className="w-px h-14 bg-gradient-to-b from-fg/40 to-transparent my-7" />
          <p className="font-mono text-[9px] tracking-[0.26em] text-fg2 uppercase text-center">
            {SITE.location} · {SITE.country}
          </p>
        </motion.div>

        {/* Name — resolves at the end of the corridor */}
        <motion.div
          style={{ opacity: nameOp, y: nameY, filter: nameBlur }}
          className="absolute inset-0 z-30 flex flex-col items-center justify-center
            pointer-events-none px-6"
        >
          <h1 className="hero-display text-fg text-center leading-[0.86]">
            Livio<br /><span className="text-fg2">Raschle</span>
          </h1>
          <p className="font-mono text-[9px] md:text-[10px] tracking-[0.28em]
            text-fg2 uppercase mt-8 text-center">
            {SITE.handle} · {SITE.camera}
          </p>
        </motion.div>

        {/* Scroll progress */}
        <div className="absolute bottom-0 inset-x-0 z-30 h-px bg-border">
          <motion.div className="h-full bg-fg/50" style={{ width: barW }} />
        </div>

        <motion.p
          style={{ opacity: introOp }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30
            font-mono text-[9px] tracking-[0.26em] text-fg2/70 uppercase pointer-events-none"
        >
          Scrollen
        </motion.p>
      </div>
    </section>
  )
}

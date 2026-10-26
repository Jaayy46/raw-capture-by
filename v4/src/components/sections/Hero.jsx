import { lazy, Suspense, useRef, useEffect, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { SITE } from '../../data/site.js'

/* The hero runs in two acts.

   Act 1 — a photograph reassembled as a cloud of points, depth taken
   from the brightness of each pixel. It gathers as you arrive, holds,
   then lets go.
   Act 2 — the camera flight through the corridor of frames.

   Both are lazy and only one renders at a time: the inactive canvas is
   parked with frameloop="never", so the GPU never pays for both. */
const PointCloud = lazy(() => import('../../three/PointCloud.jsx'))
const Corridor   = lazy(() => import('../../three/Corridor.jsx'))

const HANDOVER = 0.30   // scroll progress where act 1 gives way to act 2

// Phones get a lighter scene. Checks the SHORT edge plus pointer type,
// so a handset in landscape is not mistaken for a desktop.
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

  // Which act is live. Kept in state (not just a ref) because the
  // canvases need to re-render to flip their frameloop.
  const [act, setAct] = useState(1)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  useEffect(() => scrollYProgress.on('change', v => {
    // A bad measurement can hand us NaN; treat anything non-finite as
    // "still at the top" rather than letting it park act 1.
    const p = Number.isFinite(v) ? v : 0
    scrollProg.current = p
    const next = p < HANDOVER ? 1 : 2
    setAct(prev => (prev === next ? prev : next))
  }), [scrollYProgress])

  // Act 1 copy
  const introOp = useTransform(scrollYProgress, [0,    0.13], [1, 0])
  const introY  = useTransform(scrollYProgress, [0,    0.13], ['0px', '-28px'])
  // Crossfade between the two canvases
  const cloudOp = useTransform(scrollYProgress, [0.20, HANDOVER], [1, 0])
  const corrOp  = useTransform(scrollYProgress, [0.24, 0.38],     [0, 1])
  // Act 2 copy
  const nameOp   = useTransform(scrollYProgress, [0.62, 0.86], [0, 1])
  const nameY    = useTransform(scrollYProgress, [0.62, 0.86], ['40px', '0px'])
  const nameBlur = useTransform(scrollYProgress, [0.62, 0.86], ['blur(14px)', 'blur(0px)'])
  const barW     = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    // svh, not vh — vh jumps on mobile when the browser chrome collapses
    // mid-scroll and the sticky frame would resize under the reader.
    <section
      ref={containerRef}
      id="work"
      className="relative h-[460svh]"
      // Inline, not just the Tailwind class: Vite injects CSS through
      // JS, so on the first measure the element can still be static and
      // framer-motion then reports a bogus scroll progress.
      style={{ position: 'relative' }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-bg">

        <Suspense fallback={null}>
          {/* Act 1 — the photograph as a point cloud */}
          <motion.div className="absolute inset-0 z-10" style={{ opacity: cloudOp }}>
            <PointCloud
              scrollProg={scrollProg}
              reduced={reduced}
              small={small}
              active={act === 1}
            />
          </motion.div>

          {/* Act 2 — the corridor flight */}
          <motion.div className="absolute inset-0 z-10" style={{ opacity: corrOp }}>
            <Corridor
              scrollProg={scrollProg}
              reduced={reduced}
              small={small}
              active={act === 2}
            />
          </motion.div>
        </Suspense>

        {/* Edge vignette */}
        <div className="absolute inset-0 z-20 pointer-events-none"
          style={{ background:
            'radial-gradient(ellipse 94% 90% at 50% 50%, transparent 48%, rgba(10,10,11,0.92) 100%)' }} />

        {/* Floor gradient so the copy reads against the point field */}
        <div className="absolute inset-x-0 bottom-0 h-[26svh] z-20 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(10,10,11,0.96) 10%, transparent 100%)' }} />

        {/* Opening copy — below the cloud, not inside it */}
        <motion.div
          style={{ opacity: introOp, y: introY }}
          className="absolute inset-x-0 bottom-[7svh] z-30 flex flex-col items-center
            pointer-events-none px-6"
        >
          <p className="font-mono text-[10px] md:text-[11px] tracking-[0.34em]
            text-fg/70 uppercase text-center">
            {SITE.role}
          </p>
          <div className="w-px h-10 bg-gradient-to-b from-fg/40 to-transparent my-5" />
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
          className="absolute bottom-5 left-1/2 -translate-x-1/2 z-30
            font-mono text-[9px] tracking-[0.26em] text-fg2/70 uppercase pointer-events-none"
        >
          Scrollen
        </motion.p>
      </div>
    </section>
  )
}

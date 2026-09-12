import { useRef, useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { FILM, SITE } from '../../data/site.js'

/* Autoplay and "keep the site fast" pull against each other, so the
   film is only fetched once it is genuinely about to be seen, and not
   at all for people who should not pay for it:
     - nothing loads until the section is ~1 viewport away
     - muted + playsInline, or browsers refuse to start it anyway
     - paused whenever it scrolls out of view
     - honours prefers-reduced-motion and Save-Data, and skips autoplay
       on 2g/3g — those visitors get the poster and a play button */
const shouldAutoplay = () => {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  const c = navigator.connection
  if (c?.saveData) return false
  if (c?.effectiveType && /(^|-)2g$|^3g$/.test(c.effectiveType)) return false
  return true
}

export default function Film() {
  const sectionRef = useRef(null)
  const videoRef   = useRef(null)

  const [armed,   setArmed]   = useState(false)  // src attached → bytes flow
  const [playing, setPlaying] = useState(false)
  const [muted,   setMuted]   = useState(true)
  const [auto]                = useState(shouldAutoplay)

  // Intent, not state: the section can come into view before the file
  // is attached or buffered, in which case play() rejects. We remember
  // that we wanted to play and try again on canplay.
  const wantsPlay = useRef(false)

  const tryPlay = useCallback(() => {
    const v = videoRef.current
    if (!v || !wantsPlay.current || !v.src) return
    v.play().then(() => setPlaying(true)).catch(() => {})
  }, [])

  // Attach the right encode once armed. Setting .src + load() directly
  // is deterministic; appending <source> children to a video that has
  // already been through load() does not re-run source selection.
  useEffect(() => {
    const v = videoRef.current
    if (!armed || !v || v.src) return
    const w = window.innerWidth
    const pick = FILM.sources.find(s => w >= s.minWidth) ?? FILM.sources.at(-1)
    v.src = pick.src
    v.load()
    tryPlay()          // in case the section was already in view
  }, [armed, tryPlay])

  // Arm when near, play/pause as it enters and leaves
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return

    const arm = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setArmed(true); arm.disconnect() }
    }, { rootMargin: '100% 0px' })
    arm.observe(el)

    const play = new IntersectionObserver(([e]) => {
      const v = videoRef.current
      if (!v) return
      if (e.isIntersecting) {
        if (auto) { wantsPlay.current = true; tryPlay() }
      } else {
        wantsPlay.current = false
        v.pause()
        setPlaying(false)
      }
    }, { threshold: 0.35 })
    play.observe(el)

    return () => { arm.disconnect(); play.disconnect() }
  }, [auto, tryPlay])

  const toggle = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    setArmed(true)
    if (v.paused) { wantsPlay.current = true; tryPlay() }
    else { wantsPlay.current = false; v.pause(); setPlaying(false) }
  }, [tryPlay])

  const toggleSound = useCallback((e) => {
    e.stopPropagation()
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
    if (v.paused) v.play().then(() => setPlaying(true)).catch(() => {})
  }, [])

  return (
    <section id="video" ref={sectionRef} className="relative border-t border-border">
      {/* Full-bleed stage */}
      <div className="relative w-full h-[78svh] md:h-[92svh] overflow-hidden bg-bg2">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          poster={FILM.posterJpg}
          preload="none"
          muted
          loop
          playsInline
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onCanPlay={tryPlay}
        />

        {/* Legibility: darker at the edges, clear through the middle */}
        <div className="absolute inset-0 pointer-events-none
          bg-gradient-to-b from-bg/70 via-transparent to-bg/85" />

        {/* Click anywhere to play/pause */}
        <button
          onClick={toggle}
          aria-label={playing ? 'Film pausieren' : 'Film abspielen'}
          className="absolute inset-0 w-full h-full group"
          data-cursor="play"
        >
          {/* Centre affordance — only while stopped */}
          {!playing && (
            <span className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-fg/40
                bg-bg/30 backdrop-blur-sm flex items-center justify-center
                transition-transform duration-500 group-hover:scale-110">
                <span className="text-fg text-sm ml-1">▶</span>
              </span>
              <span className="font-mono text-[9px] tracking-[0.24em] text-fg/80 uppercase mt-5">
                Film ansehen · {FILM.duration}
              </span>
            </span>
          )}
        </button>

        {/* Title block */}
        <div className="absolute left-6 md:left-10 bottom-6 md:bottom-10
          pointer-events-none max-w-lg">
          <p className="section-label mb-3">Film</p>
          <h2 className="font-display text-[clamp(34px,6vw,72px)] font-bold tracking-tighter
            text-fg leading-[0.92]">
            {FILM.title} <span className="text-fg2">{FILM.year}</span>
          </h2>
          <p className="font-mono text-[9px] tracking-[0.2em] text-fg2 uppercase mt-3">
            {FILM.places} · {SITE.camera} · {FILM.duration}
          </p>
        </div>

        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          aria-label={muted ? 'Ton einschalten' : 'Ton ausschalten'}
          className="absolute right-6 md:right-10 bottom-6 md:bottom-10
            font-mono text-[9px] tracking-[0.2em] uppercase text-fg/80 hover:text-fg
            border border-fg/25 bg-bg/40 backdrop-blur-sm
            inline-flex items-center justify-center min-h-[44px] px-4
            transition-colors"
        >
          {muted ? '♪ Ton an' : '♪ Ton aus'}
        </button>
      </div>

      {/* Blurb below the stage */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="font-display text-sm text-fg2 max-w-md px-6 md:px-10 py-10"
      >
        {FILM.blurb}
      </motion.p>
    </section>
  )
}

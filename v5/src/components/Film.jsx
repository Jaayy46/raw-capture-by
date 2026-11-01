import { useRef, useState, useEffect, useCallback } from 'react'
import { FILM } from '../data/site.js'

/* A modest band, not a chapter. The film is worth showing — Livio
   shoots video too — but it is one piece of work, not the story the
   site is about. Nothing of it loads until the section is close, and
   it only plays on a click. */
export default function Film() {
  const sectionRef = useRef(null)
  const videoRef   = useRef(null)
  const [armed, setArmed]     = useState(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setArmed(true); io.disconnect() }
    }, { rootMargin: '100% 0px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const play = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (!v.src) {
      const w = window.innerWidth
      v.src = (FILM.sources.find(s => w >= s.minWidth) ?? FILM.sources.at(-1)).src
      v.load()
    }
    v.play().then(() => setPlaying(true)).catch(() => {})
  }, [])

  return (
    <section id="film" ref={sectionRef}
      className="bg-paper2 px-5 md:px-10 py-14 md:py-20 scroll-mt-20">
      <div className="mx-auto max-w-[1500px]
        grid md:grid-cols-[minmax(0,1fr)_minmax(0,1.9fr)] gap-6 md:gap-12 items-center">

        <div>
          <h2 className="display display-m text-ink">Auch bewegt</h2>
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink2 max-w-prose">
            {FILM.blurb}
          </p>
        </div>

        <div className="relative bg-ink/5 aspect-video overflow-hidden">
          <video
            ref={videoRef}
            poster={FILM.poster}
            preload="none"
            playsInline
            controls={playing}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {!playing && (
            <button onClick={play}
              className="absolute inset-0 w-full h-full flex items-center justify-center
                bg-ink/15 hover:bg-ink/5 transition-colors group"
              aria-label={`Film ${FILM.title} abspielen, ${FILM.duration} Minuten`}>
              <span className="flex items-center gap-3 bg-paper text-ink
                px-5 py-3 text-[0.9375rem] font-medium
                transition-transform duration-300 group-hover:scale-[1.03]">
                Film ansehen
                <span className="text-ink3 tabular-nums">{FILM.duration}</span>
              </span>
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

import { useRef, useState, useEffect, useCallback } from 'react'
import { CATEGORIES } from '../data/photos.js'
import { SERIES } from '../data/site.js'

const byFile = (f) => CATEGORIES.flatMap(c => c.photos).find(p => p.file === f)

/* The film is opt-in: nothing of it is fetched until the section is
   roughly a screen away, and it only plays after a click. A 16 MB
   autoplay on a page that is meant to load fast is a contradiction. */
export default function Series() {
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
      v.src = (SERIES.film.sources.find(s => w >= s.minWidth) ?? SERIES.film.sources.at(-1)).src
      v.load()
    }
    v.play().then(() => setPlaying(true)).catch(() => {})
  }, [])

  const frames = SERIES.frames.map(byFile).filter(Boolean)

  return (
    <section id="japan" ref={sectionRef}
      className="bg-paper2 px-5 md:px-10 py-16 md:py-24 scroll-mt-20">
      <div className="mx-auto max-w-[1500px]">

        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] gap-10 lg:gap-16">
          <div>
            <h2 className="display display-l text-ink">{SERIES.title}</h2>
            <p className="lede mt-4">{SERIES.lead}</p>
            <p className="mt-5 text-[0.9375rem] leading-relaxed text-ink2 max-w-prose">
              {SERIES.body}
            </p>
          </div>

          <div className="relative bg-ink/5 aspect-video overflow-hidden">
            <video
              ref={videoRef}
              poster={SERIES.film.poster}
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
                aria-label={`Film ${SERIES.film.title} abspielen, ${SERIES.film.duration} Minuten`}>
                <span className="flex items-center gap-3 bg-paper text-ink
                  px-6 py-3.5 text-[0.9375rem] font-medium
                  transition-transform duration-300 group-hover:scale-[1.03]">
                  Film ansehen
                  <span className="text-ink3 tabular-nums">{SERIES.film.duration}</span>
                </span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {frames.map(p => (
            <figure key={p.file} className="m-0">
              <img src={`/media/thumb/${p.file}.webp`} alt={p.caption}
                loading="lazy" decoding="async"
                className="w-full aspect-[4/5] object-cover bg-paper" />
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}

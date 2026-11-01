import { useState, useMemo, useEffect } from 'react'
import { CATEGORIES } from '../data/photos.js'
import Lightbox from './Lightbox.jsx'

const ALL = CATEGORIES.flatMap(c => c.photos.map(p => ({ ...p, cat: c.id })))

// Straight from the gallery data, so a filter can never promise a
// category the photographs do not actually have.
const FILTERS = [
  { id: 'alle', label: 'Alles', count: ALL.length },
  ...CATEGORIES.map(c => ({ id: c.id, label: c.label, count: c.photos.length })),
]

/* Unfiltered, the gallery ran 22 screens on a phone and buried
   Leistungen and the enquiry form below it. A first serving instead,
   with the rest a tap away — the pictures stay full width, which is
   the point of a portfolio, but nobody has to wade to reach the part
   that wins work. */
const FIRST_SERVING = () =>
  typeof window !== 'undefined' && window.matchMedia('(max-width: 560px)').matches ? 6 : 12

export default function Work() {
  const [filter, setFilter] = useState('alle')
  const [open, setOpen]     = useState(null)
  const [limit, setLimit]   = useState(FIRST_SERVING)

  const matching = useMemo(
    () => filter === 'alle' ? ALL : ALL.filter(p => p.cat === filter),
    [filter])

  // A new filter starts a new first serving.
  useEffect(() => { setLimit(FIRST_SERVING()) }, [filter])

  const shown  = matching.slice(0, limit)
  const hidden = matching.length - shown.length

  return (
    <section id="arbeiten" className="px-5 md:px-10 py-16 md:py-24 scroll-mt-20">
      <div className="mx-auto max-w-[1500px]">

        <div className="max-w-prose">
          <h2 className="display display-l text-ink">Arbeiten</h2>
          <p className="lede mt-4">
            Berge, Bühnen, Strassen, Tiere. Was mich interessiert, nehme ich mit —
            und das sieht man.
          </p>
        </div>

        <div role="group" aria-label="Nach Thema filtern"
          className="mt-8 flex flex-wrap gap-2">
          {FILTERS.map(l => {
            const active = filter === l.id
            const count = l.count
            return (
              <button key={l.id} onClick={() => setFilter(l.id)}
                aria-pressed={active}
                className={`text-[0.9375rem] px-4 min-h-[44px] border transition-colors
                  ${active
                    ? 'bg-ink text-paper border-ink'
                    : 'border-rule text-ink2 hover:border-ink hover:text-ink'}`}>
                {l.label}
                <span className={`ml-2 tabular-nums text-[0.8125rem]
                  ${active ? 'text-paper/60' : 'text-ink3'}`}>{count}</span>
              </button>
            )
          })}
        </div>

        <p aria-live="polite" className="sr-only">
          {shown.length} von {matching.length} Bildern werden angezeigt
        </p>

        <div className="masonry mt-10">
          {shown.map((p, i) => (
            <button
              key={p.file}
              onClick={() => setOpen(i)}
              className="block w-full group text-left"
              aria-label={`${p.caption} — grösser ansehen`}
            >
              <img
                src={`/media/thumb/${p.file}.webp`}
                alt={p.caption}
                width={900} height={Math.round(900 * (p.h / p.w))}
                loading={i < 4 ? 'eager' : 'lazy'}
                decoding="async"
                className="w-full h-auto bg-paper2 transition-opacity duration-300
                  group-hover:opacity-85"
              />
              <span className="block mt-2 mb-1 text-[0.8125rem] text-ink3
                group-hover:text-ink2 transition-colors">
                {p.caption}
              </span>
            </button>
          ))}
        </div>

        {hidden > 0 && (
          <button
            onClick={() => setLimit(matching.length)}
            className="mt-8 w-full sm:w-auto border border-rule text-ink
              px-7 min-h-[44px] py-3 text-[0.9375rem] hover:border-ink
              hover:bg-ink hover:text-paper transition-colors"
          >
            Weitere {hidden} {hidden === 1 ? 'Bild' : 'Bilder'} anzeigen
          </button>
        )}
      </div>

      {/* Lightbox gets `matching`, not `shown`: once a picture is open
          the reader is browsing and should reach every image in this
          filter without first tapping "Weitere anzeigen". shown is a
          prefix of matching, so the index still lines up.
          Plain mount/unmount. AnimatePresence held the dialog on
          screen after its state went away — and a lightbox that will
          not close is worse than one that does not fade out. */}
      {open !== null && (
        <Lightbox items={matching} index={open}
          onClose={() => setOpen(null)} onMove={setOpen} />
      )}
    </section>
  )
}

import { useState, useMemo } from 'react'
import { CATEGORIES } from '../data/photos.js'
import Lightbox from './Lightbox.jsx'

const ALL = CATEGORIES.flatMap(c => c.photos.map(p => ({ ...p, cat: c.id })))

// Straight from the gallery data, so a filter can never promise a
// category the photographs do not actually have.
const FILTERS = [
  { id: 'alle', label: 'Alles', count: ALL.length },
  ...CATEGORIES.map(c => ({ id: c.id, label: c.label, count: c.photos.length })),
]

export default function Work() {
  const [filter, setFilter] = useState('alle')
  const [open, setOpen]     = useState(null)

  const shown = useMemo(
    () => filter === 'alle' ? ALL : ALL.filter(p => p.cat === filter),
    [filter])

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
          {shown.length} Bilder werden angezeigt
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
      </div>

      {/* Plain mount/unmount. AnimatePresence held the dialog on
          screen after its state went away — and a lightbox that will
          not close is worse than one that does not fade out. */}
      {open !== null && (
        <Lightbox items={shown} index={open}
          onClose={() => setOpen(null)} onMove={setOpen} />
      )}
    </section>
  )
}

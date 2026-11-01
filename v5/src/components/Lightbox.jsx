import { useEffect, useRef, useCallback } from 'react'

/* Keyboard: arrows move, Escape closes, focus is trapped and returned.
   Touch: horizontal swipe moves. */
export default function Lightbox({ items, index, onClose, onMove }) {
  const closeRef = useRef(null)
  const touch = useRef(null)
  const item = items[index]

  const prev = useCallback(() => onMove((index - 1 + items.length) % items.length), [index, items.length, onMove])
  const next = useCallback(() => onMove((index + 1) % items.length), [index, items.length, onMove])

  // Mount only. The key handler below re-runs whenever the index
  // changes; if focus bookkeeping rode along with it, restoreTo would
  // be overwritten with a control inside the dialog and the keyboard
  // user would lose their place in the grid on close.
  useEffect(() => {
    const returnTo = document.activeElement
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
      if (returnTo instanceof HTMLElement && document.contains(returnTo)) returnTo.focus()
    }
  }, [])

  useEffect(() => {
    // On window, not on the dialog node: a real keypress lands on
    // whatever has focus, and binding to the node made Escape depend
    // on which control that happened to be.
    const onKey = (e) => {
      if (e.key === 'Escape')     { e.preventDefault(); onClose(); return }
      if (e.key === 'ArrowLeft')  { e.preventDefault(); prev();    return }
      if (e.key === 'ArrowRight') { e.preventDefault(); next();    return }
      if (e.key === 'Tab') {
        const f = [...(document.getElementById('lightbox')?.querySelectorAll('button') ?? [])]
        if (!f.length) return
        e.preventDefault()
        const i = f.indexOf(document.activeElement)
        f[(i + (e.shiftKey ? -1 : 1) + f.length) % f.length].focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, prev, next])

  if (!item) return null

  const meta = [
    ['Kamera', item.camera], ['Objektiv', item.lens], ['Brennweite', item.focal],
    ['Blende', item.aperture], ['Zeit', item.shutter], ['ISO', item.iso],
  ].filter(([, v]) => v)

  return (
    <div
      id="lightbox"
      role="dialog" aria-modal="true" aria-label={item.caption}
      tabIndex={-1}
      className="fixed inset-0 z-50 bg-paper flex flex-col animate-[fade_.2s_ease]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      onTouchStart={(e) => { touch.current = e.touches[0].clientX }}
      onTouchEnd={(e) => {
        if (touch.current == null) return
        const dx = e.changedTouches[0].clientX - touch.current
        if (Math.abs(dx) > 55) (dx > 0 ? prev : next)()
        touch.current = null
      }}
    >
      <div className="flex items-center justify-between px-5 md:px-8 h-16 shrink-0
        border-b border-rule">
        <span className="text-[0.8125rem] text-ink2 tabular-nums">
          {index + 1} von {items.length}
        </span>
        <button ref={closeRef} onClick={onClose}
          className="text-[0.9375rem] text-ink2 hover:text-ink transition-colors px-2 py-2">
          Schliessen
        </button>
      </div>

      <div className="flex-1 min-h-0 flex items-center justify-center p-4 md:p-8">
        <img
          key={item.file}
          src={`/media/full/${item.file}.webp`}
          alt={item.caption}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      <div className="shrink-0 border-t border-rule px-5 md:px-8 py-5
        flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="display display-m text-ink" style={{ fontSize: '1.25rem' }}>
            {item.caption}
          </p>
          {meta.length > 0 && (
            <dl className="mt-3 flex flex-wrap gap-x-7 gap-y-2">
              {meta.map(([k, v]) => (
                <div key={k} className="flex gap-2 text-[0.8125rem]">
                  <dt className="text-ink3">{k}</dt>
                  <dd className="text-ink2 tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
        <div className="flex gap-2">
          <button onClick={prev} aria-label="Vorheriges Bild"
            className="border border-rule px-5 py-2.5 text-[0.9375rem] text-ink2
              hover:border-ink hover:text-ink transition-colors">
            Zurück
          </button>
          <button onClick={next} aria-label="Nächstes Bild"
            className="border border-rule px-5 py-2.5 text-[0.9375rem] text-ink2
              hover:border-ink hover:text-ink transition-colors">
            Weiter
          </button>
        </div>
      </div>
    </div>
  )
}

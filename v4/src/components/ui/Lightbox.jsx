import { useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Lightbox({ item, index, total, srcFor, onClose, onPrev, onNext }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape')     onClose()
      if (e.key === 'ArrowLeft')  onPrev()
      if (e.key === 'ArrowRight') onNext()
    }
    window.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose, onPrev, onNext])

  if (!item) return null

  // Only show rows we actually have EXIF for
  const meta = [
    ['Kamera',     item.camera],
    ['Objektiv',   item.lens],
    ['Brennweite', item.focal],
    ['Blende',     item.aperture],
    ['Zeit',       item.shutter],
    ['ISO',        item.iso],
  ].filter(([, v]) => Boolean(v))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[100] bg-bg/97 backdrop-blur-2xl flex flex-col"
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 md:px-8 py-5 shrink-0">
        <span className="font-mono text-[10px] tracking-[0.2em] text-fg2 tabular-nums">
          {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
        <button
          onClick={onClose}
          className="font-mono text-[10px] tracking-[0.22em] text-fg2 hover:text-fg
            transition-colors uppercase"
        >
          Schliessen ✕
        </button>
      </div>

      {/* Image */}
      <div
        className="flex-1 min-h-0 flex items-center justify-center px-6 md:px-12"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.img
          key={item.file}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          src={srcFor(item)}
          alt={item.caption}
          className="max-w-full max-h-full object-contain rounded-xl"
        />
      </div>

      {/* Meta — slides up from below */}
      <motion.div
        key={`meta-${item.file}`}
        initial={{ y: 22, opacity: 0 }}
        animate={{ y: 0,  opacity: 1 }}
        transition={{ delay: 0.18, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="shrink-0 px-6 md:px-8 py-6 border-t border-border/60
          flex flex-wrap items-end justify-between gap-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <p className="font-display text-base text-fg mb-4">{item.caption}</p>
          <dl className="flex flex-wrap gap-x-8 gap-y-3">
            {meta.map(([label, value]) => (
              <div key={label}>
                <dt className="font-mono text-[8px] tracking-[0.22em] text-fg2 uppercase mb-1">
                  {label}
                </dt>
                <dd className="font-mono text-[11px] text-fg tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex gap-5">
          <button onClick={onPrev}
            className="font-mono text-[10px] tracking-[0.2em] text-fg2 hover:text-fg
              transition-colors uppercase">
            ← Zurück
          </button>
          <button onClick={onNext}
            className="font-mono text-[10px] tracking-[0.2em] text-fg2 hover:text-fg
              transition-colors uppercase">
            Weiter →
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

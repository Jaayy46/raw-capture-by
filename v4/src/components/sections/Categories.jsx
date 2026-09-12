import { useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BlurImage from '../ui/BlurImage'
import Lightbox from '../ui/Lightbox'
import { CATEGORIES, webp, jpg } from '../../data/photos'

/* ── Card with 3D tilt + cover parallax ─────────────────── */
function CatCard({ cat, index, onOpen }) {
  const cardRef  = useRef(null)
  const coverRef = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const cover = cat.photos[0]

  const onMove = (e) => {
    const r = cardRef.current.getBoundingClientRect()
    const px = (e.clientX - r.left) / r.width  - 0.5
    const py = (e.clientY - r.top)  / r.height - 0.5
    setTilt({ x: -py * 14, y: px * 14 })
    if (coverRef.current) {
      // Cover moves faster than the frame
      coverRef.current.style.transform =
        `translate3d(${px * 22}px, ${py * 22}px, 0) scale(1.12)`
    }
  }

  const onLeave = () => {
    setTilt({ x: 0, y: 0 })
    if (coverRef.current) coverRef.current.style.transform = 'translate3d(0,0,0) scale(1.04)'
  }

  return (
    <motion.button
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onOpen}
      initial={{ opacity: 0, y: 46 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay: (index % 4) * 0.07, ease: [0.22, 1, 0.36, 1] }}
      style={{
        transform: `perspective(1100px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.18s cubic-bezier(0.22,1,0.36,1)',
      }}
      className="cat-card group relative block w-full overflow-hidden rounded-2xl
        bg-bg2 aspect-[4/5] text-left"
    >
      <div className="absolute inset-0 overflow-hidden">
        <img
          ref={coverRef}
          src={webp(cover)}
          alt={cover.caption}
          loading={index < 3 ? 'eager' : 'lazy'}
          decoding="async"
          className="w-full h-full object-cover scale-[1.04] will-change-transform"
          style={{ transition: 'transform 0.5s cubic-bezier(0.22,1,0.36,1)' }}
        />
      </div>

      {/* Scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/25 to-transparent
        opacity-90 group-hover:opacity-75 transition-opacity duration-500" />

      {/* Index */}
      <span className="absolute top-5 left-5 font-mono text-[9px] tracking-[0.24em] text-fg/50">
        {String(index + 1).padStart(2, '0')}
      </span>

      {/* Info */}
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        <h3 className="font-display text-2xl md:text-3xl font-semibold text-fg tracking-tighter mb-1.5">
          {cat.label}
        </h3>
        <p className="font-mono text-[9px] tracking-[0.2em] text-fg2 uppercase">
          {String(cat.photos.length).padStart(2, '0')} Bilder
        </p>
      </div>

      {/* Hover CTA */}
      <span className="absolute top-4 right-4 font-mono text-[9px] tracking-[0.2em] text-fg uppercase
        border border-fg/25 px-3 py-1.5 bg-bg/40 backdrop-blur-sm
        opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0
        transition-all duration-300">
        Ansehen →
      </span>
    </motion.button>
  )
}

/* ── Category detail — masonry with morph-in ────────────── */
function CategoryView({ cat, onClose, onPhoto }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.015 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.995 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-0 z-[60] bg-bg overflow-y-auto"
    >
      <div className="sticky top-0 z-10 bg-bg/85 backdrop-blur-xl border-b border-border
        flex items-end justify-between px-6 md:px-10 py-5">
        <div>
          <p className="font-mono text-[9px] tracking-[0.22em] text-fg2 uppercase mb-1.5">
            {String(cat.photos.length).padStart(2, '0')} Bilder
          </p>
          <h2 className="font-display text-2xl md:text-3xl font-semibold text-fg tracking-tighter">
            {cat.label}
          </h2>
          <p className="font-display text-sm text-fg2 mt-1">{cat.desc}</p>
        </div>
        <button onClick={onClose}
          className="font-mono text-[10px] tracking-[0.22em] text-fg2 hover:text-fg
            transition-colors uppercase shrink-0 pb-1">
          ← Zurück
        </button>
      </div>

      <div className="p-6 md:p-10">
        <div className="masonry">
          {cat.photos.map((photo, i) => (
            <motion.figure
              key={photo.file}
              className="masonry-item group relative overflow-hidden rounded-xl bg-bg2"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <BlurImage
                src={webp(photo)}
                alt={photo.caption}
                className="w-full block object-cover cursor-none"
                onClick={() => onPhoto(i)}
              />
              <figcaption className="absolute inset-x-0 bottom-0 p-3
                bg-gradient-to-t from-bg/90 to-transparent
                opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="font-mono text-[9px] tracking-[0.16em] text-fg/90">
                  {photo.caption}
                </p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

/* ── Section ────────────────────────────────────────────── */
export default function Categories() {
  const [openId, setOpenId] = useState(null)
  const [lbIdx,  setLbIdx]  = useState(null)

  const cat = CATEGORIES.find(c => c.id === openId) ?? null

  const closeCat = useCallback(() => { setOpenId(null); setLbIdx(null) }, [])
  const prevLb = useCallback(() => cat && setLbIdx(i => (i - 1 + cat.photos.length) % cat.photos.length), [cat])
  const nextLb = useCallback(() => cat && setLbIdx(i => (i + 1) % cat.photos.length), [cat])

  return (
    <>
      <section className="py-24 md:py-32 px-6 md:px-10">
        <div className="flex items-center gap-5 mb-10">
          <div className="w-8 h-px bg-fg2/40" />
          <p className="section-label">Arbeiten</p>
        </div>

        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="font-display text-[clamp(40px,7vw,84px)] font-bold tracking-tighter
            text-fg leading-[0.92] mb-4"
        >
          Sieben<br /><span className="text-fg2">Perspektiven</span>
        </motion.h2>

        <p className="font-display text-sm text-fg2 max-w-md mb-16">
          Von den Appenzeller Alpen bis nach Tokyo — Landschaft, Street, Konzerte,
          Sport, Motorsport, Wildlife und Architektur.
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-3">
          {CATEGORIES.map((c, i) => (
            <CatCard key={c.id} cat={c} index={i} onOpen={() => setOpenId(c.id)} />
          ))}
        </div>
      </section>

      <AnimatePresence>
        {cat && (
          <CategoryView key={cat.id} cat={cat} onClose={closeCat} onPhoto={setLbIdx} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cat && lbIdx !== null && (
          <Lightbox
            item={cat.photos[lbIdx]}
            index={lbIdx}
            total={cat.photos.length}
            srcFor={webp}
            onClose={() => setLbIdx(null)}
            onPrev={prevLb}
            onNext={nextLb}
          />
        )}
      </AnimatePresence>
    </>
  )
}

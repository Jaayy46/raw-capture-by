import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const links = [
  { label: 'Arbeiten', id: 'work' },
  { label: 'Über',     id: 'about' },
  { label: 'Video',    id: 'video' },
  { label: 'Kontakt',  id: 'contact' },
]

function MagneticBtn({ children, href, onClick, className }) {
  const ref = useRef()
  const [pos, setPos] = useState({ x: 0, y: 0 })

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    setPos({
      x: (e.clientX - r.left - r.width  / 2) * 0.25,
      y: (e.clientY - r.top  - r.height / 2) * 0.25,
    })
  }
  const onLeave = () => setPos({ x: 0, y: 0 })

  const Tag = href ? 'a' : 'button'
  return (
    <Tag ref={ref} href={href} onClick={onClick}
      onMouseMove={onMove} onMouseLeave={onLeave}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      className={`magnetic inline-block ${className}`}>
      {children}
    </Tag>
  )
}

export default function Nav({ onLogoClick }) {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setOpen(false)
  }

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.7, ease: [0.22,1,0.36,1] }}
        className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-6
          transition-all duration-500
          ${scrolled ? 'bg-bg/80 backdrop-blur-md border-b border-border/50' : ''}`}
      >
        {/* Logo */}
        <MagneticBtn onClick={onLogoClick}
          className="font-mono text-xs tracking-[0.22em] text-fg/80 hover:text-fg
            transition-colors uppercase inline-flex items-center min-h-[44px] -my-3">
          raw_capture_by
        </MagneticBtn>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-10">
          {links.map(l => (
            <MagneticBtn key={l.id} onClick={() => scrollTo(l.id)}
              className="font-display text-sm text-fg2 hover:text-fg transition-colors tracking-wide">
              {l.label}
            </MagneticBtn>
          ))}
        </div>

        {/* Instagram */}
        <MagneticBtn href="https://instagram.com/raw_capture_by" target="_blank"
          className="hidden md:block font-mono text-[10px] tracking-[0.18em] text-fg2 hover:text-fg transition-colors">
          @raw_capture_by
        </MagneticBtn>

        {/* Burger (mobile) */}
        <button
          aria-label={open ? 'Menü schliessen' : 'Menü öffnen'}
          aria-expanded={open}
          className="md:hidden flex flex-col justify-center items-end gap-1.5
            -mr-3 w-11 h-11 px-3"
          onClick={() => setOpen(!open)}
        >
          <motion.span animate={{ rotate: open ? 45 : 0, y: open ? 6 : 0 }}
            className="block w-5 h-px bg-fg origin-center" />
          <motion.span animate={{ opacity: open ? 0 : 1 }}
            className="block w-5 h-px bg-fg" />
          <motion.span animate={{ rotate: open ? -45 : 0, y: open ? -6 : 0 }}
            className="block w-5 h-px bg-fg origin-center" />
        </button>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-bg/95 backdrop-blur-xl flex flex-col items-center justify-center gap-10">
            {links.map((l, i) => (
              <motion.button key={l.id}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { delay: i * 0.07 } }}
                exit={{ y: 10, opacity: 0 }}
                onClick={() => scrollTo(l.id)}
                className="hero-display text-fg/90 hover:text-fg transition-colors"
                style={{ fontSize: 'clamp(36px,8vw,72px)' }}>
                {l.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

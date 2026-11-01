import { useState, useEffect } from 'react'
import { NAV, SITE } from '../data/site.js'

export default function Nav() {
  const [open, setOpen]     = useState(false)
  const [lifted, setLifted] = useState(false)

  useEffect(() => {
    const h = () => setLifted(window.scrollY > 24)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const go = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setOpen(false)
  }

  return (
    <>
      <a href="#inhalt" className="skip">Zum Inhalt springen</a>

      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-300
          ${lifted ? 'bg-paper/92 backdrop-blur-sm border-b border-rule' : ''}`}
      >
        <div className="mx-auto max-w-[1500px] px-5 md:px-10 h-16 md:h-20
          flex items-center justify-between gap-6">

          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="display display-m text-ink hover:text-ink2 transition-colors
              inline-flex items-center min-h-[44px] -my-2"
            style={{ fontSize: '1.0625rem' }}>
            Livio Raschle
          </button>

          <nav aria-label="Hauptnavigation" className="hidden md:flex items-center gap-8">
            {NAV.slice(0, -1).map(l => (
              <button key={l.id} onClick={() => go(l.id)}
                className="text-[0.9375rem] text-ink2 hover:text-ink transition-colors
                  inline-flex items-center min-h-[44px]">
                {l.label}
              </button>
            ))}
            <button onClick={() => go('anfrage')}
              className="text-[0.9375rem] font-medium bg-ink text-paper
                px-5 py-2.5 hover:bg-ink2 transition-colors">
              Projekt anfragen
            </button>
          </nav>

          <button
            onClick={() => setOpen(v => !v)}
            aria-expanded={open}
            aria-label={open ? 'Menü schliessen' : 'Menü öffnen'}
            className="md:hidden -mr-2 w-11 h-11 flex flex-col items-center justify-center gap-[5px]"
          >
            <span className={`block w-5 h-[1.5px] bg-ink transition-transform duration-200
              ${open ? 'translate-y-[6.5px] rotate-45' : ''}`} />
            <span className={`block w-5 h-[1.5px] bg-ink transition-opacity duration-200
              ${open ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-[1.5px] bg-ink transition-transform duration-200
              ${open ? '-translate-y-[6.5px] -rotate-45' : ''}`} />
          </button>
        </div>
      </header>

      {open && (
        <div className="md:hidden fixed inset-0 z-30 bg-paper pt-20 px-5 flex flex-col">
          <nav aria-label="Hauptnavigation" className="flex flex-col gap-1 mt-6">
            {NAV.map(l => (
              <button key={l.id} onClick={() => go(l.id)}
                className="display display-l text-left text-ink py-2">
                {l.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto pb-10 text-ink2 text-[0.9375rem]">
            <a href={`mailto:${SITE.email}`} className="block py-2 hover:text-ink">{SITE.email}</a>
            <a href={`https://instagram.com/${SITE.instagram}`} target="_blank" rel="noreferrer"
              className="block py-2 hover:text-ink">Instagram</a>
          </div>
        </div>
      )}
    </>
  )
}

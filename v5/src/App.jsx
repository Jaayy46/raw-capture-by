import { useState, useEffect } from 'react'
import Nav      from './components/Nav.jsx'
import Hero     from './components/Hero.jsx'
import Work     from './components/Work.jsx'
import Film     from './components/Film.jsx'
import Services from './components/Services.jsx'
import About    from './components/About.jsx'
import Contact  from './components/Contact.jsx'
import Footer   from './components/Footer.jsx'

/* Mobile only. The fixed header already carries "Projekt anfragen"
   on desktop, so a floating copy there was redundant — and it sat in
   the bottom-right corner covering body text and captions as you
   scrolled. On mobile the header collapses to a burger, so this is
   the only standing call to action.
   It appears once the hero is behind you and steps aside when the
   form itself is on screen. */
function StickyCta() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const target = document.getElementById('anfrage')
    const onScroll = () => {
      const pastHero = window.scrollY > window.innerHeight * 0.9
      const r = target?.getBoundingClientRect()
      const atForm = r ? r.top < window.innerHeight * 0.85 : false
      setShow(pastHero && !atForm)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className={`md:hidden fixed inset-x-4 bottom-4 z-30 transition-all duration-300
      ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}>
      <button
        onClick={() => document.getElementById('anfrage')?.scrollIntoView({ behavior: 'smooth' })}
        tabIndex={show ? 0 : -1}
        aria-hidden={!show}
        className="w-full bg-ink text-paper text-[0.9375rem] font-medium px-6 py-4
          shadow-[0_2px_16px_rgba(25,27,25,0.22)] hover:bg-ink2 transition-colors"
      >
        Projekt anfragen
      </button>
    </div>
  )
}

export default function App() {
  return (
    <>
      <Nav />
      <main id="inhalt">
        <Hero />
        <Work />
        <Film />
        <Services />
        <About />
        <Contact />
      </main>
      <Footer />
      <StickyCta />
    </>
  )
}

import { useState, useEffect } from 'react'
import Nav      from './components/Nav.jsx'
import Hero     from './components/Hero.jsx'
import Work     from './components/Work.jsx'
import Series   from './components/Series.jsx'
import Services from './components/Services.jsx'
import About    from './components/About.jsx'
import Contact  from './components/Contact.jsx'
import Footer   from './components/Footer.jsx'

/* Appears once the hero is behind you and steps aside when the
   enquiry form itself is on screen — a call to action that follows
   you onto the thing it is calling you to is just noise. */
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
    <div className={`fixed bottom-4 right-4 z-30 transition-all duration-300
      ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}>
      <button
        onClick={() => document.getElementById('anfrage')?.scrollIntoView({ behavior: 'smooth' })}
        tabIndex={show ? 0 : -1}
        aria-hidden={!show}
        className="bg-ink text-paper text-[0.9375rem] font-medium px-6 py-3.5
          shadow-[0_2px_16px_rgba(25,27,25,0.18)] hover:bg-ink2 transition-colors"
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
        <Series />
        <Services />
        <About />
        <Contact />
      </main>
      <Footer />
      <StickyCta />
    </>
  )
}

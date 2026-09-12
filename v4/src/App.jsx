import { useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import CustomCursor from './components/CustomCursor'
import Nav           from './components/Nav'
import Hero          from './components/Hero'
import Categories    from './components/Categories'
import About         from './components/About'
import Videos        from './components/Videos'
import Contact       from './components/Contact'

export default function App() {
  const [shaking, setShaking] = useState(false)

  // Easter egg: logo click → images shake like Polaroids
  const triggerShake = useCallback(() => {
    if (shaking) return
    setShaking(true)
    setTimeout(() => setShaking(false), 700)
  }, [shaking])

  return (
    <div className={`grain relative ${shaking ? 'polaroid-shake' : ''}`}>
      {/* Custom cursor (desktop only) */}
      <div className="hidden md:block">
        <CustomCursor />
      </div>

      {/* Nav */}
      <Nav onLogoClick={triggerShake} />

      {/* Sections */}
      <main>
        <Hero />
        <Categories />
        <About />
        <Videos />
        <Contact />
      </main>
    </div>
  )
}

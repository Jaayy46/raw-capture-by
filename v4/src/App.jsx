import { useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import CustomCursor  from './components/ui/CustomCursor'
import ProtectImages from './components/ui/ProtectImages'
import Nav           from './components/ui/Nav'
import Hero          from './components/sections/Hero'
import Categories    from './components/sections/Categories'
import About         from './components/sections/About'
import Film          from './components/sections/Film'
import Contact       from './components/sections/Contact'

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

      <ProtectImages />

      {/* Nav */}
      <Nav onLogoClick={triggerShake} />

      {/* Sections */}
      <main>
        <Hero />
        <Categories />
        <About />
        <Film />
        <Contact />
      </main>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const [label, setLabel]   = useState('')   // '' | 'VIEW' | 'PLAY'
  const [hidden, setHidden] = useState(true)

  const rawX = useMotionValue(0)
  const rawY = useMotionValue(0)
  const x = useSpring(rawX, { damping: 22, stiffness: 280, mass: 0.5 })
  const y = useSpring(rawY, { damping: 22, stiffness: 280, mass: 0.5 })

  useEffect(() => {
    const move = (e) => {
      rawX.set(e.clientX)
      rawY.set(e.clientY)
      setHidden(false)
    }

    const over = (e) => {
      const el = e.target
      if (el.closest('img, [data-cursor="view"]')) setLabel('VIEW')
      else if (el.closest('video, [data-cursor="play"]')) setLabel('PLAY')
      else setLabel('')
    }

    window.addEventListener('mousemove', move)
    window.addEventListener('mouseover', over)
    window.addEventListener('mouseleave', () => setHidden(true))
    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', over)
      window.removeEventListener('mouseleave', () => setHidden(true))
    }
  }, [rawX, rawY])

  const big = label !== ''

  return (
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none flex items-center justify-center"
      style={{ x, y }}
      animate={{
        opacity: hidden ? 0 : 1,
        width:  big ? 64 : 10,
        height: big ? 64 : 10,
        x: big ? -32 : -5,
        y: big ? -32 : -5,
      }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <div className={`rounded-full border border-fg/60 flex items-center justify-center w-full h-full
        ${big ? 'bg-black/30 backdrop-blur-[2px]' : 'bg-fg/90'}`}>
        {big && (
          <span className="font-mono text-[9px] tracking-[0.22em] text-fg/90 select-none">
            {label}
          </span>
        )}
      </div>
    </motion.div>
  )
}

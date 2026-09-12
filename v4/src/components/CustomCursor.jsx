import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const [label, setLabel]   = useState('')   // '' | 'VIEW' | 'PLAY'
  const [hidden, setHidden] = useState(true)
  const placed = useRef(false)               // has a real position been set yet?

  const rawX = useMotionValue(-100)
  const rawY = useMotionValue(-100)
  const x = useSpring(rawX, { damping: 26, stiffness: 350, mass: 0.4 })
  const y = useSpring(rawY, { damping: 26, stiffness: 350, mass: 0.4 })

  useEffect(() => {
    const move = (e) => {
      rawX.set(e.clientX)
      rawY.set(e.clientY)
      // First sighting (or re-entry): teleport instead of springing
      // across the viewport from wherever it was parked.
      if (!placed.current) {
        placed.current = true
        x.jump(e.clientX)
        y.jump(e.clientY)
      }
      setHidden(false)
    }

    const over = (e) => {
      const el = e.target
      if (!(el instanceof Element)) return setLabel('')
      if (el.closest('img, [data-cursor="view"]'))        setLabel('VIEW')
      else if (el.closest('video, [data-cursor="play"]')) setLabel('PLAY')
      else setLabel('')
    }

    const leave = () => { setHidden(true); placed.current = false }

    window.addEventListener('mousemove', move)
    window.addEventListener('mouseover', over)
    document.documentElement.addEventListener('mouseleave', leave)
    window.addEventListener('blur', leave)

    return () => {
      window.removeEventListener('mousemove', move)
      window.removeEventListener('mouseover', over)
      document.documentElement.removeEventListener('mouseleave', leave)
      window.removeEventListener('blur', leave)
    }
  }, [rawX, rawY, x, y])

  const big = label !== ''

  return (
    // Outer node carries ONLY the position, straight off the springs.
    <motion.div
      className="fixed top-0 left-0 z-[9999] pointer-events-none"
      style={{ x, y }}
    >
      {/* Inner node centres itself on that point and handles size/opacity,
          so nothing here ever writes to x/y. */}
      <motion.div
        className={`rounded-full border border-fg/60 flex items-center justify-center
          ${big ? 'bg-black/30 backdrop-blur-[2px]' : 'bg-fg/90'}`}
        style={{ translateX: '-50%', translateY: '-50%' }}
        animate={{
          width:   big ? 64 : 10,
          height:  big ? 64 : 10,
          opacity: hidden ? 0 : 1,
        }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      >
        {big && (
          <span className="font-mono text-[9px] tracking-[0.22em] text-fg/90 select-none">
            {label}
          </span>
        )}
      </motion.div>
    </motion.div>
  )
}

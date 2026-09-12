import { useEffect } from 'react'

/* Deterrents, not protection.
 *
 * Anything the browser renders is already on the visitor's machine —
 * DevTools, the network tab, the disk cache and a plain screenshot all
 * get past every trick below, and no amount of JavaScript changes that.
 * The real defence is upstream: the site only ever serves watermarked
 * 1600/900px derivatives, so a lifted copy is fine on screen and poor
 * for print.
 *
 * What this does buy: it stops the accidental drag onto the desktop and
 * the reflexive right-click → save, which is most of what casual
 * copying actually is. It deliberately leaves normal browsing alone —
 * right-click still works everywhere except on photos.
 */
export default function ProtectImages() {
  useEffect(() => {
    const isPhoto = (t) =>
      t instanceof Element && t.closest('img, picture, video')

    const onContextMenu = (e) => { if (isPhoto(e.target)) e.preventDefault() }
    const onDragStart   = (e) => { if (isPhoto(e.target)) e.preventDefault() }

    document.addEventListener('contextmenu', onContextMenu)
    document.addEventListener('dragstart', onDragStart)

    return () => {
      document.removeEventListener('contextmenu', onContextMenu)
      document.removeEventListener('dragstart', onDragStart)
    }
  }, [])

  return null
}

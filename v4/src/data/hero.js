// Explicit extension: this module is also imported by scripts/sync-assets.mjs
// under plain Node, which does not resolve extensionless paths.
import { CATEGORIES } from './photos.js'

/* The corridor the camera flies through.

   Asymmetric on purpose — not a mirrored left/right stack. `h` drives
   a deliberate hierarchy (hero frames ~3 units, mid ~2, accents ~1.5)
   and the z rhythm clusters and opens up rather than stepping evenly.

   [file, x, y, z, h, rotZ] */
export const PICKS = [
  ['A7_06806', -3.9, -0.15,  -5.0, 3.0,  0.04],  // Seealpsee — opener
  ['_A7_8079',  3.1,  0.55,  -7.4, 2.8, -0.05],
  ['_A7_9302', -1.55, 1.75,  -9.2, 1.5,  0.09],  // accent, near the axis
  ['_A7_8226',  3.6, -0.50, -12.6, 3.5, -0.03],  // hero
  ['A7_00207', -3.3,  0.90, -14.3, 1.9,  0.07],
  ['_A7_7305', -2.2, -1.60, -16.0, 1.6, -0.06],
  ['_DSC5654',  3.3,  1.50, -19.4, 1.8,  0.05],
  ['_A7_0044', -3.7, -0.35, -21.0, 3.1, -0.04],  // hero
  ['_A7_9628',  2.4, -1.50, -23.6, 1.5,  0.08],
  ['_A7_2632', -2.6,  1.55, -26.8, 2.0, -0.07],
  ['_A7_5410',  3.5, -0.25, -28.4, 3.2,  0.03],  // hero
  ['_A7_1826', -3.2,  1.20, -31.5, 1.7,  0.06],
  ['_A7_9095',  2.6, -1.35, -34.0, 2.2, -0.05],
  ['_A7_1061', -2.9,  0.35, -37.2, 2.6,  0.04],  // closer
]

// Kept on phones when the corridor is thinned out — the big frames
// carry the composition, so the accents are the ones to drop.
const KEEP_ON_SMALL = [3, 7, 10]

export const heroFiles = () => PICKS.map(([file]) => file)

const byFile = (f) => CATEGORIES.flatMap(c => c.photos).find(p => p.file === f)

export function buildCorridor({ small = false } = {}) {
  const picks = small
    ? PICKS.filter((_, i) => i % 2 === 0 || KEEP_ON_SMALL.includes(i))
    : PICKS

  return picks.map(([file, x, y, z, h, rotZ], i) => {
    const p = byFile(file)
    const aspect = p ? p.w / p.h : 1.5
    // Toe-in: frames turn toward the flight path instead of standing
    // flat to camera. Further from the axis → turned more.
    const rotY = -Math.sign(x) * Math.min(Math.abs(x) * 0.055, 0.26)
    return {
      file,
      // Corridor frames are a few hundred px on screen. The full-size
      // originals cost ~200 MB of texture memory, so these are
      // dedicated downscales: 1200px long edge, 700px on phones.
      url: `/media/hero/${file}${small ? '@sm' : ''}.webp`,
      caption: p?.caption ?? '',
      pos: [x, y, z],
      rotZ,
      rotY,
      size: [h * aspect, h],
      phase: i * 1.37,
    }
  })
}

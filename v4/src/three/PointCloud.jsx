import { useRef, useMemo, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/* A photograph rebuilt as a cloud of points, each one taking its depth
   from the brightness of the pixel it came from. On a landscape that
   turns the tonal range into an actual relief — the ridge line stands
   forward, the water falls away behind.

   The points start scattered through the volume and gather into the
   image, then scatter again as the page scrolls on. */

const SRC = '/media/hero/A7_06806.webp'   // Seealpsee
const WORLD_W = 9      // image width in world units
const RELEASE_FROM = 0.14   // scroll point where the cloud lets go
const RELEASE_TO   = 0.50   // done before the sticky frame unpins

/* ── Sample the image into point attributes ─────────────── */
function buildGeometry(img, step) {
  const c = document.createElement('canvas')
  const w = (c.width  = Math.floor(img.naturalWidth  / step))
  const h = (c.height = Math.floor(img.naturalHeight / step))
  const ctx = c.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, w, h)
  const { data } = ctx.getImageData(0, 0, w, h)

  // Grown, not preallocated: points get culled along the border so the
  // cloud ends in a ragged edge rather than a cut rectangle.
  const target = [], scatter = [], color = [], rand = [], psize = []

  const scale  = WORLD_W / w
  const worldH = h * scale
  const smooth = (a, b, x) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
    return t * t * (3 - 2 * t)
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // Dissolve the frame: the closer to the border, the less likely a
      // point survives. Corners go first, so the silhouette reads as
      // torn rather than trimmed.
      const nx = Math.abs((x / w) * 2 - 1)
      const ny = Math.abs((y / h) * 2 - 1)
      const edge = Math.max(nx, ny) * 0.75 + Math.hypot(nx, ny) * 0.35
      if (Math.random() > 1 - smooth(0.86, 1.22, edge)) continue

      const p = (y * w + x) * 4
      const r = data[p] / 255, g = data[p + 1] / 255, b = data[p + 2] / 255

      // Rec. 709 luma drives depth, inverted: on a landscape the
      // distant haze is the BRIGHT part, so bright has to fall away
      // and the dark foreground come forward.
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b

      // Break the sampling grid — a perfect lattice reads as a screen
      // door, not a cloud.
      const jx = (Math.random() - 0.5) * scale * 1.3
      const jy = (Math.random() - 0.5) * scale * 1.3
      const jz = (Math.random() - 0.5) * 0.18

      // A few per cent drift free of the picture entirely, like embers
      // off a fire.
      const stray = Math.random() < 0.012
      const sx = stray ? (Math.random() - 0.5) * 2.6 : 0
      const sy = stray ? (Math.random() - 0.5) * 2.0 : 0
      const sz = stray ? (Math.random() - 0.5) * 2.0 : 0

      target.push(
        (x - w / 2) * scale + jx + sx,
        (h / 2 - y) * scale + jy + sy,
        (0.5 - lum) * 2.1 + jz + sz,
      )

      // Start somewhere in a loose shell around the final shape
      const a = Math.random() * Math.PI * 2
      const rad = 5 + Math.random() * 9
      scatter.push(
        Math.cos(a) * rad,
        (Math.random() - 0.5) * worldH * 2.4,
        Math.sin(a) * rad - 4,
      )

      // Lift the darks a little, or the shadows vanish against the page
      const lift = 0.22
      color.push(
        r * (1 - lift) + lift * 0.5,
        g * (1 - lift) + lift * 0.5,
        b * (1 - lift) + lift * 0.55,
      )

      rand.push(Math.random())
      // Uneven grain: strays and a scatter of others sit larger
      psize.push(stray ? 1.6 + Math.random() * 0.9 : 0.6 + Math.random() * 0.9)
    }
  }

  const count = rand.length
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(target, 3))
  geo.setAttribute('aTarget',  new THREE.Float32BufferAttribute(target, 3))
  geo.setAttribute('aScatter', new THREE.Float32BufferAttribute(scatter, 3))
  geo.setAttribute('color',    new THREE.Float32BufferAttribute(color, 3))
  geo.setAttribute('aRand',    new THREE.Float32BufferAttribute(rand, 1))
  geo.setAttribute('aSize',    new THREE.Float32BufferAttribute(psize, 1))
  geo.computeBoundingSphere()
  return { geo, count, worldH, aspect: h / w }
}

const VERT = /* glsl */`
  attribute vec3  aTarget;
  attribute vec3  aScatter;
  attribute float aRand;
  attribute float aSize;
  uniform float uProgress;   // 0 scattered -> 1 gathered
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  varying vec3  vColor;
  varying float vFade;

  void main() {
    // Stagger per point so the image assembles rather than snapping
    float t = clamp(uProgress * 1.55 - aRand * 0.55, 0.0, 1.0);
    t = t * t * (3.0 - 2.0 * t);

    vec3 pos = mix(aScatter, aTarget, t);

    // A slow breath so the cloud never looks frozen
    float drift = sin(uTime * 0.5 + aRand * 6.2831) * 0.035;
    pos.z += drift * (0.4 + t * 0.6);

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;

    // Perspective attenuation, clamped so near points do not blow up
    gl_PointSize = uSize * aSize * uPixelRatio * (9.0 / max(-mv.z, 0.6));
    gl_PointSize = clamp(gl_PointSize, 1.0, 10.0);

    vColor = color;
    vFade  = t;
  }
`

const FRAG = /* glsl */`
  varying vec3  vColor;
  varying float vFade;

  void main() {
    // Round, soft-edged points — square ones read as noise
    vec2 c = gl_PointCoord - 0.5;
    float d2 = dot(c, c);
    if (d2 > 0.25) discard;
    float a = smoothstep(0.25, 0.04, d2);

    // Scattered points stay dim; they firm up as they find their place
    gl_FragColor = vec4(vColor, a * (0.12 + vFade * 0.88));
  }
`

function Cloud({ scrollProg, reduced, step, small }) {
  const points = useRef()
  const matRef = useRef()
  const [built, setBuilt] = useState(null)
  const { size, viewport } = useThree()
  const mouse = useRef({ x: 0, y: 0 })

  useEffect(() => {
    let cancelled = false
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => { if (!cancelled) setBuilt(buildGeometry(img, step)) }
    img.src = SRC
    return () => { cancelled = true }
  }, [step])

  useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth  - 0.5) * 2
      mouse.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', onMove)
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  const uniforms = useMemo(() => ({
    uProgress:   { value: 0 },
    uTime:       { value: 0 },
    uSize:       { value: small ? 2.0 : 2.4 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
  }), [])

  const entry = useRef(0)

  useFrame((state, dt) => {
    if (!points.current) return
    const sp = scrollProg.current

    // Gathering is an ARRIVAL, not a scroll reward: the cloud pulls
    // itself into the photograph on its own over the first couple of
    // seconds. Scrolling only ever lets it go again.
    entry.current = Math.min(1, entry.current + dt / 2.2)
    const release = THREE.MathUtils.smoothstep(sp, RELEASE_FROM, RELEASE_TO)
    uniforms.uProgress.value = entry.current * (1 - release)
    uniforms.uTime.value += dt

    if (reduced) return

    // The cloud turns gently and leans toward the pointer
    const o = points.current
    o.rotation.y += ((mouse.current.x * 0.20) - o.rotation.y) * 0.03
    o.rotation.x += ((-mouse.current.y * 0.12) - o.rotation.x) * 0.03
    o.rotation.z = Math.sin(state.clock.elapsedTime * 0.08) * 0.015
  })

  if (!built) return null

  // Fit the WHOLE frame with margin — width and height both, since
  // points sitting nearer the camera overshoot a width-only fit.
  const worldH = WORLD_W * (built.aspect ?? 0.66)
  // A phone is tall and narrow, so a desktop-sized margin shrinks the
  // cloud until the points close up and it reads as a plain photo.
  // Let it run nearly full width there instead.
  const fit = Math.min(
    (viewport.width  * (small ? 0.96 : 0.72)) / WORLD_W,
    (viewport.height * (small ? 0.46 : 0.62)) / worldH,
  )

  return (
    <points ref={points} geometry={built.geo} scale={fit}
      position={[0, viewport.height * 0.08, 0]}>
      <shaderMaterial
        ref={matRef}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
        vertexColors
      />
    </points>
  )
}

export default function PointCloud({ scrollProg, reduced, small }) {
  // Coarser sampling on phones: step 3 over a 1200px source is ~107k
  // points, step 5 is ~38k.
  const step = small ? 4 : 3

  return (
    <Canvas
      dpr={small ? [1, 1.5] : [1, 2]}
      camera={{ fov: 50, position: [0, 0, 7.5], near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <Cloud scrollProg={scrollProg} reduced={reduced} step={step} small={small} />
    </Canvas>
  )
}

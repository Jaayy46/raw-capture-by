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
const DEPTH = 5.0     // relief amplitude, world units
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
      // No frame at all. A rectangular falloff still reads as a box,
      // however ragged its edge, so the mask is radial and wobbled —
      // the silhouette has no straight run anywhere, and the density
      // thins out over a long distance rather than stopping.
      const nx = (x / w) * 2 - 1
      const ny = (y / h) * 2 - 1
      const ang = Math.atan2(ny, nx)
      const wobble = 0.80
        + 0.20 * Math.sin(ang * 3 + 1.3)
        + 0.11 * Math.sin(ang * 7 - 0.6)
        + 0.06 * Math.sin(ang * 13 + 2.1)
      const dist = Math.hypot(nx, ny * 0.92) / wobble
      if (Math.random() > 1 - smooth(0.58, 1.14, dist)) continue

      const p = (y * w + x) * 4
      const r = data[p] / 255, g = data[p + 1] / 255, b = data[p + 2] / 255

      // Rec. 709 luma drives depth, inverted: on a landscape the
      // distant haze is the BRIGHT part, so bright has to fall away
      // and the dark foreground come forward.
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b

      // Break the sampling grid — a perfect lattice reads as a screen
      // door, not a cloud.
      const jx = (Math.random() - 0.5) * scale * 0.75
      const jy = (Math.random() - 0.5) * scale * 0.75
      const jz = (Math.random() - 0.5) * 0.22

      // A few per cent drift free of the picture entirely, like embers
      // off a fire.
      const stray = Math.random() < 0.05
      const sx = stray ? (Math.random() - 0.5) * 5.5 : 0
      const sy = stray ? (Math.random() - 0.5) * 4.2 : 0
      const sz = stray ? (Math.random() - 0.5) * 3.0 : 0

      target.push(
        (x - w / 2) * scale + jx + sx,
        (h / 2 - y) * scale + jy + sy,
        (0.5 - lum) * DEPTH + jz + sz,
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
      psize.push(stray ? 1.8 + Math.random() * 1.0 : 0.8 + Math.random() * 0.5)
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
  varying float vDepth;

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
    vDepth = -mv.z;
  }
`

const FRAG = /* glsl */`
  uniform vec3  uFogColor;
  uniform float uFogNear;
  uniform float uFogFar;
  varying vec3  vColor;
  varying float vFade;
  varying float vDepth;

  void main() {
    // Round, soft-edged points — square ones read as noise
    vec2 c = gl_PointCoord - 0.5;
    float d2 = dot(c, c);
    if (d2 > 0.25) discard;
    float a = smoothstep(0.25, 0.11, d2);

    // Aerial perspective: points further into the scene wash out
    // toward the page and dim. This is what makes the relief read as
    // a volume rather than a flat field of dots.
    float fog = smoothstep(uFogNear, uFogFar, vDepth);
    vec3 col = mix(vColor, uFogColor, fog * 0.62);

    // Scattered points stay dim; they firm up as they find their place
    gl_FragColor = vec4(col, a * (0.12 + vFade * 0.88) * (1.0 - fog * 0.40));
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
    uSize:       { value: small ? 2.0 : 2.3 },
    uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    uFogColor:   { value: new THREE.Color('#0A0A0B') },
    uFogNear:    { value: 5.6 },
    uFogFar:     { value: 11.5 },
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

    // Depth and sharpness pull against each other: a deep relief seen
    // at an angle projects its near and far faces onto each other and
    // the picture smears. So the resting pose is nearly square to
    // camera — where a height field projects back to the original
    // image — and the turn that shows the volume comes from the
    // pointer, with only a slight drift when nobody is there.
    const o = points.current
    const t = state.clock.elapsedTime
    const yaw   = Math.sin(t * 0.13) * 0.07 + mouse.current.x * 0.34
    const pitch = Math.sin(t * 0.09) * 0.03 - 0.02 - mouse.current.y * 0.18
    o.rotation.y += (yaw   - o.rotation.y) * 0.03
    o.rotation.x += (pitch - o.rotation.x) * 0.03
    o.rotation.z = Math.sin(t * 0.07) * 0.012
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
  const step = small ? 3 : 2

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

import { Suspense, useRef, useEffect, useState, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture, useProgress } from '@react-three/drei'
import { motion, useScroll, useTransform } from 'framer-motion'
import * as THREE from 'three'
import { CATEGORIES, webp } from '../data/photos'

/* ────────────────────────────────────────────────────────
   Corridor layout — the camera flies THROUGH these.
   Picked for visual punch across categories.
   ──────────────────────────────────────────────────────── */
const byFile = (f) => CATEGORIES.flatMap(c => c.photos).find(p => p.file === f)

/* Asymmetric composition, not a mirrored L/R stack.
   h drives a deliberate hierarchy — hero frames (~3+), mid (~2),
   accents (~1.5) — and the z rhythm clusters and opens up rather
   than stepping evenly.
   [file, x, y, z, h, rotZ] */
const PICKS = [
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

// Phones get a lighter corridor: every other frame, keeping the heroes.
// Checks the SHORT edge plus pointer type, so a handset in landscape
// (innerWidth ~812) is still treated as a phone.
const SMALL = typeof window !== 'undefined' && (
  Math.min(window.innerWidth, window.innerHeight) < 640 ||
  window.matchMedia('(pointer: coarse)').matches
)

const buildLayout = (picks) => picks.map(([file, x, y, z, h, rotZ], i) => {
  const p = byFile(file)
  const aspect = p ? p.w / p.h : 1.5
  // Toe-in: frames turn to face the flight path instead of standing
  // flat to camera. Further out from the axis → turned more.
  const rotY = -Math.sign(x) * Math.min(Math.abs(x) * 0.055, 0.26)
  return {
    file,
    // Corridor frames are a few hundred px on screen — the full-size
    // originals would cost ~200 MB of texture memory. Dedicated
    // downscales: 1200px long edge, 700px on phones.
    url: `/images/hero/${file}${SMALL ? '@sm' : ''}.webp`,
    caption: p?.caption ?? '',
    pos: [x, y, z],
    rotZ,
    rotY,
    size: [h * aspect, h],
    phase: i * 1.37,
  }
})

const LAYOUT = buildLayout(
  SMALL ? PICKS.filter((_, i) => i % 2 === 0 || [3, 7, 10].includes(i)) : PICKS
)

const URLS = LAYOUT.map(l => l.url)

/* ── Shader: chromatic aberration + vignette + fog ─────── */
const VERT = /* glsl */`
  varying vec2 vUv;
  varying float vFogDepth;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vFogDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`

const FRAG = /* glsl */`
  uniform sampler2D uTex;
  uniform float uOpacity;
  uniform float uAberration;
  uniform vec3  uFogColor;
  uniform float uFogNear;
  uniform float uFogFar;
  uniform vec2  uSize;     // plane size in world units
  uniform float uRadius;   // corner radius, world units
  uniform float uAA;       // edge antialias width, world units
  uniform float uFocal;    // distance of the sharp plane
  uniform float uDofRange; // how fast focus falls away
  uniform float uMaxBlur;  // max mip bias
  varying vec2  vUv;
  varying float vFogDepth;

  // Signed distance to a rounded box — negative inside
  float sdRoundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r;
  }

  void main() {
    vec2 c  = vUv - 0.5;
    float r2 = dot(c, c);

    // ── Depth of field ──────────────────────────────────
    // Circle of confusion from the distance to the focal plane,
    // spent as a mip bias: frames resolve as they reach focus and
    // soften again as they pass. Cheap, and it reads like a lens.
    float coc  = clamp(abs(vFogDepth - uFocal) / uDofRange, 0.0, 1.0);
    coc = pow(coc, 1.35);
    float bias = coc * uMaxBlur;

    // Lateral chromatic aberration, stronger where defocused —
    // the way a real lens misbehaves off the focal plane.
    vec2 off = c * r2 * uAberration * (0.35 + coc * 1.6);
    float rC = texture2D(uTex, vUv + off, bias).r;
    float gC = texture2D(uTex, vUv,       bias).g;
    float bC = texture2D(uTex, vUv - off, bias).b;
    vec3 col = vec3(rC, gC, bC);

    // Defocused frames sit back in the mix
    col *= mix(1.0, 0.62, coc);

    // Light interior vignette only — the edge itself stays crisp
    float vig = smoothstep(0.78, 0.06, r2);
    col *= mix(0.88, 1.0, vig);

    // ── Crisp edge ──────────────────────────────────────
    // Precise rounded rectangle, antialiased over a hair's width
    // instead of dissolved over a wide feather.
    vec2  p      = c * uSize;
    vec2  extent = uSize * 0.5 - uAA;
    float d      = sdRoundBox(p, extent, uRadius);
    float mask   = 1.0 - smoothstep(-uAA, uAA, d);

    // Thin inner rim so the frame reads as a printed edge,
    // and fades out as the frame goes soft.
    float rim = smoothstep(-uRadius * 0.55, -uAA, d) * mask;
    col = mix(col, vec3(1.0), rim * 0.16 * (1.0 - coc));

    // Distance fog toward page background
    float f = smoothstep(uFogNear, uFogFar, vFogDepth);
    col = mix(col, uFogColor, f);

    gl_FragColor = vec4(col, uOpacity * mask * (1.0 - f * 0.85));
  }
`

function PhotoPlane({ item, texture, aberration }) {
  const mesh = useRef()
  const mat  = useRef()

  const uniforms = useMemo(() => {
    const [w, h] = item.size
    return {
      uTex:        { value: texture },
      uOpacity:    { value: 1 },
      uAberration: { value: aberration },
      uFogColor:   { value: new THREE.Color('#0A0A0B') },
      uFogNear:    { value: 10 },
      uFogFar:     { value: 34 },
      uSize:       { value: new THREE.Vector2(w, h) },
      uRadius:     { value: Math.min(w, h) * 0.055 },
      uAA:         { value: Math.min(w, h) * 0.006 },
      uFocal:      { value: 8.5 },
      uDofRange:   { value: 15 },
      uMaxBlur:    { value: 2.4 },
    }
  }, [texture, aberration, item.size])

  useFrame((state) => {
    if (!mesh.current) return
    const t = state.clock.elapsedTime
    // Gentle drift — each plane on its own phase, around its toe-in
    mesh.current.position.y = item.pos[1] + Math.sin(t * 0.35 + item.phase) * 0.07
    mesh.current.rotation.z = item.rotZ + Math.sin(t * 0.22 + item.phase) * 0.010
    mesh.current.rotation.y = item.rotY + Math.sin(t * 0.18 + item.phase) * 0.025
  })

  return (
    <mesh ref={mesh} position={item.pos} rotation={[0, item.rotY, item.rotZ]}>
      <planeGeometry args={item.size} />
      <shaderMaterial
        ref={mat}
        vertexShader={VERT}
        fragmentShader={FRAG}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

/* ── Camera rig: scroll dolly + damped mouse parallax ──── */
function Rig({ scrollProg, reduced }) {
  const { camera } = useThree()
  const target = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const move = (e) => {
      target.current.x = (e.clientX / window.innerWidth  - 0.5) * 2
      target.current.y = (e.clientY / window.innerHeight - 0.5) * 2
    }
    window.addEventListener('pointermove', move)
    return () => window.removeEventListener('pointermove', move)
  }, [])

  useFrame(() => {
    const sp = scrollProg.current
    // Dolly forward through the corridor
    const zTarget = 1.5 - sp * 42

    if (reduced) {
      camera.position.set(0, 0, zTarget)
      camera.lookAt(0, 0, zTarget - 1)
      return
    }

    // The path itself curves through the corridor rather than running
    // dead straight — the frames slide past at changing angles.
    const driftX = Math.sin(sp * Math.PI * 1.6) * 0.95
    const driftY = Math.cos(sp * Math.PI * 1.15) * 0.32 - 0.32

    camera.position.z += (zTarget - camera.position.z) * 0.09
    camera.position.x += ((driftX + target.current.x * 0.7) - camera.position.x) * 0.045
    camera.position.y += ((driftY - target.current.y * 0.42) - camera.position.y) * 0.045
    // Bank into the turn — reads as flight, not a slider
    const bank = -(target.current.x * 0.018) - Math.cos(sp * Math.PI * 1.6) * 0.03
    camera.rotation.z += (bank - camera.rotation.z) * 0.04
    camera.lookAt(camera.position.x * 0.3, camera.position.y * 0.3, camera.position.z - 8)
  })

  return null
}

function Scene({ scrollProg, reduced, aberration }) {
  const textures = useTexture(URLS)
  useMemo(() => {
    textures.forEach(t => {
      // Raw sRGB passthrough — the shader writes final colour itself
      t.colorSpace     = THREE.LinearSRGBColorSpace
      t.minFilter      = THREE.LinearMipmapLinearFilter
      t.magFilter      = THREE.LinearFilter
      t.generateMipmaps = true   // the DOF mip bias depends on these
      t.anisotropy     = 8
      t.needsUpdate    = true
    })
  }, [textures])

  return (
    <>
      <Rig scrollProg={scrollProg} reduced={reduced} />
      {LAYOUT.map((item, i) => (
        <PhotoPlane key={item.file} item={item} texture={textures[i]} aberration={aberration} />
      ))}
    </>
  )
}

/* ── Loader ─────────────────────────────────────────────── */
function Loader({ done }) {
  const { progress } = useProgress()
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: done ? 0 : 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-0 z-[200] bg-bg flex flex-col items-center justify-center
        ${done ? 'pointer-events-none' : ''}`}
    >
      <p className="font-mono text-[10px] tracking-[0.32em] text-fg2 uppercase mb-6">
        raw_capture_by
      </p>
      <div className="w-40 h-px bg-border relative overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 bg-fg"
          animate={{ width: `${progress}%` }}
          transition={{ ease: 'easeOut', duration: 0.3 }}
        />
      </div>
      <p className="font-mono text-[9px] tracking-[0.22em] text-fg2/60 mt-4 tabular-nums">
        {Math.round(progress)}%
      </p>
    </motion.div>
  )
}

/* ── Hero ───────────────────────────────────────────────── */
export default function Hero() {
  const containerRef = useRef(null)
  const scrollProg   = useRef(0)
  const [ready, setReady]   = useState(false)
  const [reduced]           = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [isSmall]           = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 520)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  useEffect(() => scrollYProgress.on('change', v => { scrollProg.current = v }), [scrollYProgress])
  useEffect(() => { const t = setTimeout(() => setReady(true), 1200); return () => clearTimeout(t) }, [])

  // HTML layer transforms
  const introOp = useTransform(scrollYProgress, [0,    0.16], [1, 0])
  const introY  = useTransform(scrollYProgress, [0,    0.16], ['0px', '-30px'])
  const nameOp  = useTransform(scrollYProgress, [0.55, 0.82], [0, 1])
  const nameY   = useTransform(scrollYProgress, [0.55, 0.82], ['40px', '0px'])
  const nameBlur= useTransform(scrollYProgress, [0.55, 0.82], ['blur(14px)', 'blur(0px)'])
  const barW    = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  return (
    <>
      <Loader done={ready} />

      {/* svh, not vh — vh jumps on mobile when the browser chrome
          collapses mid-scroll and the sticky frame would resize. */}
      <section ref={containerRef} className="relative h-[420svh]" id="work">
        <div className="sticky top-0 h-[100svh] overflow-hidden bg-bg">

          {/* 3D corridor */}
          <div className="absolute inset-0 z-10">
            <Canvas
              // Cap DPR on phones — a 3x retina buffer of this scene is
              // a lot of fill rate for no visible gain at this size.
              dpr={isSmall ? [1, 1.5] : [1, 2]}
              camera={{ fov: 58, position: [0, 0, 1.5], near: 0.1, far: 60 }}
              gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
              onCreated={({ gl }) => gl.setClearColor('#0A0A0B', 1)}
            >
              <Suspense fallback={null}>
                <Scene
                  scrollProg={scrollProg}
                  reduced={reduced}
                  aberration={isSmall ? 0 : 0.022}
                />
              </Suspense>
            </Canvas>
          </div>

          {/* Edge vignette */}
          <div className="absolute inset-0 z-20 pointer-events-none"
            style={{ background:
              'radial-gradient(ellipse 92% 88% at 50% 50%, transparent 46%, rgba(10,10,11,0.92) 100%)' }} />

          {/* Scrim behind the centred copy. On a narrow screen the
              frames crowd the middle and the text loses contrast. */}
          <div className="absolute inset-0 z-20 pointer-events-none"
            style={{ background:
              'radial-gradient(ellipse 62% 34% at 50% 50%, rgba(10,10,11,0.72) 0%, transparent 72%)' }} />

          {/* Intro — fades as the flight begins */}
          <motion.div
            style={{ opacity: introOp, y: introY }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none px-6"
          >
            <p className="font-mono text-[10px] md:text-[11px] tracking-[0.34em] text-fg/70 uppercase text-center">
              Fotografie &amp; Film
            </p>
            <div className="w-px h-14 bg-gradient-to-b from-fg/40 to-transparent my-7" />
            <p className="font-mono text-[9px] tracking-[0.26em] text-fg2 uppercase text-center">
              St. Gallen · Schweiz
            </p>
          </motion.div>

          {/* Name — resolves at the end of the corridor */}
          <motion.div
            style={{ opacity: nameOp, y: nameY, filter: nameBlur }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center pointer-events-none px-6"
          >
            <h1 className="hero-display text-fg text-center leading-[0.86]">
              Livio<br />
              <span className="text-fg2">Raschle</span>
            </h1>
            <p className="font-mono text-[9px] md:text-[10px] tracking-[0.28em] text-fg2 uppercase mt-8 text-center">
              raw_capture_by · Sony A7 IV
            </p>
          </motion.div>

          {/* Scroll progress bar */}
          <div className="absolute bottom-0 inset-x-0 z-30 h-px bg-border">
            <motion.div className="h-full bg-fg/50" style={{ width: barW }} />
          </div>

          {/* Scroll hint */}
          <motion.p
            style={{ opacity: introOp }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30
              font-mono text-[9px] tracking-[0.26em] text-fg2/70 uppercase pointer-events-none"
          >
            Scrollen
          </motion.p>
        </div>
      </section>
    </>
  )
}

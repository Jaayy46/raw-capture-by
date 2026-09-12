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

const PICKS = [
  ['A7_06806', -3.6,  0.35, -0.10],
  ['_A7_8079',  3.4, -0.20, -0.14],
  ['_A7_9302', -2.9,  1.55,  0.08],
  ['_A7_8226',  3.0,  0.90, -0.16],
  ['A7_00207', -3.5, -1.30,  0.12],
  ['_A7_7305',  2.7, -1.45, -0.10],
  ['_DSC5654', -3.2,  1.20,  0.14],
  ['_A7_0044',  3.5,  0.10, -0.12],
  ['_A7_2632', -2.8, -0.85,  0.10],
  ['_A7_9628',  3.1,  1.50, -0.15],
  ['_A7_5410', -3.4,  0.05,  0.11],
  ['_A7_1826',  2.9, -1.10, -0.09],
]

// Depth spacing: first plane near, then receding
const LAYOUT = PICKS.map(([file, x, y, rot], i) => {
  const p = byFile(file)
  const z = -4.5 - i * 3.1
  const aspect = p ? p.w / p.h : 1.5
  const h = 2.5
  return {
    file,
    url: webp(p),
    caption: p?.caption ?? '',
    pos: [x, y, z],
    rot,
    size: [h * aspect, h],
    phase: i * 1.37,
  }
})

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
  varying vec2  vUv;
  varying float vFogDepth;

  void main() {
    vec2 c  = vUv - 0.5;
    float r2 = dot(c, c);

    // Chromatic aberration — grows toward the edges
    vec2 off = c * r2 * uAberration;
    float rC = texture2D(uTex, vUv + off).r;
    float gC = texture2D(uTex, vUv).g;
    float bC = texture2D(uTex, vUv - off).b;
    vec3 col = vec3(rC, gC, bC);

    // Per-plane vignette
    float vig = smoothstep(0.62, 0.10, r2);
    col *= mix(0.42, 1.0, vig);

    // Distance fog toward page background
    float f = smoothstep(uFogNear, uFogFar, vFogDepth);
    col = mix(col, uFogColor, f);

    gl_FragColor = vec4(col, uOpacity * (1.0 - f * 0.85));
  }
`

function PhotoPlane({ item, texture, aberration }) {
  const mesh = useRef()
  const mat  = useRef()

  const uniforms = useMemo(() => ({
    uTex:        { value: texture },
    uOpacity:    { value: 1 },
    uAberration: { value: aberration },
    uFogColor:   { value: new THREE.Color('#0A0A0B') },
    uFogNear:    { value: 6 },
    uFogFar:     { value: 30 },
  }), [texture, aberration])

  useFrame((state) => {
    if (!mesh.current) return
    const t = state.clock.elapsedTime
    // Gentle drift — each plane on its own phase
    mesh.current.position.y = item.pos[1] + Math.sin(t * 0.35 + item.phase) * 0.09
    mesh.current.rotation.z = item.rot + Math.sin(t * 0.22 + item.phase) * 0.012
    mesh.current.rotation.y = Math.sin(t * 0.18 + item.phase) * 0.05
  })

  return (
    <mesh ref={mesh} position={item.pos} rotation={[0, 0, item.rot]}>
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

    camera.position.z += (zTarget - camera.position.z) * 0.09
    camera.position.x += (target.current.x * 0.85 - camera.position.x) * 0.045
    camera.position.y += (-target.current.y * 0.5 - camera.position.y) * 0.045
    // Slight roll into the turn
    camera.rotation.z += ((-target.current.x * 0.02) - camera.rotation.z) * 0.04
    camera.lookAt(camera.position.x * 0.25, camera.position.y * 0.25, camera.position.z - 8)
  })

  return null
}

function Scene({ scrollProg, reduced, aberration }) {
  const textures = useTexture(URLS)
  useMemo(() => {
    textures.forEach(t => {
      // Raw sRGB passthrough — the shader writes final colour itself
      t.colorSpace = THREE.LinearSRGBColorSpace
      t.minFilter  = THREE.LinearMipmapLinearFilter
      t.anisotropy = 8
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

      <section ref={containerRef} className="relative h-[420vh]" id="work">
        <div className="sticky top-0 h-screen overflow-hidden bg-bg">

          {/* 3D corridor */}
          <div className="absolute inset-0 z-10">
            <Canvas
              dpr={[1, 2]}
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

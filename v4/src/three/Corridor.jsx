import { Suspense, useRef, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'
import * as THREE from 'three'
import { buildCorridor } from '../data/hero.js'

/* Everything in this file pulls in three + fiber + drei (~800 kB).
   It is loaded lazily by Hero so the page can paint without it. */

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

  // Signed distance to a rounded box — negative inside.
  // NB: do not name the half-extent "half" — reserved in GLSL ES.
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

    col *= mix(1.0, 0.62, coc);            // defocus sits back in the mix

    float vig = smoothstep(0.78, 0.06, r2);
    col *= mix(0.88, 1.0, vig);

    // ── Crisp edge ──────────────────────────────────────
    vec2  p      = c * uSize;
    vec2  extent = uSize * 0.5 - uAA;
    float d      = sdRoundBox(p, extent, uRadius);
    float mask   = 1.0 - smoothstep(-uAA, uAA, d);

    // Thin inner rim so the frame reads as a printed edge,
    // fading out as the frame goes soft.
    float rim = smoothstep(-uRadius * 0.55, -uAA, d) * mask;
    col = mix(col, vec3(1.0), rim * 0.16 * (1.0 - coc));

    float f = smoothstep(uFogNear, uFogFar, vFogDepth);
    col = mix(col, uFogColor, f);

    gl_FragColor = vec4(col, uOpacity * mask * (1.0 - f * 0.85));
  }
`

function PhotoPlane({ item, texture, aberration }) {
  const mesh = useRef()

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
    mesh.current.position.y = item.pos[1] + Math.sin(t * 0.35 + item.phase) * 0.07
    mesh.current.rotation.z = item.rotZ + Math.sin(t * 0.22 + item.phase) * 0.010
    mesh.current.rotation.y = item.rotY + Math.sin(t * 0.18 + item.phase) * 0.025
  })

  return (
    <mesh ref={mesh} position={item.pos} rotation={[0, item.rotY, item.rotZ]}>
      <planeGeometry args={item.size} />
      <shaderMaterial
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
    const zTarget = 1.5 - sp * 42

    if (reduced) {
      camera.position.set(0, 0, zTarget)
      camera.lookAt(0, 0, zTarget - 1)
      return
    }

    // The path curves through the corridor rather than running dead
    // straight — frames slide past at changing angles.
    const driftX = Math.sin(sp * Math.PI * 1.6) * 0.95
    const driftY = Math.cos(sp * Math.PI * 1.15) * 0.32 - 0.32

    camera.position.z += (zTarget - camera.position.z) * 0.09
    camera.position.x += ((driftX + target.current.x * 0.7) - camera.position.x) * 0.045
    camera.position.y += ((driftY - target.current.y * 0.42) - camera.position.y) * 0.045
    const bank = -(target.current.x * 0.018) - Math.cos(sp * Math.PI * 1.6) * 0.03
    camera.rotation.z += (bank - camera.rotation.z) * 0.04
    camera.lookAt(camera.position.x * 0.3, camera.position.y * 0.3, camera.position.z - 8)
  })

  return null
}

function Scene({ layout, scrollProg, reduced, aberration }) {
  const textures = useTexture(layout.map(l => l.url))

  useMemo(() => {
    textures.forEach(t => {
      // Raw sRGB passthrough — the shader writes the final colour itself
      t.colorSpace      = THREE.LinearSRGBColorSpace
      t.minFilter       = THREE.LinearMipmapLinearFilter
      t.magFilter       = THREE.LinearFilter
      t.generateMipmaps = true   // the DOF mip bias depends on these
      t.anisotropy      = 8
      t.needsUpdate     = true
    })
  }, [textures])

  return (
    <>
      <Rig scrollProg={scrollProg} reduced={reduced} />
      {layout.map((item, i) => (
        <PhotoPlane key={item.file} item={item} texture={textures[i]} aberration={aberration} />
      ))}
    </>
  )
}

export default function Corridor({ scrollProg, reduced, small }) {
  const layout = useMemo(() => buildCorridor({ small }), [small])

  return (
    <Canvas
      // Cap DPR on phones — a 3x retina buffer of this scene is a lot
      // of fill rate for no visible gain at this size.
      dpr={small ? [1, 1.5] : [1, 2]}
      camera={{ fov: 58, position: [0, 0, 1.5], near: 0.1, far: 60 }}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      onCreated={({ gl }) => gl.setClearColor('#0A0A0B', 1)}
    >
      <Suspense fallback={null}>
        <Scene
          layout={layout}
          scrollProg={scrollProg}
          reduced={reduced}
          aberration={small ? 0 : 0.022}
        />
      </Suspense>
    </Canvas>
  )
}

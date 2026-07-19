'use client'

import { ContactShadows, Environment, Float, RoundedBox, Sparkles } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * SplitFin signature hero — a procedurally sculpted neoclassical bank.
 *
 * Architecture is a true peripteral structure: a colonnade wraps all four
 * sides (front, rear, both flanks), the roof is a single gable prism whose
 * end-caps form matching front AND rear pediments, and the podium is a
 * chamfered three-tier stepped base. Every element has real thickness, so
 * the silhouette reads as "bank" from any camera angle — or as a printable
 * STL with no thin/open geometry.
 *
 * Materials use physical (metalness/roughness/clearcoat) shading lit by an
 * environment map, with only small emissive accents (doorway glow, oculus,
 * rim light) — the form is what sells "premium," not the glow.
 */

const STONE = {
  deepest: '#241472', // podium base
  deep: '#33208f', // podium mid
  base: '#4527c9', // podium top / cella
  mid: '#5b3df5', // entablature / column shaft
  light: '#7c5cff', // capitals / roof
  edge: '#9b7bff', // trim / bases
  glow: '#a78bfa', // medallion
  accent: '#4fc3f7', // doorway glow, rim accent
}

function stoneMat(color: string, opts?: Partial<{ metalness: number; roughness: number; emissiveIntensity: number }>) {
  return (
    <meshPhysicalMaterial
      color={color}
      metalness={opts?.metalness ?? 0.62}
      roughness={opts?.roughness ?? 0.32}
      clearcoat={0.55}
      clearcoatRoughness={0.18}
      emissive={color}
      emissiveIntensity={opts?.emissiveIntensity ?? 0.1}
    />
  )
}

function useBreathing(ref: React.RefObject<THREE.PointLight | null>, base: number, amp: number) {
  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime
    ref.current.intensity = base + Math.sin(t * 0.9) * amp
  })
}

/* ------------------------------------------------------------------ */
/* Stepped, chamfered podium                                           */
/* ------------------------------------------------------------------ */

function Podium() {
  return (
    <group>
      <RoundedBox args={[3.5, 0.2, 2.7]} radius={0.05} smoothness={4} position={[0, -1.55, 0]}>
        {stoneMat(STONE.deepest, { roughness: 0.4 })}
      </RoundedBox>
      <RoundedBox args={[3.15, 0.18, 2.4]} radius={0.045} smoothness={4} position={[0, -1.38, 0]}>
        {stoneMat(STONE.deep, { roughness: 0.36 })}
      </RoundedBox>
      <RoundedBox args={[2.85, 0.16, 2.15]} radius={0.04} smoothness={4} position={[0, -1.22, 0]}>
        {stoneMat(STONE.base, { roughness: 0.32 })}
      </RoundedBox>
    </group>
  )
}

/* Small entrance stair, front only — protrudes past the podium edge */
function EntranceSteps() {
  const steps = [
    { y: -1.55, w: 1.1, z: 1.42 },
    { y: -1.4, w: 0.92, z: 1.32 },
    { y: -1.26, w: 0.74, z: 1.22 },
  ]
  return (
    <group>
      {steps.map((s, i) => (
        <RoundedBox key={i} args={[s.w, 0.13, 0.28]} radius={0.02} smoothness={3} position={[0, s.y, s.z]}>
          {stoneMat(STONE.deep, { roughness: 0.4 })}
        </RoundedBox>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Column — tapered fluted-feel shaft with a proper capital & base     */
/* ------------------------------------------------------------------ */

function Column({ x, z }: { x: number; z: number }) {
  // Bottom of column rests on stylobate (top of podium) at local y = 0.
  const BASE_H = 0.13
  const SHAFT_H = 1.5
  const CAP_H = 0.16

  return (
    <group position={[x, -1.14, z]}>
      {/* Base plinth */}
      <RoundedBox args={[0.34, BASE_H, 0.34]} radius={0.02} smoothness={3} position={[0, BASE_H / 2, 0]}>
        {stoneMat(STONE.edge, { roughness: 0.3 })}
      </RoundedBox>
      {/* Astragal ring above the plinth */}
      <mesh position={[0, BASE_H + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.15, 0.02, 8, 16]} />
        {stoneMat(STONE.light, { metalness: 0.7, roughness: 0.22 })}
      </mesh>
      {/* Tapered shaft */}
      <mesh position={[0, BASE_H + SHAFT_H / 2, 0]}>
        <cylinderGeometry args={[0.135, 0.165, SHAFT_H, 16]} />
        {stoneMat(STONE.mid, { metalness: 0.66, roughness: 0.26 })}
      </mesh>
      {/* Echinus (flared curve under the capital) */}
      <mesh position={[0, BASE_H + SHAFT_H + 0.05, 0]}>
        <cylinderGeometry args={[0.19, 0.145, 0.1, 16]} />
        {stoneMat(STONE.light, { metalness: 0.68, roughness: 0.24 })}
      </mesh>
      {/* Abacus (capital slab) */}
      <RoundedBox
        args={[0.38, CAP_H - 0.05, 0.38]}
        radius={0.015}
        smoothness={3}
        position={[0, BASE_H + SHAFT_H + 0.1 + (CAP_H - 0.05) / 2, 0]}
      >
        {stoneMat(STONE.edge, { metalness: 0.68, roughness: 0.24 })}
      </RoundedBox>
    </group>
  )
}

const COLUMN_TOP = -1.14 + 0.13 + 1.5 + 0.16 // stylobate + base + shaft + capital

function Colonnade() {
  const rowX = [-1.05, -0.35, 0.35, 1.05]
  const sideZ = [-0.45, 0.45]
  const positions: [number, number][] = [
    ...rowX.map((x) => [x, 0.9] as [number, number]),
    ...rowX.map((x) => [x, -0.9] as [number, number]),
    ...sideZ.map((z) => [-1.05, z] as [number, number]),
    ...sideZ.map((z) => [1.05, z] as [number, number]),
  ]
  return (
    <group>
      {positions.map(([x, z]) => (
        <Column key={`${x}-${z}`} x={x} z={z} />
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Arched doorway, reusable for front and rear faces                   */
/* ------------------------------------------------------------------ */

function Doorway({ zSign, withPilasters }: { zSign: 1 | -1; withPilasters?: boolean }) {
  const z = zSign * 0.76
  return (
    <group position={[0, -0.42, z]}>
      {/* Recessed frame */}
      <RoundedBox args={[0.62, 0.98, 0.06]} radius={0.02} smoothness={3} position={[0, 0.06, zSign * 0.01]}>
        {stoneMat(STONE.edge, { roughness: 0.3 })}
      </RoundedBox>
      {/* Door void (dark) with soft accent glow */}
      <mesh position={[0, -0.02, zSign * 0.035]}>
        <boxGeometry args={[0.46, 0.68, 0.05]} />
        <meshPhysicalMaterial color="#0b0620" emissive={STONE.accent} emissiveIntensity={0.5} metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.32, zSign * 0.035]} rotation={[Math.PI / 2, 0, zSign === 1 ? 0 : Math.PI]}>
        <cylinderGeometry args={[0.23, 0.23, 0.05, 20, 1, false, 0, Math.PI]} />
        <meshPhysicalMaterial color="#0b0620" emissive={STONE.accent} emissiveIntensity={0.5} metalness={0.3} roughness={0.5} />
      </mesh>
      {withPilasters && (
        <>
          <RoundedBox args={[0.14, 0.92, 0.08]} radius={0.015} smoothness={2} position={[-0.42, 0.05, zSign * 0.02]}>
            {stoneMat(STONE.mid, { roughness: 0.3 })}
          </RoundedBox>
          <RoundedBox args={[0.14, 0.92, 0.08]} radius={0.015} smoothness={2} position={[0.42, 0.05, zSign * 0.02]}>
            {stoneMat(STONE.mid, { roughness: 0.3 })}
          </RoundedBox>
        </>
      )}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Wraparound entablature (frieze + cornice band above the colonnade)  */
/* ------------------------------------------------------------------ */

function Entablature() {
  const y = COLUMN_TOP + 0.14
  return (
    <group>
      <RoundedBox args={[2.75, 0.16, 2.3]} radius={0.03} smoothness={3} position={[0, y, 0]}>
        {stoneMat(STONE.mid, { metalness: 0.66, roughness: 0.26 })}
      </RoundedBox>
      {/* Cornice cap, slightly wider — casts the crisp shadow line real cornices have */}
      <RoundedBox args={[2.87, 0.07, 2.42]} radius={0.02} smoothness={3} position={[0, y + 0.115, 0]}>
        {stoneMat(STONE.light, { metalness: 0.68, roughness: 0.22 })}
      </RoundedBox>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Gable roof — single triangular-prism extrusion. Its two end-caps    */
/* ARE the front and rear pediments, so both sides get full pediments  */
/* for free, and the two long sloped faces read correctly from the     */
/* sides during rotation.                                              */
/* ------------------------------------------------------------------ */

function GableRoof({ y }: { y: number }) {
  const geometry = useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(-1.45, 0)
    shape.lineTo(1.45, 0)
    shape.lineTo(0, 0.58)
    shape.closePath()
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 2.42,
      bevelEnabled: true,
      bevelThickness: 0.025,
      bevelSize: 0.025,
      bevelSegments: 2,
      steps: 1,
    })
    geo.center()
    return geo
  }, [])

  return (
    <group>
      <mesh geometry={geometry} position={[0, y + 0.29, 0]}>
        {stoneMat(STONE.light, { metalness: 0.66, roughness: 0.24, emissiveIntensity: 0.14 })}
      </mesh>
      {/* Ridge cap */}
      <RoundedBox args={[0.12, 0.09, 2.44]} radius={0.02} smoothness={3} position={[0, y + 0.58, 0]}>
        {stoneMat(STONE.edge, { metalness: 0.7, roughness: 0.2 })}
      </RoundedBox>
      {/* Medallions in both tympana */}
      {[1, -1].map((s) => (
        <group key={s} position={[0, y + 0.46, s * 1.19]}>
          <mesh rotation={[0, s === 1 ? 0 : Math.PI, 0]}>
            <torusGeometry args={[0.14, 0.028, 12, 32]} />
            <meshPhysicalMaterial color={STONE.glow} emissive={STONE.glow} emissiveIntensity={0.9} metalness={0.5} roughness={0.2} clearcoat={0.6} />
          </mesh>
          <mesh rotation={[0, s === 1 ? 0 : Math.PI, 0]}>
            <circleGeometry args={[0.115, 32]} />
            <meshPhysicalMaterial color="#120a33" emissive={STONE.accent} emissiveIntensity={0.6} metalness={0.4} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Main assembly                                                       */
/* ------------------------------------------------------------------ */

function HolographicBank() {
  const group = useRef<THREE.Group>(null)
  const keyLight = useRef<THREE.PointLight>(null)
  useBreathing(keyLight, 15, 4)

  const BASE_SCALE = 0.74 // ~25% smaller overall so the model breathes inside the card
  const BASE_ANGLE = 0.32 // resting bias so the pass-through favors the front 3/4 view

  useFrame((state, delta) => {
    if (!group.current) return
    const t = state.clock.elapsedTime
    // Continuous 360° spin (slightly brisker than before), plus a gentle
    // pointer-parallax offset riding on top of it, plus a barely-there
    // breathing scale pulse layered on the fixed base scale.
    const spin = t * 0.11
    const parallax = state.pointer.x * 0.14
    const tilt = state.pointer.y * -0.04
    group.current.rotation.y = BASE_ANGLE + spin + parallax
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, tilt, 2.2, delta)
    const breathe = 1 + Math.sin(t * 0.6) * 0.008
    group.current.scale.setScalar(BASE_SCALE * breathe)
  })

  const roofY = COLUMN_TOP + 0.14 + 0.185 // stylobate top + entablature + cornice

  return (
    <group ref={group} rotation={[0, BASE_ANGLE, 0]} scale={BASE_SCALE}>
      <Podium />
      <EntranceSteps />

      {/* Interior cella mass — gives real depth behind the colonnade so
          gaps between columns show recessed architecture, not empty air */}
      <RoundedBox args={[1.9, 1.55, 1.5]} radius={0.03} smoothness={3} position={[0, -1.14 + 1.55 / 2, 0]}>
        {stoneMat(STONE.base, { roughness: 0.34 })}
      </RoundedBox>

      <Doorway zSign={1} withPilasters />
      <Doorway zSign={-1} />

      <Colonnade />
      <Entablature />
      <GableRoof y={roofY} />

      <pointLight ref={keyLight} position={[2.2, 3.2, 2.6]} intensity={15} color={STONE.edge} distance={12} decay={2} />
    </group>
  )
}

export default function HeroBankScene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [3.1, 1.7, 6.3], fov: 27 }}
      frameloop="always"
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.4} />
      <Environment preset="city" background={false} environmentIntensity={0.55} />
      {/* Rim / fill for premium sculpting */}
      <pointLight position={[-4.5, 2.4, -3.5]} intensity={8} color={STONE.accent} distance={14} decay={2} />
      <pointLight position={[-2.5, -1.5, 3.5]} intensity={4.5} color={STONE.light} distance={12} decay={2} />
      <Float speed={1.1} rotationIntensity={0.05} floatIntensity={0.4} floatingRange={[-0.06, 0.06]}>
        <HolographicBank />
      </Float>
      <ContactShadows position={[0, -1.28, 0]} opacity={0.55} scale={6} blur={2.6} far={2.6} color="#1b0f4d" />
      <Sparkles count={26} scale={6} size={1.6} speed={0.2} color={STONE.glow} opacity={0.45} />
    </Canvas>
  )
}
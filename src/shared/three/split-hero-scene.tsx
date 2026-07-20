'use client'

/**
 * SplitPay holographic balance core.
 *
 * A small, refined energy core holds the net balance. A slim pink arc
 * marks money flowing out (you owe), a slim green arc money flowing in
 * (you're owed). The core tint follows the real net balance — green
 * when ahead, pink when behind, purple when neutral. Deliberately
 * minimal: the DOM panels carry the metrics, the core carries the state.
 */

import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Group, MeshPhysicalMaterial, MeshStandardMaterial, PointLight } from 'three'

export type NetTone = 'positive' | 'negative' | 'neutral'

const CORE_COLORS: Record<NetTone, string> = {
  positive: '#16e6a1',
  negative: '#ff2d78',
  neutral: '#7c3cff',
}

const OWE_COLOR = '#ff2d78'
const OWED_COLOR = '#16e6a1'

/* ------------------------------------------------------------------ */
/* Glass core + slim energy arcs                                       */
/* ------------------------------------------------------------------ */

function BalanceCore({ tone }: { tone: NetTone }) {
  const coreColor = CORE_COLORS[tone]
  const group = useRef<Group>(null)
  const shellMat = useRef<MeshPhysicalMaterial>(null)
  const innerMat = useRef<MeshStandardMaterial>(null)
  const oweArcMat = useRef<MeshStandardMaterial>(null)
  const owedArcMat = useRef<MeshStandardMaterial>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (group.current) {
      const breathe = 1 + Math.sin(t * 1.05) * 0.014
      group.current.scale.setScalar(breathe)
      group.current.position.y = 0.3 + Math.sin(t * 0.8) * 0.03
    }
    if (shellMat.current) shellMat.current.emissiveIntensity = 0.22 + Math.sin(t * 1.3) * 0.05
    if (innerMat.current) innerMat.current.opacity = 0.2 + Math.sin(t * 1.5) * 0.05
    if (oweArcMat.current) oweArcMat.current.opacity = 0.5 + Math.sin(t * 1.4) * 0.12
    if (owedArcMat.current) owedArcMat.current.opacity = 0.5 + Math.sin(t * 1.4 + 1.2) * 0.12
  })

  return (
    <group ref={group} position={[0, 0.3, 0]}>
      {/* Glass shell */}
      <mesh>
        <sphereGeometry args={[0.34, 48, 48]} />
        <meshPhysicalMaterial
          ref={shellMat}
          color="#171226"
          emissive={coreColor}
          emissiveIntensity={0.22}
          metalness={0.3}
          roughness={0.12}
          clearcoat={1}
          clearcoatRoughness={0.1}
          transparent
          opacity={0.62}
        />
      </mesh>
      {/* Inner energy volume */}
      <mesh>
        <sphereGeometry args={[0.2, 32, 32]} />
        <meshStandardMaterial
          ref={innerMat}
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={0.9}
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Outflow arc — left, pink */}
      <mesh rotation={[0, 0, Math.PI * 0.58]}>
        <torusGeometry args={[0.5, 0.012, 16, 80, Math.PI * 0.82]} />
        <meshStandardMaterial
          ref={oweArcMat}
          color={OWE_COLOR}
          emissive={OWE_COLOR}
          emissiveIntensity={1.2}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Inflow arc — right, green */}
      <mesh rotation={[0, 0, -Math.PI * 0.4]}>
        <torusGeometry args={[0.5, 0.012, 16, 80, Math.PI * 0.82]} />
        <meshStandardMaterial
          ref={owedArcMat}
          color={OWED_COLOR}
          emissive={OWED_COLOR}
          emissiveIntensity={1.2}
          transparent
          opacity={0.6}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Flow nodes at the arc ends */}
      <mesh position={[-0.14, -0.47, 0]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial
          color={OWE_COLOR}
          emissive={OWE_COLOR}
          emissiveIntensity={1.6}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh position={[0.14, -0.47, 0]}>
        <sphereGeometry args={[0.035, 16, 16]} />
        <meshStandardMaterial
          color={OWED_COLOR}
          emissive={OWED_COLOR}
          emissiveIntensity={1.6}
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Floating platform — thin holographic rings, no solid stage          */
/* ------------------------------------------------------------------ */

function CorePlatform({ tone }: { tone: NetTone }) {
  const coreColor = CORE_COLORS[tone]
  const ringMat = useRef<MeshStandardMaterial>(null)
  const glowMat = useRef<MeshStandardMaterial>(null)
  const light = useRef<PointLight>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const pulse = 0.7 + Math.sin(t * 1.4) * 0.3
    if (ringMat.current) {
      ringMat.current.emissive.set(coreColor)
      ringMat.current.opacity = 0.28 + pulse * 0.18
    }
    if (glowMat.current) {
      glowMat.current.emissive.set(coreColor)
      glowMat.current.opacity = 0.08 + pulse * 0.06
    }
    if (light.current) {
      light.current.color.set(coreColor)
      light.current.intensity = 2.6 + pulse * 1.6
    }
  })

  return (
    <group position={[0, -0.42, 0]}>
      <pointLight ref={light} position={[0, 0.35, 0.5]} intensity={3.2} distance={3.2} />
      {/* Energy glow disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.04, 0]}>
        <circleGeometry args={[0.48, 48]} />
        <meshStandardMaterial
          ref={glowMat}
          color={coreColor}
          transparent
          opacity={0.1}
          emissiveIntensity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Concentric holographic rings */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.44, 0.475, 64]} />
        <meshStandardMaterial
          ref={ringMat}
          color={coreColor}
          emissive={coreColor}
          emissiveIntensity={1.2}
          transparent
          opacity={0.42}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.58, 0.595, 64]} />
        <meshStandardMaterial
          color="#9b8cff"
          emissive="#9b8cff"
          emissiveIntensity={0.9}
          transparent
          opacity={0.16}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.7, 0.71, 64]} />
        <meshStandardMaterial
          color="#9b8cff"
          emissive="#9b8cff"
          emissiveIntensity={0.7}
          transparent
          opacity={0.09}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

/* ------------------------------------------------------------------ */
/* Ambient dust                                                        */
/* ------------------------------------------------------------------ */

function AmbientDust() {
  const points = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const arr = new Float32Array(45 * 3)
    for (let i = 0; i < 45; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 6
      arr[i * 3 + 1] = -0.8 + Math.random() * 2.6
      arr[i * 3 + 2] = -2 + Math.random() * 2.2
    }
    return arr
  }, [])

  useFrame(({ clock }) => {
    if (points.current) {
      points.current.rotation.y = clock.elapsedTime * 0.014
      points.current.position.y = Math.sin(clock.elapsedTime * 0.4) * 0.06
    }
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#b9a8ff"
        transparent
        opacity={0.35}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  )
}

/* ------------------------------------------------------------------ */
/* Scene                                                               */
/* ------------------------------------------------------------------ */

export default function SplitHeroScene({ netTone = 'neutral' }: { netTone?: NetTone }) {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.25, 4.6], fov: 30 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.38} />
      <pointLight position={[3.5, 4, 4]} intensity={9} color="#ffffff" />
      <pointLight position={[-3.5, 1.5, 3]} intensity={4.5} color="#8b6cff" />
      <pointLight position={[0, 2, -4]} intensity={6} color="#7c5cff" />

      <BalanceCore tone={netTone} />
      <CorePlatform tone={netTone} />
      <AmbientDust />
    </Canvas>
  )
}

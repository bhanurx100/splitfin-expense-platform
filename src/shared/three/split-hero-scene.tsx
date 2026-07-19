'use client'

import { ContactShadows, Float, Sparkles } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'

/**
 * SplitPay signature hero — shared expenses as a spatial composition.
 * Glowing friend-orbs float on a tilted orbit around a settlement
 * platform; luminous streams connect each orb to the center, so the
 * scene communicates friends + money flow + settlement without text.
 */

const COLORS = {
  platform: '#5b3df5',
  platformEdge: '#9b7bff',
  cube: '#7c5cff',
  glow: '#a78bfa',
  orbA: '#16e6a1', // receive
  orbB: '#14d9ff', // flow
  orbC: '#ffaa2b', // pending
}

const ORBIT_RADIUS = 1.55

function ConnectionTo({ target, color }: { target: THREE.Vector3; color: string }) {
  const geometry = useMemo(() => {
    const mid = target.clone().multiplyScalar(0.5)
    mid.y += 0.35 // arc upward for a premium flowing curve
    const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0.12, 0), mid, target)
    return new THREE.TubeGeometry(curve, 24, 0.016, 8, false)
  }, [target])

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.9} metalness={0.3} roughness={0.4} transparent opacity={0.75} />
    </mesh>
  )
}

function FriendOrb({
  angle,
  color,
  speed,
  size,
}: {
  angle: number
  color: string
  speed: number
  size: number
}) {
  const ref = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.elapsedTime * speed + angle
    ref.current.position.set(
      Math.cos(t) * ORBIT_RADIUS,
      Math.sin(state.clock.elapsedTime * 1.4 + angle) * 0.1 + 0.18,
      Math.sin(t) * ORBIT_RADIUS * 0.55, // elliptical → real depth
    )
  })

  return (
    <group ref={ref}>
      <Float speed={2.2} rotationIntensity={0.2} floatIntensity={0.5}>
        <mesh>
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.85}
            metalness={0.35}
            roughness={0.2}
          />
        </mesh>
        {/* Halo ring */}
        <mesh rotation={[Math.PI / 2.4, 0, 0]}>
          <torusGeometry args={[size * 1.55, size * 0.09, 10, 40]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} metalness={0.4} roughness={0.3} transparent opacity={0.8} />
        </mesh>
      </Float>
    </group>
  )
}

function SettlementPlatform() {
  const medallion = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!medallion.current) return
    const t = state.clock.elapsedTime
    medallion.current.rotation.y = t * 0.7
    medallion.current.position.y = 0.42 + Math.sin(t * 1.1) * 0.05
  })

  return (
    <group>
      {/* Stepped glass platform */}
      <mesh position={[0, -0.72, 0]}>
        <cylinderGeometry args={[1.05, 1.2, 0.16, 48]} />
        <meshStandardMaterial color="#241472" emissive={COLORS.platform} emissiveIntensity={0.3} metalness={0.65} roughness={0.28} />
      </mesh>
      <mesh position={[0, -0.58, 0]}>
        <cylinderGeometry args={[0.85, 0.98, 0.14, 48]} />
        <meshStandardMaterial color={COLORS.platform} emissive={COLORS.platform} emissiveIntensity={0.42} metalness={0.68} roughness={0.24} />
      </mesh>
      {/* Neon rim */}
      <mesh position={[0, -0.5, 0]}>
        <torusGeometry args={[0.86, 0.02, 10, 64]} />
        <meshStandardMaterial color={COLORS.platformEdge} emissive={COLORS.platformEdge} emissiveIntensity={1.2} metalness={0.5} roughness={0.2} />
      </mesh>

      {/* Floating split cubes (the bill being divided) */}
      {([[-0.22, 0.06, 0.1], [0.2, 0.02, -0.08], [0, 0.3, 0.02]] as const).map((pos, i) => (
        <Float key={i} speed={1.8 + i * 0.3} rotationIntensity={0.35} floatIntensity={0.45}>
          <mesh position={[pos[0], pos[1], pos[2]]} rotation={[0.4, 0.6 + i, 0.2]}>
            <boxGeometry args={[0.22, 0.22, 0.22]} />
            <meshStandardMaterial color={COLORS.cube} emissive={COLORS.cube} emissiveIntensity={0.75} metalness={0.6} roughness={0.22} />
          </mesh>
        </Float>
      ))}

      {/* Rotating medallion coin above the platform */}
      <mesh ref={medallion} position={[0, 0.42, 0]} rotation={[Math.PI / 2.6, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.06, 40]} />
        <meshStandardMaterial color={COLORS.glow} emissive={COLORS.glow} emissiveIntensity={1.05} metalness={0.75} roughness={0.18} />
      </mesh>
    </group>
  )
}

function SplitComposition() {
  const group = useRef<THREE.Group>(null)

  // Gentle idle rotation + pointer parallax
  useFrame((state, delta) => {
    if (!group.current) return
    const targetY = state.clock.elapsedTime * 0.14 + state.pointer.x * 0.14
    group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, targetY, 1.8, delta)
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, state.pointer.y * -0.04, 1.8, delta)
  })

  const orbTargets = useMemo(
    () => [
      new THREE.Vector3(Math.cos(0.4) * ORBIT_RADIUS, 0.18, Math.sin(0.4) * ORBIT_RADIUS * 0.55),
      new THREE.Vector3(Math.cos(2.5) * ORBIT_RADIUS, 0.18, Math.sin(2.5) * ORBIT_RADIUS * 0.55),
      new THREE.Vector3(Math.cos(4.6) * ORBIT_RADIUS, 0.18, Math.sin(4.6) * ORBIT_RADIUS * 0.55),
    ],
    [],
  )

  return (
    <group ref={group}>
      <SettlementPlatform />
      <FriendOrb angle={0.4} color={COLORS.orbA} speed={0.22} size={0.17} />
      <FriendOrb angle={2.5} color={COLORS.orbB} speed={0.18} size={0.2} />
      <FriendOrb angle={4.6} color={COLORS.orbC} speed={0.26} size={0.14} />
      {/* Flowing connections (static anchors — orbs drift subtly around them) */}
      <ConnectionTo target={orbTargets[0]} color={COLORS.orbA} />
      <ConnectionTo target={orbTargets[1]} color={COLORS.orbB} />
      <ConnectionTo target={orbTargets[2]} color={COLORS.orbC} />
    </group>
  )
}

export default function SplitHeroScene() {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 1.7, 4.6], fov: 34 }}
      frameloop="always"
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.45} />
      <pointLight position={[3.4, 3.4, 3]} intensity={16} color={COLORS.platformEdge} distance={13} decay={2} />
      <pointLight position={[-4, 1.6, -3]} intensity={8} color="#4fc3f7" distance={13} decay={2} />
      <SplitComposition />
      <ContactShadows position={[0, -0.86, 0]} opacity={0.5} scale={6.5} blur={2.4} far={2.6} color="#1b0f4d" />
      <Sparkles count={26} scale={5} size={1.6} speed={0.24} color={COLORS.glow} opacity={0.5} />
    </Canvas>
  )
}

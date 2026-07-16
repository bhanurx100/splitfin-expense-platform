'use client'

import { Float, Sparkles } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'

function HolographicBank() {
  const group = useRef<Group>(null)

  useFrame((state) => {
    if (!group.current) return
    group.current.rotation.y = state.clock.elapsedTime * 0.12
  })

  const columnPositions = [-0.85, -0.28, 0.28, 0.85]

  return (
    <group ref={group} scale={1.05}>
      {/* Base platform */}
      <mesh position={[0, -0.95, 0]}>
        <boxGeometry args={[2.6, 0.18, 1.6]} />
        <meshStandardMaterial color="#5b3df5" emissive="#5b3df5" emissiveIntensity={0.35} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.78, 0]}>
        <boxGeometry args={[2.3, 0.14, 1.35]} />
        <meshStandardMaterial color="#6d4df8" emissive="#6d4df8" emissiveIntensity={0.4} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Columns */}
      {columnPositions.map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <cylinderGeometry args={[0.13, 0.15, 1.45, 16]} />
          <meshStandardMaterial color="#7c5cff" emissive="#7c5cff" emissiveIntensity={0.5} metalness={0.7} roughness={0.25} />
        </mesh>
      ))}
      {/* Pediment */}
      <mesh position={[0, 0.92, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0, 1.55, 0.55, 4]} />
        <meshStandardMaterial color="#8b6cff" emissive="#8b6cff" emissiveIntensity={0.55} metalness={0.7} roughness={0.25} />
      </mesh>
      {/* Entablature */}
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[2.35, 0.16, 1.4]} />
        <meshStandardMaterial color="#6d4df8" emissive="#6d4df8" emissiveIntensity={0.4} metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  )
}

export default function HeroBankScene() {
  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.4, 4.4], fov: 40 }}
      frameloop="always"
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
      aria-hidden="true"
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[3, 3, 3]} intensity={12} color="#8b6cff" />
      <pointLight position={[-3, -1, 2]} intensity={6} color="#4fc3f7" />
      <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.5}>
        <HolographicBank />
      </Float>
      <Sparkles count={26} scale={4.5} size={1.6} speed={0.25} color="#a78bfa" opacity={0.55} />
    </Canvas>
  )
}

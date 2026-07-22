'use client'

import { ContactShadows, Environment, Float, RoundedBox, Sparkles } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { memo, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'

/**
 * SplitFin signature hero — a procedurally sculpted neoclassical bank.
 * Blue stone palette, front-facing camera, scaled to breathe inside the card.
 */

const STONE = {
  deepest: '#0a1f4d',
  deep: '#12306e',
  base: '#1a4494',
  mid: '#2563c4',
  light: '#3b82e8',
  edge: '#60a5fa',
  glow: '#93c5fd',
  accent: '#22d3ee',
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

function useBreathing(ref: React.RefObject<THREE.PointLight | null>, base: number, amp: number, isActive: boolean) {
  useFrame((state) => {
    if (!ref.current || !isActive) return
    const t = state.clock.elapsedTime
    ref.current.intensity = base + Math.sin(t * 0.9) * amp
  })
}

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

function Column({ x, z }: { x: number; z: number }) {
  const BASE_H = 0.13
  const SHAFT_H = 1.5
  const CAP_H = 0.16

  return (
    <group position={[x, -1.14, z]}>
      <RoundedBox args={[0.34, BASE_H, 0.34]} radius={0.02} smoothness={3} position={[0, BASE_H / 2, 0]}>
        {stoneMat(STONE.edge, { roughness: 0.3 })}
      </RoundedBox>
      <mesh position={[0, BASE_H + 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.15, 0.02, 8, 16]} />
        {stoneMat(STONE.light, { metalness: 0.7, roughness: 0.22 })}
      </mesh>
      <mesh position={[0, BASE_H + SHAFT_H / 2, 0]}>
        <cylinderGeometry args={[0.135, 0.165, SHAFT_H, 16]} />
        {stoneMat(STONE.mid, { metalness: 0.66, roughness: 0.26 })}
      </mesh>
      <mesh position={[0, BASE_H + SHAFT_H + 0.05, 0]}>
        <cylinderGeometry args={[0.19, 0.145, 0.1, 16]} />
        {stoneMat(STONE.light, { metalness: 0.68, roughness: 0.24 })}
      </mesh>
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

const COLUMN_TOP = -1.14 + 0.13 + 1.5 + 0.16

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

function Doorway({ zSign, withPilasters }: { zSign: 1 | -1; withPilasters?: boolean }) {
  const z = zSign * 0.76
  return (
    <group position={[0, -0.42, z]}>
      <RoundedBox args={[0.62, 0.98, 0.06]} radius={0.02} smoothness={3} position={[0, 0.06, zSign * 0.01]}>
        {stoneMat(STONE.edge, { roughness: 0.3 })}
      </RoundedBox>
      <mesh position={[0, -0.02, zSign * 0.035]}>
        <boxGeometry args={[0.46, 0.68, 0.05]} />
        <meshPhysicalMaterial color="#061028" emissive={STONE.accent} emissiveIntensity={0.5} metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.32, zSign * 0.035]} rotation={[Math.PI / 2, 0, zSign === 1 ? 0 : Math.PI]}>
        <cylinderGeometry args={[0.23, 0.23, 0.05, 20, 1, false, 0, Math.PI]} />
        <meshPhysicalMaterial color="#061028" emissive={STONE.accent} emissiveIntensity={0.5} metalness={0.3} roughness={0.5} />
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

function Entablature() {
  const y = COLUMN_TOP + 0.14
  return (
    <group>
      <RoundedBox args={[2.75, 0.16, 2.3]} radius={0.03} smoothness={3} position={[0, y, 0]}>
        {stoneMat(STONE.mid, { metalness: 0.66, roughness: 0.26 })}
      </RoundedBox>
      <RoundedBox args={[2.87, 0.07, 2.42]} radius={0.02} smoothness={3} position={[0, y + 0.115, 0]}>
        {stoneMat(STONE.light, { metalness: 0.68, roughness: 0.22 })}
      </RoundedBox>
    </group>
  )
}

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
      <RoundedBox args={[0.12, 0.09, 2.44]} radius={0.02} smoothness={3} position={[0, y + 0.58, 0]}>
        {stoneMat(STONE.edge, { metalness: 0.7, roughness: 0.2 })}
      </RoundedBox>
      {[1, -1].map((s) => (
        <group key={s} position={[0, y + 0.46, s * 1.19]}>
          <mesh rotation={[0, s === 1 ? 0 : Math.PI, 0]}>
            <torusGeometry args={[0.14, 0.028, 12, 32]} />
            <meshPhysicalMaterial color={STONE.glow} emissive={STONE.glow} emissiveIntensity={0.9} metalness={0.5} roughness={0.2} clearcoat={0.6} />
          </mesh>
          <mesh rotation={[0, s === 1 ? 0 : Math.PI, 0]}>
            <circleGeometry args={[0.115, 32]} />
            <meshPhysicalMaterial color="#061028" emissive={STONE.accent} emissiveIntensity={0.6} metalness={0.4} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function HolographicBank({ isActive }: { isActive: boolean }) {
  const group = useRef<THREE.Group>(null)
  const keyLight = useRef<THREE.PointLight>(null)
  useBreathing(keyLight, 15, 4, isActive)

  const BASE_SCALE = 0.629 // ~15% smaller than prior 0.74 base
  const BASE_ANGLE = 0 // front-facing resting pose

  useFrame((state, delta) => {
    if (!group.current || !isActive) return
    const t = state.clock.elapsedTime
    const spin = t * 0.08
    const parallax = state.pointer.x * 0.1
    const tilt = state.pointer.y * -0.03
    group.current.rotation.y = BASE_ANGLE + spin + parallax
    group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, tilt, 2.2, delta)
    const breathe = 1 + Math.sin(t * 0.6) * 0.008
    group.current.scale.setScalar(BASE_SCALE * breathe)
  })

  const roofY = COLUMN_TOP + 0.14 + 0.185

  return (
    <group ref={group} rotation={[0, BASE_ANGLE, 0]} scale={BASE_SCALE}>
      <Podium />
      <EntranceSteps />
      <RoundedBox args={[1.9, 1.55, 1.5]} radius={0.03} smoothness={3} position={[0, -1.14 + 1.55 / 2, 0]}>
        {stoneMat(STONE.base, { roughness: 0.34 })}
      </RoundedBox>
      <Doorway zSign={1} withPilasters />
      <Doorway zSign={-1} />
      <Colonnade />
      <Entablature />
      <GableRoof y={roofY} />
      <pointLight ref={keyLight} position={[0, 2.8, 3.2]} intensity={15} color={STONE.edge} distance={12} decay={2} />
    </group>
  )
}

function HeroBankSceneInner() {
  const [isActive, setIsActive] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsActive(entry.isIntersecting)
      },
      { threshold: 0.1 }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleVisibility = () => {
      setIsActive(!document.hidden)
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  return (
    <div ref={containerRef} className="size-full">
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.35, 6.2], fov: 30 }}
        frameloop={isActive ? 'always' : 'never'}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: 'transparent' }}
        aria-hidden="true"
      >
        <ambientLight intensity={0.42} />
        <Environment preset="city" background={false} environmentIntensity={0.55} />
        <pointLight position={[-3.5, 1.8, 2.5]} intensity={7} color={STONE.accent} distance={14} decay={2} />
        <pointLight position={[3.5, 1.2, 2.5]} intensity={5} color={STONE.light} distance={12} decay={2} />
        <Float speed={1.1} rotationIntensity={0.04} floatIntensity={0.35} floatingRange={[-0.05, 0.05]}>
          <HolographicBank isActive={isActive} />
        </Float>
        <ContactShadows position={[0, -1.28, 0]} opacity={0.5} scale={6} blur={2.6} far={2.6} color="#0a1a3d" />
        <Sparkles count={12} scale={5.5} size={1.4} speed={0.18} color={STONE.glow} opacity={0.35} />
      </Canvas>
    </div>
  )
}

export default memo(HeroBankSceneInner)

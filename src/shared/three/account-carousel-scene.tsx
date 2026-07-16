'use client'

import { RoundedBox, Text } from '@react-three/drei'
import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import type { Group, MeshStandardMaterial, PointLight } from 'three'

/**
 * Interactive 3D account carousel — one scene, drag with momentum,
 * spring snap to center. Center card 100%, neighbours recede.
 */

export interface CarouselCardData {
  id: string
  institution: string
  name: string
  balanceLabel: string
  balanceCaption: string
  maskedNumber?: string
  isPrimary?: boolean
  theme: { base: string; glow: string; accent: string }
}

const SPACING = 2.35
const MAX_TILT = 0.17 // ~10 degrees

interface CarouselState {
  offset: number
  target: number
  dragging: boolean
  velocity: number
}

function AccountCard({
  card,
  index,
  state,
}: {
  card: CarouselCardData
  index: number
  state: React.MutableRefObject<CarouselState>
}) {
  const group = useRef<Group>(null)
  const bodyMat = useRef<MeshStandardMaterial>(null)

  useFrame(() => {
    const g = group.current
    if (!g) return
    const rel = index - state.current.offset
    const abs = Math.abs(rel)
    const clamped = Math.max(-1.4, Math.min(1.4, rel))

    g.position.x = clamped * SPACING * (1 - abs * 0.08)
    g.position.z = -abs * 1.15
    g.position.y = -abs * 0.12
    g.rotation.y = -clamped * MAX_TILT
    const scale = Math.max(0.68, 1 - abs * 0.3)
    g.scale.setScalar(scale)

    if (bodyMat.current) {
      bodyMat.current.opacity = Math.max(0.35, 1 - abs * 0.55)
      bodyMat.current.emissiveIntensity = Math.max(0.08, 0.3 - abs * 0.2)
    }
  })

  return (
    <group ref={group}>
      {/* Card body */}
      <RoundedBox args={[2.1, 2.9, 0.08]} radius={0.14} smoothness={4}>
        <meshStandardMaterial
          ref={bodyMat}
          color="#12101d"
          emissive={card.theme.base}
          emissiveIntensity={0.3}
          metalness={0.55}
          roughness={0.32}
          transparent
        />
      </RoundedBox>

      {/* Edge light strip */}
      <mesh position={[0, 1.42, 0.045]}>
        <boxGeometry args={[1.9, 0.02, 0.02]} />
        <meshStandardMaterial color={card.theme.glow} emissive={card.theme.glow} emissiveIntensity={1.6} />
      </mesh>

      {/* Institution logo tile */}
      <RoundedBox args={[0.4, 0.4, 0.05]} radius={0.1} smoothness={3} position={[-0.72, 1.02, 0.05]}>
        <meshStandardMaterial
          color={card.theme.base}
          emissive={card.theme.glow}
          emissiveIntensity={0.7}
          metalness={0.5}
          roughness={0.3}
        />
      </RoundedBox>

      {/* Chip */}
      <RoundedBox args={[0.34, 0.26, 0.04]} radius={0.05} smoothness={3} position={[0.76, 1.02, 0.05]}>
        <meshStandardMaterial color={card.theme.accent} metalness={0.85} roughness={0.25} />
      </RoundedBox>

      <Text
        position={[-0.42, 1.1, 0.06]}
        fontSize={0.16}
        color="#f5f3ff"
        anchorX="left"
        anchorY="middle"
        maxWidth={1.4}
      >
        {card.institution}
      </Text>
      <Text position={[-0.42, 0.9, 0.06]} fontSize={0.1} color="#9d97b5" anchorX="left" anchorY="middle">
        {card.name}
      </Text>

      {card.maskedNumber && (
        <Text position={[0, 0.42, 0.06]} fontSize={0.13} color="#8b85a3" anchorX="center" anchorY="middle">
          {card.maskedNumber}
        </Text>
      )}

      <Text position={[0, -0.02, 0.06]} fontSize={0.3} color="#ffffff" anchorX="center" anchorY="middle">
        {card.balanceLabel}
      </Text>
      <Text position={[0, -0.32, 0.06]} fontSize={0.1} color="#9d97b5" anchorX="center" anchorY="middle">
        {card.balanceCaption}
      </Text>

      {/* Primary badge */}
      {card.isPrimary && (
        <group position={[0, -0.85, 0.05]}>
          <RoundedBox args={[1.15, 0.3, 0.03]} radius={0.12} smoothness={3}>
            <meshStandardMaterial
              color={card.theme.base}
              emissive={card.theme.glow}
              emissiveIntensity={0.5}
              transparent
              opacity={0.9}
            />
          </RoundedBox>
          <Text position={[0, 0, 0.03]} fontSize={0.1} color="#ffffff" anchorX="center" anchorY="middle">
            Primary Account
          </Text>
        </group>
      )}
    </group>
  )
}

function Platform({ cards, state }: { cards: CarouselCardData[]; state: React.MutableRefObject<CarouselState> }) {
  const ringMat = useRef<MeshStandardMaterial>(null)
  const light = useRef<PointLight>(null)

  useFrame(() => {
    const active = Math.round(state.current.offset)
    const theme = cards[Math.max(0, Math.min(cards.length - 1, active))]?.theme
    if (theme && ringMat.current) {
      ringMat.current.emissive.set(theme.glow)
      ringMat.current.color.set(theme.base)
    }
    if (theme && light.current) light.current.color.set(theme.glow)
  })

  return (
    <group position={[0, -1.78, 0]}>
      <pointLight ref={light} position={[0, 0.6, 0.6]} intensity={9} distance={5} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.05, 1.28, 48]} />
        <meshStandardMaterial ref={ringMat} emissiveIntensity={1.2} transparent opacity={0.75} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <circleGeometry args={[1.05, 48]} />
        <meshStandardMaterial color="#0d0b16" metalness={0.4} roughness={0.6} />
      </mesh>
    </group>
  )
}

function Rig({
  state,
  onSettled,
}: {
  state: React.MutableRefObject<CarouselState>
  onSettled: (index: number) => void
}) {
  const lastReported = useRef(-1)

  useFrame((_, delta) => {
    const s = state.current
    if (!s.dragging) {
      // Critically-damped spring toward target — heavy, luxury feel.
      const diff = s.target - s.offset
      s.velocity += diff * 42 * delta
      s.velocity *= Math.exp(-9 * delta)
      s.offset += s.velocity * delta

      if (Math.abs(diff) < 0.002 && Math.abs(s.velocity) < 0.01) {
        s.offset = s.target
        s.velocity = 0
        if (lastReported.current !== s.target) {
          lastReported.current = s.target
          onSettled(s.target)
        }
      }
    }
  })

  return null
}

export default function AccountCarouselScene({
  cards,
  onActiveChange,
}: {
  cards: CarouselCardData[]
  onActiveChange: (index: number) => void
}) {
  const state = useRef<CarouselState>({ offset: 0, target: 0, dragging: false, velocity: 0 })
  const drag = useRef({ startX: 0, startOffset: 0, lastX: 0, lastT: 0, pxVelocity: 0 })

  // Reset when the card list changes (category filter).
  const ids = useMemo(() => cards.map((c) => c.id).join(','), [cards])
  useEffect(() => {
    state.current.offset = 0
    state.current.target = 0
    state.current.velocity = 0
    onActiveChange(0)
  }, [ids, onActiveChange])

  const clampIndex = (i: number) => Math.max(0, Math.min(cards.length - 1, i))

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
    state.current.dragging = true
    drag.current = {
      startX: e.clientX,
      startOffset: state.current.offset,
      lastX: e.clientX,
      lastT: performance.now(),
      pxVelocity: 0,
    }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!state.current.dragging) return
    const width = (e.currentTarget as HTMLElement).clientWidth || 360
    const dx = e.clientX - drag.current.startX
    const raw = drag.current.startOffset - (dx / width) * 2.2
    // Rubber-band at the ends.
    const min = 0
    const max = cards.length - 1
    state.current.offset =
      raw < min ? min + (raw - min) * 0.3 : raw > max ? max + (raw - max) * 0.3 : raw

    const now = performance.now()
    const dt = now - drag.current.lastT
    if (dt > 0) {
      drag.current.pxVelocity = (e.clientX - drag.current.lastX) / dt
      drag.current.lastX = e.clientX
      drag.current.lastT = now
    }
  }

  const endDrag = () => {
    if (!state.current.dragging) return
    state.current.dragging = false
    // Momentum: flick advances one card in the flick direction.
    const flick = drag.current.pxVelocity
    let target = Math.round(state.current.offset)
    if (Math.abs(flick) > 0.35) {
      target = flick < 0 ? Math.ceil(state.current.offset) : Math.floor(state.current.offset)
    }
    state.current.target = clampIndex(target)
    state.current.velocity = 0
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowRight') {
      state.current.target = clampIndex(state.current.target + 1)
    } else if (e.key === 'ArrowLeft') {
      state.current.target = clampIndex(state.current.target - 1)
    }
  }

  return (
    <div
      role="listbox"
      aria-label="Account carousel — swipe or use arrow keys to change account"
      tabIndex={0}
      className="h-full w-full cursor-grab touch-pan-y select-none active:cursor-grabbing focus-visible:outline-2 focus-visible:outline-ring"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onPointerCancel={endDrag}
      onKeyDown={onKeyDown}
    >
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: [0, 0.15, 5.4], fov: 36 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.55} />
        <pointLight position={[3, 3, 4]} intensity={10} color="#ffffff" />
        <pointLight position={[-3, -1, 3]} intensity={5} color="#8b6cff" />
        <Rig state={state} onSettled={onActiveChange} />
        <Platform cards={cards} state={state} />
        {cards.map((card, i) => (
          <AccountCard key={card.id} card={card} index={i} state={state} />
        ))}
      </Canvas>
    </div>
  )
}

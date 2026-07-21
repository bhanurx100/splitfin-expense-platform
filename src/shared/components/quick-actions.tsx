'use client'

import { cn } from '@/src/lib/utils'
import { springs } from '@/src/shared/lib/motion'
import { motion, useReducedMotion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

export interface QuickAction {
  id: string
  icon: LucideIcon
  label: string
  hint?: string
  tone?: 'primary' | 'positive' | 'negative' | 'info' | 'warning'
  onClick?: () => void
  href?: string
}

interface Ripple {
  id: number
  x: number
  y: number
}

const toneStyles: Record<
  NonNullable<QuickAction['tone']>,
  { text: string; glow: string; glowHover: string; tint: string; ring: string }
> = {
  primary: {
    text: 'text-primary-bright',
    glow: '0 0 20px rgba(0,0,0,0.08)',
    glowHover: '0 0 30px rgba(0,0,0,0.12)',
    tint: 'transparent',
    ring: 'rgba(124,60,255,0.15)',
  },
  positive: {
    text: 'text-positive',
    glow: '0 0 20px rgba(0,0,0,0.08)',
    glowHover: '0 0 30px rgba(0,0,0,0.12)',
    tint: 'transparent',
    ring: 'rgba(22,230,161,0.15)',
  },
  negative: {
    text: 'text-negative',
    glow: '0 0 20px rgba(0,0,0,0.08)',
    glowHover: '0 0 30px rgba(0,0,0,0.12)',
    tint: 'transparent',
    ring: 'rgba(255,45,120,0.15)',
  },
  info: {
    text: 'text-info',
    glow: '0 0 20px rgba(0,0,0,0.08)',
    glowHover: '0 0 30px rgba(0,0,0,0.12)',
    tint: 'transparent',
    ring: 'rgba(20,217,255,0.15)',
  },
  warning: {
    text: 'text-warning',
    glow: '0 0 20px rgba(0,0,0,0.08)',
    glowHover: '0 0 30px rgba(0,0,0,0.12)',
    tint: 'transparent',
    ring: 'rgba(255,170,43,0.15)',
  },
}

function QuickActionButton({ action, active }: { action: QuickAction; active: boolean }) {
  const router = useRouter()
  const reduced = useReducedMotion()
  const [ripples, setRipples] = useState<Ripple[]>([])
  const rippleId = useRef(0)
  const tone = toneStyles[action.tone ?? 'primary']
  const Icon = action.icon

  const fire = useCallback(() => {
    if (action.onClick) {
      action.onClick()
      return
    }
    if (action.href) router.push(action.href)
  }, [action, router])

  const spawnRipple = useCallback(
    (event: React.PointerEvent<HTMLButtonElement>) => {
      if (reduced) return
      const rect = event.currentTarget.getBoundingClientRect()
      const ripple: Ripple = {
        id: rippleId.current++,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }
      setRipples((prev) => [...prev.slice(-3), ripple])
    },
    [reduced],
  )

  return (
    <motion.button
      type="button"
      onClick={fire}
      onPointerDown={spawnRipple}
      initial="rest"
      whileHover="hover"
      whileTap="press"
      animate={active ? 'active' : 'rest'}
      className="group flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-2.5 rounded-2xl py-1 focus-visible:outline-2 focus-visible:outline-ring"
      aria-label={action.label}
      aria-pressed={active}
    >
      <motion.span
        variants={{
          rest: { scale: 1, boxShadow: tone.glow, borderColor: 'var(--border)' },
          active: { scale: 1.05, boxShadow: tone.glowHover, borderColor: tone.ring },
          hover: { scale: 1.07, boxShadow: tone.glowHover, borderColor: tone.ring },
          press: { scale: 0.9, boxShadow: tone.glowHover, borderColor: tone.ring },
        }}
        transition={springs.snappy}
        className="relative flex size-16 items-center justify-center overflow-visible rounded-full border bg-transparent"
        style={{ boxShadow: tone.glow }}
      >
        {/* Inner tonal tint (transparent) */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{ background: tone.tint, opacity: 0 }}
        />
        {/* Ripple layer (clipped) */}
        <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              className="absolute rounded-full bg-white/30"
              style={{ left: ripple.x - 40, top: ripple.y - 40, width: 80, height: 80 }}
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 2.4, opacity: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              onAnimationComplete={() =>
                setRipples((prev) => prev.filter((r) => r.id !== ripple.id))
              }
            />
          ))}
        </span>
        {/* Icon */}
        <motion.span
          variants={{
            rest: { y: 0, scale: 1, rotate: 0 },
            active: { y: -1, scale: 1.08, rotate: 0 },
            hover: { y: -1.5, scale: 1.12, rotate: -4 },
            press: { y: 0, scale: 0.94, rotate: 0 },
          }}
          transition={springs.bouncy}
          className={cn('relative flex items-center justify-center', tone.text)}
        >
          <Icon className="size-6" strokeWidth={1.9} aria-hidden="true" />
        </motion.span>
      </motion.span>
      <span className="flex flex-col items-center gap-0.5">
        <span
          className={cn(
            'text-center text-[11px] font-medium leading-tight transition-colors duration-300 group-hover:text-foreground',
            active ? 'text-foreground' : 'text-foreground/85',
          )}
        >
          {action.label}
        </span>
        {action.hint && (
          <span className="text-center text-[9px] leading-tight text-muted-foreground">
            {action.hint}
          </span>
        )}
      </span>
    </motion.button>
  )
}

export function QuickActions({
  actions,
  activeId,
  className,
}: {
  actions: QuickAction[]
  /** When set, the matching action renders in the active (selected) state. */
  activeId?: string
  className?: string
}) {
  return (
    <div className={cn('flex items-start justify-between gap-2', className)}>
      {actions.map((action) => (
        <QuickActionButton key={action.id} action={action} active={action.id === activeId} />
      ))}
    </div>
  )
}

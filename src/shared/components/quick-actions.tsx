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
  tone?: 'primary' | 'positive' | 'info' | 'warning'
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
    glow: '0 6px 18px rgba(0,0,0,0.45), 0 0 12px rgba(124,60,255,0.12)',
    glowHover:
      '0 14px 32px rgba(0,0,0,0.55), 0 0 28px rgba(124,60,255,0.45), 0 0 56px rgba(124,60,255,0.18)',
    tint: 'radial-gradient(circle at 50% 32%, rgba(124,60,255,0.32), rgba(124,60,255,0.06) 68%)',
    ring: 'rgba(155,92,255,0.45)',
  },
  positive: {
    text: 'text-positive',
    glow: '0 6px 18px rgba(0,0,0,0.45), 0 0 12px rgba(22,230,161,0.10)',
    glowHover:
      '0 14px 32px rgba(0,0,0,0.55), 0 0 28px rgba(22,230,161,0.40), 0 0 56px rgba(22,230,161,0.16)',
    tint: 'radial-gradient(circle at 50% 32%, rgba(22,230,161,0.28), rgba(22,230,161,0.05) 68%)',
    ring: 'rgba(22,230,161,0.40)',
  },
  info: {
    text: 'text-info',
    glow: '0 6px 18px rgba(0,0,0,0.45), 0 0 12px rgba(20,217,255,0.10)',
    glowHover:
      '0 14px 32px rgba(0,0,0,0.55), 0 0 28px rgba(20,217,255,0.40), 0 0 56px rgba(20,217,255,0.16)',
    tint: 'radial-gradient(circle at 50% 32%, rgba(20,217,255,0.28), rgba(20,217,255,0.05) 68%)',
    ring: 'rgba(20,217,255,0.40)',
  },
  warning: {
    text: 'text-warning',
    glow: '0 6px 18px rgba(0,0,0,0.45), 0 0 12px rgba(255,170,43,0.10)',
    glowHover:
      '0 14px 32px rgba(0,0,0,0.55), 0 0 28px rgba(255,170,43,0.40), 0 0 56px rgba(255,170,43,0.16)',
    tint: 'radial-gradient(circle at 50% 32%, rgba(255,170,43,0.28), rgba(255,170,43,0.05) 68%)',
    ring: 'rgba(255,170,43,0.40)',
  },
}

function QuickActionButton({ action }: { action: QuickAction }) {
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
      animate="rest"
      className="group flex min-w-0 flex-1 cursor-pointer flex-col items-center gap-2.5 rounded-2xl py-1 focus-visible:outline-2 focus-visible:outline-ring"
      aria-label={action.label}
    >
      <motion.span
        variants={{
          rest: { scale: 1, boxShadow: tone.glow, borderColor: 'rgba(255,255,255,0.10)' },
          hover: { scale: 1.07, boxShadow: tone.glowHover, borderColor: tone.ring },
          press: { scale: 0.9, boxShadow: tone.glowHover, borderColor: tone.ring },
        }}
        transition={springs.snappy}
        className="relative flex size-16 items-center justify-center overflow-visible rounded-full border bg-[rgba(255,255,255,0.05)] backdrop-blur-[24px]"
        style={{ boxShadow: tone.glow }}
      >
        {/* Inner tonal tint */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{ background: tone.tint }}
        />
        {/* Top edge light */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.02) 34%, transparent 60%)',
          }}
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
        <span className="text-center text-[11px] font-medium leading-tight text-foreground/85 transition-colors duration-300 group-hover:text-foreground">
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
  className,
}: {
  actions: QuickAction[]
  className?: string
}) {
  return (
    <div className={cn('flex items-start justify-between gap-2', className)}>
      {actions.map((action) => (
        <QuickActionButton key={action.id} action={action} />
      ))}
    </div>
  )
}

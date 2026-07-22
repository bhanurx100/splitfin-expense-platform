'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { GlassCard } from '@/src/shared/components/glass-card'
// import { formatCurrency } from '@/src/shared/lib/format'
import { springs } from '@/src/shared/lib/motion'
import type { AccountPreview } from '@/src/types/transaction'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import {
  Banknote,
  CreditCard,
  Landmark,
  Lock,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRef, useState } from 'react'

/** Muted type tints — preview cards sit below the hero, not compete with it. */
const typeMeta: Record<
  string,
  { icon: LucideIcon; gradient: string; glow: string; ring: string; color: string }
> = {
  bank: {
    icon: Landmark,
    gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    glow: 'rgba(59, 130, 246, 0.4)',
    ring: 'rgba(59, 130, 246, 0.6)',
    color: '#3b82f6',
  },
  'credit-card': {
    icon: CreditCard,
    gradient: 'linear-gradient(160deg, rgba(14,75,94,0.32) 0%, rgba(15,90,110,0.14) 55%, rgba(14,15,32,0) 100%)',
    glow: 'rgba(20,217,255,0.2)',
    ring: 'rgba(20,217,255,0.3)',
    color: '#14d9ff',
  },
  'debit-card': {
    icon: CreditCard,
    gradient: 'linear-gradient(160deg, rgba(80,55,14,0.28) 0%, rgba(110,80,20,0.12) 55%, rgba(14,15,32,0) 100%)',
    glow: 'rgba(255,170,43,0.2)',
    ring: 'rgba(255,170,43,0.3)',
    color: '#ffaa2b',
  },
  wallet: {
    icon: Wallet,
    gradient: 'linear-gradient(160deg, rgba(6,60,45,0.28) 0%, rgba(10,90,65,0.12) 55%, rgba(14,15,32,0) 100%)',
    glow: 'rgba(22,230,161,0.18)',
    ring: 'rgba(22,230,161,0.28)',
    color: '#16e6a1',
  },
  cash: {
    icon: Banknote,
    gradient: 'linear-gradient(160deg, rgba(50,65,14,0.26) 0%, rgba(80,100,20,0.1) 55%, rgba(14,15,32,0) 100%)',
    glow: 'rgba(180,220,40,0.16)',
    ring: 'rgba(180,220,40,0.26)',
    color: '#b4dc28',
  },
  investment: {
    icon: TrendingUp,
    gradient: 'linear-gradient(160deg, rgba(70,14,55,0.28) 0%, rgba(100,20,70,0.12) 55%, rgba(14,15,32,0) 100%)',
    glow: 'rgba(255,45,120,0.18)',
    ring: 'rgba(255,45,120,0.28)',
    color: '#ff2d78',
  },
  savings: {
    icon: Lock,
    gradient: 'linear-gradient(160deg, rgba(22,34,47,0.32) 0%, rgba(40,60,80,0.14) 55%, rgba(14,15,32,0) 100%)',
    glow: 'rgba(127,176,224,0.18)',
    ring: 'rgba(127,176,224,0.28)',
    color: '#7fb0e0',
  },
}

const ObjectCanvas = dynamic(
  () => import('@/src/shared/three/account-objects').then((m) => m.AccountObjectCanvas),
  {
    ssr: false,
    loading: () => <div className="size-full animate-pulse rounded-full bg-white/4" aria-hidden="true" />,
  },
)

function AccountCard({ account, index }: { account: AccountPreview; index: number }) {
  const meta = typeMeta[account.type] ?? typeMeta.bank
  const Icon = meta.icon

  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const springRotateX = useSpring(rotateX, springs.soft)
  const springRotateY = useSpring(rotateY, springs.soft)

  const rippleId = useRef(0)
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    rotateY.set(px * 7)
    rotateX.set(py * -7)
  }

  function resetTilt() {
    rotateX.set(0)
    rotateY.set(0)
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const id = rippleId.current++
    setRipples((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id))
    }, 650)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20, scale: 0.97 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ ...springs.soft, delay: index * 0.05 }}
      className="snap-start"
    >
      <Link
        href={`/accounts?account=${account.id}`}
        aria-label={`${account.institution} ${account.name} — open account`}
        className="block rounded-[var(--radius)] focus-visible:outline-2 focus-visible:outline-ring"
        style={{ perspective: 900 }}
      >
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={resetTilt}
          onPointerDown={handlePointerDown}
          whileHover={{ y: -4, scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          transition={springs.snappy}
          style={{
            rotateX: springRotateX,
            rotateY: springRotateY,
            transformStyle: 'preserve-3d',
            borderColor: 'var(--border)',
            boxShadow: `0 0 16px color-mix(in srgb, ${meta.color} 12%, transparent)`,
          }}
          className="group relative flex w-[176px] shrink-0 flex-col overflow-hidden rounded-[var(--radius)] border bg-card"
        >
          <div className="relative flex h-[3.5rem] items-end justify-center overflow-hidden">
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.92 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ ...springs.soft, delay: 0.08 + index * 0.05 }}
              className="relative h-full w-full transition-transform duration-300 ease-out group-hover:scale-[1.04]"
            >
              <ObjectCanvas type={account.type} className="size-full" />
            </motion.div>
            {account.isPrimary && (
              <span className="absolute top-2 right-2 z-10 rounded-full border border-white/20 bg-black/30 px-1.5 py-0.5 text-[8px] font-semibold tracking-wide text-foreground/80 backdrop-blur-sm">
                PRIMARY
              </span>
            )}

            <AnimatePresence>
              {ripples.map((r) => (
                <motion.span
                  key={r.id}
                  className="pointer-events-none absolute rounded-full bg-white/30"
                  style={{ left: r.x, top: r.y, width: 10, height: 10, marginLeft: -5, marginTop: -5 }}
                  initial={{ scale: 0, opacity: 0.4 }}
                  animate={{ scale: 14, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.65, ease: 'easeOut' }}
                />
              ))}
            </AnimatePresence>
          </div>

          <div className="flex flex-col gap-1.5 p-3">
            <div className="flex min-w-0 items-center gap-1.5">
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded-full text-foreground/90"
                style={{ background: meta.glow }}
              >
                <Icon className="size-3" aria-hidden="true" />
              </span>
              <p className="truncate text-[12px] font-semibold">{account.institution}</p>
            </div>
            <p className="truncate pl-[26px] text-[10px] text-muted-foreground">
              {account.name}
              {account.maskedNumber ? ` · ${account.maskedNumber}` : ''}
            </p>
            <div className="mt-1">
              <AnimatedAmount
                value={account.balance}
                currency={account.currency}
                className="whitespace-nowrap text-base font-bold leading-tight"
              />
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}

export function AccountsPreview({ accounts }: { accounts: AccountPreview[] }) {
  if (accounts.length === 0) {
    return (
      <section aria-label="Accounts preview" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Accounts</h2>
        </div>
        <GlassCard radius="2xl" padding="lg" className="flex flex-col items-center gap-2 text-center">
          <p className="text-sm font-semibold">No accounts yet</p>
          <p className="max-w-56 text-xs leading-relaxed text-muted-foreground">
            Add your first account to see it here.
          </p>
        </GlassCard>
      </section>
    )
  }

  return (
    <section aria-label="Accounts preview" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Accounts</h2>
        <Link
          href="/accounts"
          className="rounded-lg text-sm font-medium text-info transition-colors hover:text-info/80 focus-visible:outline-2 focus-visible:outline-ring"
        >
          View all
        </Link>
      </div>
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto p-1 scrollbar-none">
        {accounts.map((account, i) => (
          <AccountCard key={account.id} account={account} index={i} />
        ))}
      </div>
    </section>
  )
}

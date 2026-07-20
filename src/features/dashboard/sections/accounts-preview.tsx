'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { springs } from '@/src/shared/lib/motion'
import { cn } from '@/src/lib/utils'
import type { AccountPreview } from '@/src/types/transaction'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import {
  Banknote,
  CreditCard,
  Landmark,
  Lock,
  TrendingDown,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useRef, useState } from 'react'

/**
 * Visual language mirrors the original product art direction: each
 * account is a collectible card whose hero zone is a real glossy 3D
 * object (bank, card, wallet, cash) rendered live — the same objects
 * used by the Accounts page carousel.
 */
const typeMeta: Record<
  string,
  { icon: LucideIcon; gradient: string; glow: string; ring: string }
> = {
  bank: {
    icon: Landmark,
    gradient: 'linear-gradient(160deg, rgba(59,29,158,0.55) 0%, rgba(91,61,245,0.28) 55%, rgba(14,15,32,0) 100%)',
    glow: 'rgba(124,60,255,0.45)',
    ring: 'rgba(155,92,255,0.5)',
  },
  'credit-card': {
    icon: CreditCard,
    gradient: 'linear-gradient(160deg, rgba(14,75,94,0.55) 0%, rgba(15,126,168,0.28) 55%, rgba(14,15,32,0) 100%)',
    glow: 'rgba(20,217,255,0.35)',
    ring: 'rgba(20,217,255,0.45)',
  },
  'debit-card': {
    icon: CreditCard,
    gradient: 'linear-gradient(160deg, rgba(94,58,14,0.55) 0%, rgba(168,122,15,0.28) 55%, rgba(14,15,32,0) 100%)',
    glow: 'rgba(255,170,43,0.35)',
    ring: 'rgba(255,170,43,0.45)',
  },
  wallet: {
    icon: Wallet,
    gradient: 'linear-gradient(160deg, rgba(6,80,60,0.55) 0%, rgba(11,156,110,0.28) 55%, rgba(14,15,32,0) 100%)',
    glow: 'rgba(22,230,161,0.35)',
    ring: 'rgba(22,230,161,0.45)',
  },
  cash: {
    icon: Banknote,
    gradient: 'linear-gradient(160deg, rgba(63,82,14,0.55) 0%, rgba(116,168,15,0.26) 55%, rgba(14,15,32,0) 100%)',
    glow: 'rgba(198,255,43,0.28)',
    ring: 'rgba(198,255,43,0.4)',
  },
  investment: {
    icon: TrendingUp,
    gradient: 'linear-gradient(160deg, rgba(94,14,70,0.55) 0%, rgba(168,15,110,0.28) 55%, rgba(14,15,32,0) 100%)',
    glow: 'rgba(255,45,120,0.35)',
    ring: 'rgba(255,45,120,0.45)',
  },
  savings: {
    icon: Lock,
    gradient: 'linear-gradient(160deg, rgba(22,34,47,0.6) 0%, rgba(47,76,102,0.3) 55%, rgba(14,15,32,0) 100%)',
    glow: 'rgba(127,176,224,0.35)',
    ring: 'rgba(127,176,224,0.45)',
  },
}

/* The 3D viewer is client-only — load it lazily per card. */
const ObjectCanvas = dynamic(
  () => import('@/src/shared/three/account-objects').then((m) => m.AccountObjectCanvas),
  {
    ssr: false,
    loading: () => <div className="size-full animate-pulse rounded-full bg-white/5" aria-hidden="true" />,
  },
)

/* ------------------------------------------------------------------ */
/* Card                                                                 */
/* ------------------------------------------------------------------ */

function AccountCard({ account, index }: { account: AccountPreview; index: number }) {
  const meta = typeMeta[account.type] ?? typeMeta.bank
  const Icon = meta.icon
  const positive = account.monthlyChangePercent >= 0

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
    rotateY.set(px * 9)
    rotateX.set(py * -9)
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
      initial={{ opacity: 0, x: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ ...springs.soft, delay: index * 0.06 }}
      className="snap-start"
    >
      <Link
        href={`/accounts?account=${account.id}`}
        aria-label={`${account.institution} ${account.name} — open account`}
        className="block rounded-[20px] focus-visible:outline-2 focus-visible:outline-ring"
        style={{ perspective: 900 }}
      >
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={resetTilt}
          onPointerDown={handlePointerDown}
          whileHover={{ y: -6, scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          transition={springs.snappy}
          style={{
            rotateX: springRotateX,
            rotateY: springRotateY,
            transformStyle: 'preserve-3d',
            boxShadow: `0 10px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)`,
          }}
          className="group relative flex w-[150px] shrink-0 flex-col overflow-hidden rounded-[20px] border border-white/10"
        >
          {/* Hover glow ring */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 rounded-[20px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ boxShadow: `0 0 0 1.5px ${meta.ring}, 0 14px 32px ${meta.glow}` }}
          />

          {/* ── 3D object hero zone ────────────────────────────── */}
          <div className="relative flex h-32 items-end justify-center overflow-hidden">
            {/* Type-tinted atmosphere */}
            <span aria-hidden className="absolute inset-0" style={{ background: meta.gradient }} />
            <span
              aria-hidden
              className="absolute bottom-0 size-24 translate-y-6 rounded-full opacity-80 blur-2xl"
              style={{ background: meta.glow }}
            />
            {/* Top edge light */}
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-8"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.16), transparent)' }}
            />
            {/* Live glossy 3D object */}
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ ...springs.soft, delay: 0.1 + index * 0.06 }}
              className="relative h-full w-full transition-transform duration-300 ease-out group-hover:scale-[1.06]"
            >
              <ObjectCanvas type={account.type} className="size-full" />
            </motion.div>
            {account.isPrimary && (
              <span className="absolute top-2 right-2 z-10 rounded-full border border-white/30 bg-black/25 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-white/90 backdrop-blur-sm">
                PRIMARY
              </span>
            )}

            {/* Click ripple */}
            <AnimatePresence>
              {ripples.map((r) => (
                <motion.span
                  key={r.id}
                  className="pointer-events-none absolute rounded-full bg-white/45"
                  style={{ left: r.x, top: r.y, width: 10, height: 10, marginLeft: -5, marginTop: -5 }}
                  initial={{ scale: 0, opacity: 0.5 }}
                  animate={{ scale: 15, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.65, ease: 'easeOut' }}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* ── Info zone ────────────────────────────────────── */}
          <div className="flex flex-col gap-1.5 bg-[rgba(14,15,32,0.92)] p-3 backdrop-blur-xl">
            <div className="flex min-w-0 items-center gap-1.5">
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded-full text-white"
                style={{ background: meta.glow }}
              >
                <Icon className="size-3" aria-hidden="true" />
              </span>
              <p className="truncate text-[13px] font-semibold">{account.institution}</p>
            </div>
            <p className="truncate pl-[26px] text-[10.5px] text-muted-foreground">
              {account.name}
              {account.maskedNumber ? ` · ${account.maskedNumber}` : ''}
            </p>
            <div className="mt-0.5 flex items-end justify-between gap-2">
              <AnimatedAmount
                value={account.balance}
                currency={account.currency}
                className="text-base font-bold leading-tight"
              />
              <span
                className={cn(
                  'flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold',
                  positive ? 'bg-positive/12 text-positive' : 'bg-negative/12 text-negative',
                )}
              >
                {positive ? (
                  <TrendingUp className="size-2.5" aria-hidden="true" />
                ) : (
                  <TrendingDown className="size-2.5" aria-hidden="true" />
                )}
                {Math.abs(account.monthlyChangePercent)}%
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Section                                                              */
/* ------------------------------------------------------------------ */

export function AccountsPreview({ accounts }: { accounts: AccountPreview[] }) {
  if (accounts.length === 0) {
    return (
      <section aria-label="Accounts preview" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Accounts</h2>
        </div>
        <div className="glass flex flex-col items-center gap-2 rounded-2xl p-8 text-center">
          <p className="text-sm font-semibold">No accounts yet</p>
          <p className="max-w-56 text-xs leading-relaxed text-muted-foreground">
            Add your first account to see it here.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section aria-label="Accounts preview" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Accounts</h2>
        <Link
          href="/accounts"
          className="rounded-lg text-sm font-medium text-primary transition-colors hover:text-primary-bright focus-visible:outline-2 focus-visible:outline-ring"
        >
          View all
        </Link>
      </div>
      <div className="-mx-6 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-6 pt-1 pb-3 scrollbar-none">
        {accounts.map((account, i) => (
          <AccountCard key={account.id} account={account} index={i} />
        ))}
      </div>
    </section>
  )
}

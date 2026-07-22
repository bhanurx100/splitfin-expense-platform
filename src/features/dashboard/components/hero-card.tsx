'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { getTimeGreeting } from '@/src/shared/lib/format'
import type { BalanceSummary, UserGreeting } from '@/src/types/transaction'
import { CreditCard, Eye, EyeOff, Landmark, TrendingUp, Wallet, Wifi, type LucideIcon } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const HeroBankScene = dynamic(() => import('@/src/shared/three/hero-bank-scene'), {
  ssr: false,
  loading: () => <div className="size-full animate-pulse rounded-full bg-primary/8" aria-hidden="true" />,
})

export function HeroCard({ summary, greeting }: { summary: BalanceSummary; greeting: UserGreeting }) {
  const [hidden, setHidden] = useState(false)
  const [timeGreeting, setTimeGreeting] = useState('Good evening')
  const router = useRouter()

  useEffect(() => {
    setTimeGreeting(getTimeGreeting())
  }, [])

  return (
    <section className="relative overflow-hidden rounded-[1.35rem] border border-[rgba(59,130,246,0.42)] bg-card px-4 pt-3 pb-2 shadow-[0_0_16px_rgba(59,130,246,0.22)] sm:px-5" aria-label="Your financial overview">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-64"
        style={{ background: 'radial-gradient(ellipse 62% 52% at 50% 38%, rgba(74, 80, 208, 0.12), transparent 72%)' }}
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-2">
        {/* Section 1: Greeting (full width) */}
        <p className="text-[1.05rem] font-bold leading-tight tracking-[-0.045em] text-foreground sm:text-[1.15rem]">
          {timeGreeting}, {greeting.name}
        </p>

        {/* Section 2: Headline + Bank (two-column) */}
        <div className="grid grid-cols-[7fr_3fr] items-start gap-3">
          <h1 className="text-[1.15rem] font-extrabold leading-[1.05] tracking-[-0.055em] sm:text-[1.15rem]">
            <span className="bg-gradient-to-r from-[#2ad8ff] via-[#6489ff] to-[#a459ff] bg-clip-text text-transparent">
              All your money,
              <br />
              All in one place.
            </span>
          </h1>
          <div className="relative h-[6.2rem] w-[9.2rem] shrink-0 sm:h-[6.7rem] sm:w-[9.9rem]">
            <HeroBankScene />
          </div>
        </div>

        {/* Section 3: Description (full width, below bank) */}
        <p className="text-[0.7rem] leading-[1.4] text-muted-foreground line-clamp-2 min-[360px]:text-[0.75rem]">
          Manage accounts, track spending, understand categories and split expenses effortlessly.
        </p>
      </div>

      <div className="relative mt-1.5 overflow-hidden rounded-[1.15rem] border border-[rgba(68,132,255,0.76)] bg-card p-1 shadow-[0_0_26px_rgba(56,100,255,0.1),inset_0_1px_0_rgba(255,255,255,0.06)]">
        <div className="pointer-events-none absolute inset-0" style={{ background: 'linear-gradient(120deg, rgba(57,73,180,0.1), transparent 46%, rgba(9,176,255,0.07))' }} />
        <button
          type="button"
          onClick={() => router.push('/accounts')}
          className="relative grid min-h-[7rem] w-full grid-cols-[minmax(0,1fr)_1px_minmax(6.75rem,0.9fr)] rounded-[calc(1.15rem-4px)] bg-card text-left focus-visible:outline-2 focus-visible:outline-ring"
          aria-label="Current balance — view accounts"
        >
          <span className="flex min-w-0 flex-col justify-center px-2 py-2 min-[360px]:px-2.5">
            <span className="flex items-center gap-1 text-[0.65rem] font-medium text-muted-foreground min-[360px]:text-xs">
              Current Balance
              <span
                role="button"
                tabIndex={0}
                aria-label={hidden ? 'Show balance' : 'Hide balance'}
                aria-pressed={hidden}
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  setHidden((value) => !value)
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    event.stopPropagation()
                    setHidden((value) => !value)
                  }
                }}
                className="inline-flex size-3.75 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
              >
                {hidden ? <EyeOff className="size-2.5" aria-hidden="true" /> : <Eye className="size-2.5" aria-hidden="true" />}
              </span>
            </span>
            <AnimatedAmount value={summary.totalBalance} currency={summary.currency} hidden={hidden} className="mt-0.5 whitespace-nowrap text-[1.35rem] font-extrabold leading-none tracking-[-0.06em] min-[360px]:text-[1.6rem]" />
            <span className="mt-1 inline-flex min-h-5.5 w-fit items-center gap-0.5 rounded-full border border-[rgba(52,211,153,0.28)] bg-[rgba(52,211,153,0.14)] px-1.5 text-[0.52rem] font-semibold text-[#047857] min-[360px]:gap-1 min-[360px]:px-2 min-[360px]:text-[0.58rem] dark:text-positive">
              <TrendingUp className="size-1.5 min-[360px]:size-1.75" aria-hidden="true" />
              Healthy cash flow
            </span>
          </span>

          <span className="my-auto h-[4.2rem] bg-white/[0.09]" aria-hidden="true" />

          <span className="flex min-w-0 flex-col justify-center gap-1 px-2 py-2 min-[360px]:gap-1.5 min-[360px]:px-2.5">
            <span className="text-[0.55rem] leading-tight text-muted-foreground min-[360px]:text-[0.62rem]">
              Across your <strong className="block font-semibold text-foreground">{summary.accountCount} accounts</strong>
            </span>
            <span className="flex items-center justify-between gap-0.5 min-[360px]:gap-1" aria-label={`${summary.accountCount} account types`}>
              <AccountIcon icon={Landmark} className="border-violet-400/20 bg-violet-500/10 text-violet-400" />
              <AccountIcon icon={CreditCard} className="border-sky-400/20 bg-sky-500/10 text-sky-400" />
              <AccountIcon icon={Wallet} className="border-emerald-400/20 bg-emerald-500/10 text-emerald-400" />
              <AccountIcon icon={Wifi} className="border-amber-400/20 bg-amber-500/10 text-amber-400" />
              <span className="flex size-3.75 shrink-0 items-center justify-center rounded-full bg-white/[0.05] text-[0.42rem] font-bold text-muted-foreground min-[360px]:size-4 min-[360px]:text-[0.45rem]">+1</span>
            </span>
          </span>
        </button>
      </div>
    </section>
  )
}

function AccountIcon({ icon: Icon, className }: { icon: LucideIcon; className: string }) {
  return (
    <span className={`flex size-3.75 shrink-0 items-center justify-center rounded-full border min-[360px]:size-4 ${className}`}>
      <Icon className="size-1.75 min-[360px]:size-2" aria-hidden="true" />
    </span>
  )
}

'use client'

import { GroupList } from '@/src/features/splitpay/components/home/group-list'
import { SettleBanner } from '@/src/features/splitpay/components/home/settle-banner'
import { SplitBalanceHero } from '@/src/features/splitpay/components/home/split-balance-hero'
import { MemberList } from '@/src/features/splitpay/components/member/member-list'
import { splitGroups, splitMembers, splitPaySummary } from '@/src/lib/data'
import { IconButton } from '@/src/shared/components/icon-button'
import { MobileShell } from '@/src/shared/components/mobile-shell'
import { PageHeader } from '@/src/shared/components/page-header'
import { QuickActions, type QuickAction } from '@/src/shared/components/quick-actions'
import { motion } from 'framer-motion'
import { BellRing, HandCoins, Plus, Receipt, Search } from 'lucide-react'

const quickActions: QuickAction[] = [
  { id: 'new-split', icon: Plus, label: 'New Split', hint: 'Any bill', tone: 'primary' },
  { id: 'settle', icon: HandCoins, label: 'Settle Up', hint: 'Via UPI', tone: 'positive' },
  { id: 'scan', icon: Receipt, label: 'Scan Bill', hint: 'Auto split', tone: 'info' },
  { id: 'remind', icon: BellRing, label: 'Remind', hint: 'Nudge friends', tone: 'warning' },
]

const sectionMotion = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-30px' },
  transition: { type: 'spring' as const, stiffness: 200, damping: 26 },
}

export default function SplitPayPage() {
  return (
    <MobileShell>
      <PageHeader
        title="SplitPay"
        subtitle="Simplify bills, split smartly"
        actions={
          <>
            <IconButton icon={Search} label="Search groups" />
            <IconButton icon={Plus} label="New split" className="bg-primary/20 text-primary" />
          </>
        }
      />

      {/* Hero — 3D settlement scene + summary trio */}
      <SplitBalanceHero summary={splitPaySummary} />

      {/* Pending settlements */}
      <motion.div {...sectionMotion}>
        <GroupList groups={splitGroups} />
      </motion.div>

      <SettleBanner />

      {/* You're involved in */}
      <motion.div {...sectionMotion}>
        <MemberList members={splitMembers} />
      </motion.div>

      {/* Quick actions — shared premium interaction language */}
      <motion.section aria-label="SplitPay quick actions" {...sectionMotion}>
        <QuickActions actions={quickActions} />
      </motion.section>
    </MobileShell>
  )
}

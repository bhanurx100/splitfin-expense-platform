'use client'

import { IconButton } from '@/src/shared/components/icon-button'
import { MobileShell } from '@/src/shared/components/mobile-shell'
import { PageHeader } from '@/src/shared/components/page-header'
import { GroupList } from '@/src/features/splitpay/components/home/group-list'
import { SettleBanner } from '@/src/features/splitpay/components/home/settle-banner'
import { SplitBalanceHero } from '@/src/features/splitpay/components/home/split-balance-hero'
import { MemberList } from '@/src/features/splitpay/components/member/member-list'
import { splitGroups, splitMembers, splitPaySummary } from '@/src/lib/data'
import { Plus, Search } from 'lucide-react'

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

      <SplitBalanceHero summary={splitPaySummary} />

      <GroupList groups={splitGroups} />

      <SettleBanner />

      <MemberList members={splitMembers} />
    </MobileShell>
  )
}

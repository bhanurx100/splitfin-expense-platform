"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useGroupData }           from "@/src/features/splitpay/hooks/use-group-data"
import { GroupHeader }            from "@/src/features/splitpay/components/group/group-header"
import { GroupSummaryCard }       from "@/src/features/splitpay/components/group/group-summary-card"
import { GroupActions }           from "@/src/features/splitpay/components/group/group-actions"
import { GroupTabs }              from "@/src/features/splitpay/components/group/group-tabs"
import { TimelineSection }        from "@/src/features/splitpay/components/group/timeline-section"
import { MemberList }             from "@/src/features/splitpay/components/group/member-list"
import { MemberActionsSheet }     from "@/src/features/splitpay/components/group/member-actions-sheet"
import { BackgroundParticles }    from "@/src/features/splitpay/components/group/background-particles"
import { pageFadeUp }             from "@/src/features/splitpay/motions/motion"
import type { GroupTab, GroupMember } from "@/src/features/splitpay/types/group"

export default function GroupPage() {
  const params   = useParams<{ groupId: string }>()
  const router   = useRouter()
  const groupId  = params?.groupId ?? "group_goa"

  const { data, isLoading } = useGroupData(groupId)

  const [activeTab,        setActiveTab]        = useState<GroupTab>("timeline")
  const [actionMember,     setActionMember]     = useState<GroupMember | null>(null)
  const [memberSheetOpen,  setMemberSheetOpen]  = useState(false)

  if (isLoading) return null

  const { summary, members, timeline, currentUserId } = data

  function handleMemberAction(member: GroupMember) {
    if (member.isYou) return
    setActionMember(member)
    setMemberSheetOpen(true)
  }

  return (
    <>
      {/* Ambient background */}
      <BackgroundParticles />

      {/* Page */}
      <motion.div
        variants={pageFadeUp}
        initial="initial"
        animate="animate"
        className="relative flex flex-col min-h-dvh max-w-[430px] mx-auto"
        style={{
          background:   "#050816",
          zIndex:       1,
          paddingBottom:"32px",
        }}
      >
        {/* 1. Header */}
        <GroupHeader
          summary={summary}
          onBack={() => router.back()}
          onSettings={() => console.log("settings")}
        />

        {/* Scrollable content */}
        <div className="flex flex-col gap-4 pt-4">
          {/* 2. Summary Hero Card */}
          <GroupSummaryCard summary={summary} />

          {/* 3. Action Buttons */}
          <GroupActions
            onAddExpense={() => console.log("add expense")}
            onSettleUp={()   => console.log("settle up")}
          />

          {/* 4. Segmented Tabs */}
          <GroupTabs active={activeTab} onChange={setActiveTab} />

          {/* 5/6. Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === "timeline" ? (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{    opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                <TimelineSection cards={timeline} />
              </motion.div>
            ) : (
              <motion.div
                key="members"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{    opacity: 0, y: -8 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                <MemberList
                  members={members}
                  currencySymbol={summary.currencySymbol}
                  onAddMember={()              => console.log("add member")}
                  onMemberAction={handleMemberAction}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Member actions sheet */}
      <MemberActionsSheet
        member={actionMember}
        open={memberSheetOpen}
        onClose={() => { setMemberSheetOpen(false); setActionMember(null) }}
      />
    </>
  )
}
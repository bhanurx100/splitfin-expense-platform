"use client"

import { useMemo } from "react"
import { useGroupStore } from "./useGroupStore"
import { computeGroupSettlement } from "../lib/calculations"
import type { GroupPageData, GroupSummary, GroupPageMember, TimelineCard } from "../types/group"
interface UseGroupDataReturn {
  data:      GroupPageData
  isLoading: boolean
  isError:   boolean
}

/**
 * useGroupData
 * Provides all data for the Group Page.
 * Consumes Zustand store instead of mock data.
 */
export function useGroupData(groupId: string | null): UseGroupDataReturn {
  const group = useGroupStore((s) => s.groups.find((g) => g.id === groupId))
  const activeGroupId = useGroupStore((s) => s.activeGroupId)

  const data = useMemo<GroupPageData>(() => {
    // Use provided groupId, fall back to activeGroupId from store
    const targetGroupId = groupId ?? activeGroupId
    const targetGroup = group ?? useGroupStore.getState().groups.find((g) => g.id === targetGroupId)

    if (!targetGroup) {
      // Return empty/default data structure matching GroupPageData
      return {
        summary: {
          id: targetGroupId ?? "",
          name: "Group not found",
          emoji: "📁",
          memberCount: 0,
          totalExpenses: 0,
          youWillPay: 0,
          youWillReceive: 0,
          settled: 0,
          lastSettledAt: null,
          currency: "INR",
          currencySymbol: "₹",
        },
        members: [],
        timeline: [],
        currentUserId: "",
      }
    }

    const settlement = computeGroupSettlement(targetGroup)

    // Convert to GroupPageData format
    const currency = targetGroup.currency ?? "INR"
    const summary: GroupSummary = {
      id: targetGroup.id,
      name: targetGroup.name,
      emoji: targetGroup.emoji,
      memberCount: targetGroup.members.length,
      totalExpenses: targetGroup.expenses.reduce((sum, e) => sum + e.amount, 0),
      youWillPay: 0, // Would need current user context
      youWillReceive: 0, // Would need current user context
      settled: 0, // Would need settlement data
      lastSettledAt: null,
      currency,
      currencySymbol: currency === "INR" ? "₹" : "$",
    }

    const members: GroupPageMember[] = targetGroup.members.map((m) => ({
      id: m.id,
      name: m.name,
      emoji: m.emoji,
      role: "member", // Default role
      isYou: false, // Would need current user context
      joinedAt: targetGroup.createdAt,
      balance: settlement.balances.find((b) => b.memberId === m.id)?.netBalance ?? 0,
    }))

    const timeline: TimelineCard[] = targetGroup.expenses.map((e) => {
      const payer = targetGroup.members.find((m) => m.id === e.paidBy)
      return {
        id: e.id,
        type: "expense_created",
        title: e.title,
        subtitle: `Paid by ${payer?.name ?? "Unknown"}`,
        amount: e.amount,
        time: e.date,
        dateGroup: "earlier", // Would need date calculation
        payers: payer ? [{
          id: payer.id,
          name: payer.name,
          emoji: payer.emoji,
          amount: e.amount,
        }] : [],
        category: e.category,
        note: e.notes,
      }
    })

    return {
      summary,
      members,
      timeline,
      currentUserId: "", // Would need auth context
    }
  }, [groupId, group, activeGroupId])

  return { data, isLoading: false, isError: false }
}
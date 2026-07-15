/**
 * Mock data for Group Page.
 * All UI consumes this via the useGroupData hook.
 * Replace hook internals with API call — zero component changes required.
 */

import type { GroupPageData, GroupPageMember } from "../types/group"

// ─── Helper ───────────────────────────────────────────────────────────────────

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString()
}
function daysAgo(d: number): string {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString()
}

// ─── Mock Group Data ──────────────────────────────────────────────────────────

export const MOCK_GROUP_DATA: GroupPageData = {
  currentUserId: "user_karan",

  summary: {
    id:             "group_goa",
    name:           "Goa Trip",
    emoji:          "🏖️",
    memberCount:    6,
    totalExpenses:  28640,
    youWillPay:     1230,
    youWillReceive: 1740,
    settled:        8560,
    lastSettledAt:  "2024-05-12T00:00:00.000Z",
    currency:       "INR",
    currencySymbol: "₹",
  },

  members: [
    {
      id:       "user_karan",
      name:     "You (Karan)",
      emoji:    "👑",
      role:     "admin",
      isYou:    true,
      joinedAt: daysAgo(30),
      balance:  510,       // net: receive 1740 - pay 1230
    } as GroupPageMember,
    {
      id:       "user_rahul",
      name:     "Rahul",
      emoji:    "🍕",
      role:     "member",
      isYou:    false,
      joinedAt: daysAgo(29),
      balance:  -420,      // owes you
    } as GroupPageMember,
    {
      id:       "user_neha",
      name:     "Neha",
      emoji:    "🎨",
      role:     "member",
      isYou:    false,
      joinedAt: daysAgo(29),
      balance:  300,       // owes you
    } as GroupPageMember,
    {
      id:       "user_amit",
      name:     "Amit",
      emoji:    "🚗",
      role:     "member",
      isYou:    false,
      joinedAt: daysAgo(28),
      balance:  -600,      // owes you
    } as GroupPageMember,
    {
      id:       "user_priya",
      name:     "Priya",
      emoji:    "🎁",
      role:     "member",
      isYou:    false,
      joinedAt: daysAgo(28),
      balance:  210,
    } as GroupPageMember,
    {
      id:       "user_simran",
      name:     "Simran",
      emoji:    "📸",
      role:     "member",
      isYou:    false,
      joinedAt: daysAgo(27),
      balance:  -200,
    } as GroupPageMember,
  ],

  timeline: [
    // ── TODAY ──────────────────────────────────────────────────────────────
    {
      id:        "t1",
      type:      "expense_created",
      title:     "Lunch at Hill Top",
      subtitle:  "Paid by Rahul and You",
      amount:    1500,
      time:      hoursAgo(1.5),
      dateGroup: "today",
      category:  "🍽️",
      payers: [
        { id: "user_rahul", name: "Rahul", emoji: "🍕", amount: 750 },
        { id: "user_karan", name: "You",   emoji: "👑", amount: 750 },
      ],
      note:   "Lunch near the hill top",
      status: "pending",
    },
    {
      id:        "t2",
      type:      "expense_created",
      title:     "Taxi to Baga Beach",
      subtitle:  "Paid by You",
      amount:    850,
      time:      hoursAgo(3),
      dateGroup: "today",
      category:  "🚕",
      payers: [
        { id: "user_karan", name: "You", emoji: "👑", amount: 850 },
      ],
      status: "pending",
    },

    // ── YESTERDAY ──────────────────────────────────────────────────────────
    {
      id:        "t3",
      type:      "settlement",
      title:     "Rahul paid Neha",
      subtitle:  "Settlement completed",
      amount:    420,
      time:      daysAgo(1),
      dateGroup: "yesterday",
      payers: [
        { id: "user_rahul", name: "Rahul", emoji: "🍕", amount: 420 },
      ],
      status: "completed",
    },
    {
      id:        "t4",
      type:      "payment_detected",
      title:     "Payment received!",
      subtitle:  "₹600 from Amit",
      amount:    600,
      time:      daysAgo(1),
      dateGroup: "yesterday",
      via:       "PhonePe",
      transactionId: "T240516402389",
      payers: [
        { id: "user_amit", name: "Amit", emoji: "🚗", amount: 600 },
      ],
      status: "completed",
    },
    {
      id:        "t5",
      type:      "expense_created",
      title:     "Sunset Cruise",
      subtitle:  "Paid by Neha",
      amount:    2400,
      time:      daysAgo(1),
      dateGroup: "yesterday",
      category:  "🛳️",
      payers: [
        { id: "user_neha",  name: "Neha",  emoji: "🎨", amount: 2400 },
      ],
      status: "pending",
    },

    // ── EARLIER ────────────────────────────────────────────────────────────
    {
      id:        "t6",
      type:      "expense_edited",
      title:     "Beach Villa — Edited",
      subtitle:  "Amount updated by Karan",
      amount:    24000,
      time:      daysAgo(3),
      dateGroup: "earlier",
      category:  "🏨",
      editedFrom:22000,
      payers: [
        { id: "user_karan", name: "You", emoji: "👑", amount: 24000 },
      ],
      status: "pending",
    },
    {
      id:        "t7",
      type:      "expense_created",
      title:     "Scooter Rentals",
      subtitle:  "Paid by Rahul",
      amount:    3200,
      time:      daysAgo(4),
      dateGroup: "earlier",
      category:  "🛵",
      payers: [
        { id: "user_rahul", name: "Rahul", emoji: "🍕", amount: 3200 },
      ],
      status: "pending",
    },
    {
      id:        "t8",
      type:      "payment_manual",
      title:     "You paid Priya",
      subtitle:  "Marked as paid manually",
      amount:    500,
      time:      daysAgo(5),
      dateGroup: "earlier",
      payers: [
        { id: "user_karan", name: "You", emoji: "👑", amount: 500 },
      ],
      status: "completed",
    },
    {
      id:        "t9",
      type:      "expense_deleted",
      title:     "Airport Transfer — Deleted",
      subtitle:  "Removed by Amit",
      amount:    1800,
      time:      daysAgo(6),
      dateGroup: "earlier",
      category:  "✈️",
      payers: [
        { id: "user_amit", name: "Amit", emoji: "🚗", amount: 1800 },
      ],
      status: "completed",
    },
  ],
}

// ─── Per-group data map (for multi-group support) ─────────────────────────────

export const MOCK_GROUPS_MAP: Record<string, GroupPageData> = {
  group_goa:    MOCK_GROUP_DATA,
  // Add more groups here as needed
}

export const FALLBACK_GROUP_ID = "group_goa"
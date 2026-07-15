/**
 * data/splitpay/demo.ts
 *
 * Central dummy data for SplitPay feature.
 * All SplitPay components should consume data from here.
 * In production, replace with API/TanStack Query responses.
 */

import type { Group, Member, Expense } from "@/src/features/splitpay/types";

// ─── Helper functions ─────────────────────────────────────────────────────────────

function hoursAgo(h: number): string {
  return new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
}

function daysAgo(d: number): string {
  return new Date(Date.now() - d * 24 * 60 * 60 * 1000).toISOString();
}

// ─── Members ─────────────────────────────────────────────────────────────────────

const DEMO_MEMBERS: Member[] = [
  {
    id: "user_karan",
    name: "Karan",
    emoji: "👑",
    color: "#6C5CE7",
  },
  {
    id: "user_rahul",
    name: "Rahul",
    emoji: "🍕",
    color: "#3b82f6",
  },
  {
    id: "user_neha",
    name: "Neha",
    emoji: "🎨",
    color: "#ec4899",
  },
  {
    id: "user_amit",
    name: "Amit",
    emoji: "🚗",
    color: "#10b981",
  },
  {
    id: "user_priya",
    name: "Priya",
    emoji: "🎁",
    color: "#f59e0b",
  },
  {
    id: "user_simran",
    name: "Simran",
    emoji: "📸",
    color: "#ef4444",
  },
];

// ─── Expenses ───────────────────────────────────────────────────────────────────

const DEMO_EXPENSES: Expense[] = [
  {
    id: "exp_1",
    groupId: "group_goa",
    title: "Lunch at Hill Top",
    amount: 1500,
    currency: "INR",
    category: "food",
    splitType: "equal",
    splitMethod: "equal",
    taxPct: 0,
    tipPct: 0,
    paidBy: "user_rahul",
    participants: [
      { memberId: "user_karan", value: 250 },
      { memberId: "user_rahul", value: 250 },
      { memberId: "user_neha", value: 250 },
      { memberId: "user_amit", value: 250 },
      { memberId: "user_priya", value: 250 },
      { memberId: "user_simran", value: 250 },
    ],
    date: hoursAgo(1.5),
    notes: "Lunch near the hill top",
  },
  {
    id: "exp_2",
    groupId: "group_goa",
    title: "Taxi to Baga Beach",
    amount: 850,
    currency: "INR",
    category: "transport",
    splitType: "equal",
    splitMethod: "equal",
    taxPct: 0,
    tipPct: 0,
    paidBy: "user_karan",
    participants: [
      { memberId: "user_karan", value: 170 },
      { memberId: "user_rahul", value: 170 },
      { memberId: "user_neha", value: 170 },
      { memberId: "user_amit", value: 170 },
      { memberId: "user_priya", value: 170 },
    ],
    date: hoursAgo(3),
    notes: "",
  },
  {
    id: "exp_3",
    groupId: "group_goa",
    title: "Sunset Cruise",
    amount: 2400,
    currency: "INR",
    category: "entertainment",
    splitType: "equal",
    splitMethod: "equal",
    taxPct: 0,
    tipPct: 0,
    paidBy: "user_neha",
    participants: [
      { memberId: "user_karan", value: 400 },
      { memberId: "user_rahul", value: 400 },
      { memberId: "user_neha", value: 400 },
      { memberId: "user_amit", value: 400 },
      { memberId: "user_priya", value: 400 },
      { memberId: "user_simran", value: 400 },
    ],
    date: daysAgo(1),
    notes: "",
  },
  {
    id: "exp_4",
    groupId: "group_goa",
    title: "Beach Villa",
    amount: 24000,
    currency: "INR",
    category: "stay",
    splitType: "equal",
    splitMethod: "equal",
    taxPct: 0,
    tipPct: 0,
    paidBy: "user_karan",
    participants: [
      { memberId: "user_karan", value: 4000 },
      { memberId: "user_rahul", value: 4000 },
      { memberId: "user_neha", value: 4000 },
      { memberId: "user_amit", value: 4000 },
      { memberId: "user_priya", value: 4000 },
      { memberId: "user_simran", value: 4000 },
    ],
    date: daysAgo(3),
    notes: "3 nights stay",
  },
  {
    id: "exp_5",
    groupId: "group_goa",
    title: "Scooter Rentals",
    amount: 3200,
    currency: "INR",
    category: "transport",
    splitType: "equal",
    splitMethod: "equal",
    taxPct: 0,
    tipPct: 0,
    paidBy: "user_rahul",
    participants: [
      { memberId: "user_karan", value: 533.33 },
      { memberId: "user_rahul", value: 533.33 },
      { memberId: "user_neha", value: 533.33 },
      { memberId: "user_amit", value: 533.33 },
      { memberId: "user_priya", value: 533.33 },
      { memberId: "user_simran", value: 533.33 },
    ],
    date: daysAgo(4),
    notes: "2 scooters for 3 days",
  },
  {
    id: "exp_6",
    groupId: "group_goa",
    title: "Airport Transfer",
    amount: 1800,
    currency: "INR",
    category: "transport",
    splitType: "equal",
    splitMethod: "equal",
    taxPct: 0,
    tipPct: 0,
    paidBy: "user_amit",
    participants: [
      { memberId: "user_karan", value: 300 },
      { memberId: "user_rahul", value: 300 },
      { memberId: "user_neha", value: 300 },
      { memberId: "user_amit", value: 300 },
      { memberId: "user_priya", value: 300 },
      { memberId: "user_simran", value: 300 },
    ],
    date: daysAgo(6),
    notes: "",
  },
];

// ─── Groups ─────────────────────────────────────────────────────────────────────

export const DEMO_GROUPS: Group[] = [
  {
    id: "group_goa",
    name: "Goa Trip",
    emoji: "🏖️",
    currency: "INR",
    createdAt: daysAgo(30),
    members: DEMO_MEMBERS,
    expenses: DEMO_EXPENSES.filter((e) => e.groupId === "group_goa"),
  },
  {
    id: "group_dinner",
    name: "Weekend Dinner",
    emoji: "🍽️",
    currency: "INR",
    createdAt: daysAgo(60),
    members: [
      {
        id: "user_karan",
        name: "Karan",
        emoji: "👑",
        color: "#6C5CE7",
      },
      {
        id: "user_rahul",
        name: "Rahul",
        emoji: "🍕",
        color: "#3b82f6",
      },
      {
        id: "user_neha",
        name: "Neha",
        emoji: "🎨",
        color: "#ec4899",
      },
      {
        id: "user_amit",
        name: "Amit",
        emoji: "🚗",
        color: "#10b981",
      },
    ],
    expenses: [
      {
        id: "exp_dinner_1",
        groupId: "group_dinner",
        title: "Dinner at Skyline",
        amount: 3200,
        currency: "INR",
        category: "food",
        splitType: "equal",
        splitMethod: "equal",
        taxPct: 0,
        tipPct: 0,
        paidBy: "user_karan",
        participants: [
          { memberId: "user_karan", value: 800 },
          { memberId: "user_rahul", value: 800 },
          { memberId: "user_neha", value: 800 },
          { memberId: "user_amit", value: 800 },
        ],
        date: daysAgo(2),
        notes: "",
      },
    ],
  },
  {
    id: "group_office",
    name: "Office Friends",
    emoji: "☕",
    currency: "INR",
    createdAt: daysAgo(90),
    members: [
      {
        id: "user_karan",
        name: "Karan",
        emoji: "👑",
        color: "#6C5CE7",
      },
      {
        id: "user_rahul",
        name: "Rahul",
        emoji: "🍕",
        color: "#3b82f6",
      },
      {
        id: "user_neha",
        name: "Neha",
        emoji: "🎨",
        color: "#ec4899",
      },
      {
        id: "user_amit",
        name: "Amit",
        emoji: "🚗",
        color: "#10b981",
      },
      {
        id: "user_priya",
        name: "Priya",
        emoji: "🎁",
        color: "#f59e0b",
      },
      {
        id: "user_simran",
        name: "Simran",
        emoji: "📸",
        color: "#ef4444",
      },
      {
        id: "user_vikram",
        name: "Vikram",
        emoji: "💼",
        color: "#06b6d4",
      },
      {
        id: "user_deepa",
        name: "Deepa",
        emoji: "🌟",
        color: "#84cc16",
      },
    ],
    expenses: [
      {
        id: "exp_office_1",
        groupId: "group_office",
        title: "Team Lunch",
        amount: 4500,
        currency: "INR",
        category: "food",
        splitType: "equal",
        splitMethod: "equal",
        taxPct: 0,
        tipPct: 0,
        paidBy: "user_vikram",
        participants: [
          { memberId: "user_karan", value: 562.5 },
          { memberId: "user_rahul", value: 562.5 },
          { memberId: "user_neha", value: 562.5 },
          { memberId: "user_amit", value: 562.5 },
          { memberId: "user_priya", value: 562.5 },
          { memberId: "user_simran", value: 562.5 },
          { memberId: "user_vikram", value: 562.5 },
          { memberId: "user_deepa", value: 562.5 },
        ],
        date: daysAgo(5),
        notes: "",
      },
    ],
  },
  {
    id: "group_flat",
    name: "Flatmates",
    emoji: "🏠",
    currency: "INR",
    createdAt: daysAgo(180),
    members: [
      {
        id: "user_karan",
        name: "Karan",
        emoji: "👑",
        color: "#6C5CE7",
      },
      {
        id: "user_rahul",
        name: "Rahul",
        emoji: "🍕",
        color: "#3b82f6",
      },
      {
        id: "user_neha",
        name: "Neha",
        emoji: "🎨",
        color: "#ec4899",
      },
    ],
    expenses: [
      {
        id: "exp_flat_1",
        groupId: "group_flat",
        title: "Groceries",
        amount: 2800,
        currency: "INR",
        category: "groceries",
        splitType: "equal",
        splitMethod: "equal",
        taxPct: 0,
        tipPct: 0,
        paidBy: "user_neha",
        participants: [
          { memberId: "user_karan", value: 933.33 },
          { memberId: "user_rahul", value: 933.33 },
          { memberId: "user_neha", value: 933.33 },
        ],
        date: daysAgo(1),
        notes: "Monthly groceries",
      },
    ],
  },
];

// ─── Default active group ─────────────────────────────────────────────────────────

export const DEMO_DEFAULT_ACTIVE_GROUP_ID = "group_goa";

// ─── Current user ID ─────────────────────────────────────────────────────────────

export const DEMO_CURRENT_USER_ID = "user_karan";

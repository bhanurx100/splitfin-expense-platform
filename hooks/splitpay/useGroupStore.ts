"use client";

/**
 * hooks/splitpay/useGroupStore.ts
 *
 * Central state store for the SplitPay feature.
 * Uses Zustand + persist middleware (localStorage).
 *
 * DEMO SEEDING:
 *   On first load (no localStorage key found), the store is initialised
 *   with DEMO_GROUPS from data/splitpay/demo.ts so the UI is never empty.
 *   Once the user creates/deletes groups the demo state is replaced naturally.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { createId } from "@paralleldrive/cuid2";
import type { Group, Member, Expense } from "@/types/splitpay";

// ── Demo seed ─────────────────────────────────────────────────────────────────
import {
  DEMO_GROUPS,
  DEMO_DEFAULT_ACTIVE_GROUP_ID,
} from "@/data/splitpay/demo";

const AVATAR_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#6366f1",
];

// ── Store shape ───────────────────────────────────────────────────────────────

type GroupStore = {
  groups: Group[];
  activeGroupId: string | null;
  /** true once user has explicitly interacted — prevents re-seeding */
  _seeded: boolean;

  // Group actions
  createGroup: (name: string, emoji?: string) => string;
  updateGroup: (
    id: string,
    patch: Partial<Pick<Group, "name" | "emoji">>
  ) => void;
  deleteGroup: (id: string) => void;
  setActiveGroup: (id: string | null) => void;

  // Member actions
  addMember: (groupId: string, member: Omit<Member, "id" | "color">) => string;
  updateMember: (
    groupId: string,
    memberId: string,
    patch: Partial<Omit<Member, "id">>
  ) => void;
  removeMember: (groupId: string, memberId: string) => void;

  // Expense actions
  addExpense: (
    groupId: string,
    expense: Omit<Expense, "id" | "groupId">
  ) => string;
  updateExpense: (
    groupId: string,
    expenseId: string,
    patch: Partial<Omit<Expense, "id" | "groupId">>
  ) => void;
  removeExpense: (groupId: string, expenseId: string) => void;

  // Demo helpers
  resetToDemo: () => void;

  // Selectors
  getGroup: (id: string) => Group | undefined;
  getActive: () => Group | undefined;
};

// ── Store implementation ──────────────────────────────────────────────────────

export const useGroupStore = create<GroupStore>()(
  persist(
    (set, get) => ({
      // ── Default state: seeded with demo data ──────────────────────────────
      groups: DEMO_GROUPS,
      activeGroupId: DEMO_DEFAULT_ACTIVE_GROUP_ID,
      _seeded: true,

      /* ── Group ─────────────────────────────────────────────────────────── */
      createGroup: (name, emoji) => {
        const id = createId();
        set((s) => ({
          groups: [
            ...s.groups,
            {
              id,
              name,
              emoji,
              members: [],
              expenses: [],
              createdAt: new Date().toISOString(),
            },
          ],
          activeGroupId: id,
        }));
        return id;
      },

      updateGroup: (id, patch) =>
        set((s) => ({
          groups: s.groups.map((g) => (g.id === id ? { ...g, ...patch } : g)),
        })),

      deleteGroup: (id) =>
        set((s) => ({
          groups: s.groups.filter((g) => g.id !== id),
          activeGroupId:
            s.activeGroupId === id
              ? s.groups.find((g) => g.id !== id)?.id ?? null
              : s.activeGroupId,
        })),

      setActiveGroup: (id) => set({ activeGroupId: id }),

      /* ── Member ────────────────────────────────────────────────────────── */
      addMember: (groupId, member) => {
        const id = createId();
        set((s) => ({
          groups: s.groups.map((g) => {
            if (g.id !== groupId) return g;
            const color =
              AVATAR_COLORS[g.members.length % AVATAR_COLORS.length];
            return { ...g, members: [...g.members, { ...member, id, color }] };
          }),
        }));
        return id;
      },

      updateMember: (groupId, memberId, patch) =>
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id !== groupId
              ? g
              : {
                  ...g,
                  members: g.members.map((m) =>
                    m.id === memberId ? { ...m, ...patch } : m
                  ),
                }
          ),
        })),

      removeMember: (groupId, memberId) =>
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id !== groupId
              ? g
              : {
                  ...g,
                  members: g.members.filter((m) => m.id !== memberId),
                  expenses: g.expenses.map((e) => ({
                    ...e,
                    participants: e.participants.filter(
                      (p) => p.memberId !== memberId
                    ),
                    paidBy: e.paidBy === memberId ? "" : e.paidBy,
                  })),
                }
          ),
        })),

      /* ── Expense ───────────────────────────────────────────────────────── */
      addExpense: (groupId, expense) => {
        const id = createId();
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id !== groupId
              ? g
              : {
                  ...g,
                  expenses: [...g.expenses, { ...expense, id, groupId }],
                }
          ),
        }));
        return id;
      },

      updateExpense: (groupId, expenseId, patch) =>
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id !== groupId
              ? g
              : {
                  ...g,
                  expenses: g.expenses.map((e) =>
                    e.id === expenseId ? { ...e, ...patch } : e
                  ),
                }
          ),
        })),

      removeExpense: (groupId, expenseId) =>
        set((s) => ({
          groups: s.groups.map((g) =>
            g.id !== groupId
              ? g
              : {
                  ...g,
                  expenses: g.expenses.filter((e) => e.id !== expenseId),
                }
          ),
        })),

      /* ── Demo helpers ──────────────────────────────────────────────────── */
      resetToDemo: () =>
        set({
          groups: DEMO_GROUPS,
          activeGroupId: DEMO_DEFAULT_ACTIVE_GROUP_ID,
          _seeded: true,
        }),

      /* ── Selectors ─────────────────────────────────────────────────────── */
      getGroup: (id) => get().groups.find((g) => g.id === id),
      getActive: () => {
        const id = get().activeGroupId;
        return id ? get().groups.find((g) => g.id === id) : undefined;
      },
    }),
    {
      name: "splitfin-splitpay-v1",
      partialize: (s) => ({
        groups: s.groups,
        activeGroupId: s.activeGroupId,
        _seeded: s._seeded,
      }),
      // On rehydration: if localStorage has an empty groups array
      // (e.g. user cleared all groups), re-seed with demo data.
      onRehydrateStorage: () => (state) => {
        if (state && state.groups.length === 0) {
          state.groups = DEMO_GROUPS;
          state.activeGroupId = DEMO_DEFAULT_ACTIVE_GROUP_ID;
          state._seeded = true;
        }
      },
    }
  )
);

// ── Derived hook: settlement for a group ──────────────────────────────────────

import { useMemo } from "react";
import { computeGroupSettlement } from "@/features/splitpay/lib/calculations";

export function useGroupSettlement(groupId: string | null) {
  const group = useGroupStore((s) => s.groups.find((g) => g.id === groupId));

  return useMemo(() => {
    if (!group) return null;
    return computeGroupSettlement(group);
  }, [group]);
}

// ── Derived hook: expense breakdowns for a group ──────────────────────────────

import { computeExpenseBreakdown } from "@/features/splitpay/lib/calculations";

export function useExpenseBreakdowns(groupId: string | null) {
  const group = useGroupStore((s) => s.groups.find((g) => g.id === groupId));

  return useMemo(() => {
    if (!group) return {};
    return Object.fromEntries(
      group.expenses.map((e) => [e.id, computeExpenseBreakdown(e)])
    );
  }, [group]);
}

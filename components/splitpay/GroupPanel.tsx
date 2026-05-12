"use client";

/**
 * components/splitpay/GroupPanel.tsx
 *
 * Renders the group list sidebar.
 * Additions over original:
 *   - "Reset Demo" button to restore demo data (great for portfolio showcasing)
 *   - Demo badge on groups that are part of the built-in demo set
 *   - Active group highlighted with blue accent
 */

import { useState } from "react";
import { Plus, Users, Trash2, ChevronRight, RefreshCw, Sparkles } from "lucide-react";
import { useGroupStore } from "@/hooks/splitpay/useGroupStore";
import { computeGroupBalances } from "@/utils/splitpay/calculations";
import { DEMO_GROUPS } from "@/data/splitpay/demo";
import type { Group } from "@/types/splitpay";
import { EmptyBlock, inr, SectionLabel } from "./ui";
import { cn } from "@/lib/utils";

// IDs of built-in demo groups (used to show a "Demo" badge)
const DEMO_IDS = new Set(DEMO_GROUPS.map(g => g.id));

const GROUP_EMOJIS = ["🌴","🍽️","🏠","🎉","✈️","🚗","🎮","🎵","🏕️","💼"];

// ── CreateGroupSheet ──────────────────────────────────────────────────────────

export function CreateGroupSheet({ onClose }: { onClose: () => void }) {
  const [name, setName]   = useState("");
  const [emoji, setEmoji] = useState("🌴");
  const { createGroup }   = useGroupStore();

  function submit() {
    const n = name.trim();
    if (!n) return;
    createGroup(n, emoji);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="mb-4 text-[15px] font-bold text-slate-900">New Group</h3>

        {/* Emoji picker */}
        <SectionLabel>Icon</SectionLabel>
        <div className="mb-4 flex flex-wrap gap-2">
          {GROUP_EMOJIS.map(e => (
            <button
              key={e} type="button"
              onClick={() => setEmoji(e)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-xl text-xl transition",
                emoji === e ? "bg-blue-50 ring-2 ring-blue-400" : "bg-slate-50 hover:bg-slate-100"
              )}
            >
              {e}
            </button>
          ))}
        </div>

        <SectionLabel>Group Name</SectionLabel>
        <input
          autoFocus
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && submit()}
          placeholder="e.g. Goa Trip, Team Lunch…"
          className="mb-5 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-[14px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white transition"
        />

        <div className="flex gap-2.5">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-[14px] font-semibold text-slate-600 transition hover:bg-slate-50">
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={!name.trim()}
            className="flex-1 rounded-xl bg-blue-600 py-2.5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-40">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

// ── GroupCard ─────────────────────────────────────────────────────────────────

function GroupCard({
  group, active, onClick,
}: { group: Group; active: boolean; onClick: () => void }) {
  const { deleteGroup } = useGroupStore();
  const totalSpend      = group.expenses.reduce((s, e) => s + e.amount, 0);
  const isDemo          = DEMO_IDS.has(group.id);

  // Quick net: how many settlements are needed
  const balances = computeGroupBalances(group);
  const debtors  = balances.filter(b => b.netBalance < -0.01).length;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-150",
        active
          ? "border-blue-200 bg-blue-50 shadow-sm"
          : "border-slate-100 bg-white hover:border-slate-200 hover:shadow-sm"
      )}
    >
      {/* Emoji avatar */}
      <div className={cn(
        "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[22px]",
        active ? "bg-white shadow-sm" : "bg-slate-100"
      )}>
        {group.emoji ?? "💰"}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={cn("truncate text-[14px] font-semibold", active ? "text-blue-700" : "text-slate-800")}>
            {group.name}
          </p>
          {isDemo && (
            <span className="flex-shrink-0 rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-600">
              Demo
            </span>
          )}
        </div>
        <p className="text-[12px] text-slate-400">
          {group.members.length} members · {group.expenses.length} expenses
          {totalSpend > 0 && <> · {inr(totalSpend, 0)}</>}
          {debtors > 0 && (
            <span className="ml-1 font-semibold text-red-400">{debtors} owe</span>
          )}
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={e => { e.stopPropagation(); deleteGroup(group.id); }}
          className="rounded-lg p-1.5 text-slate-300 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-400"
          aria-label="Delete group"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
        <ChevronRight className={cn("h-4 w-4 shrink-0 transition", active ? "text-blue-400" : "text-slate-300")} />
      </div>
    </button>
  );
}

// ── GroupList ─────────────────────────────────────────────────────────────────

export function GroupList() {
  const { groups, activeGroupId, setActiveGroup, resetToDemo } = useGroupStore();
  const [showCreate, setShowCreate] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  function handleReset() {
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 3000);
      return;
    }
    resetToDemo();
    setConfirmReset(false);
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SectionLabel>Groups</SectionLabel>
        <div className="flex items-center gap-1.5">
          {/* Reset to demo — useful for portfolio viewers */}
          <button
            type="button"
            onClick={handleReset}
            title="Restore demo data"
            className={cn(
              "flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold transition",
              confirmReset
                ? "border-amber-300 bg-amber-50 text-amber-700"
                : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-600"
            )}
          >
            <RefreshCw className="h-3 w-3" />
            {confirmReset ? "Confirm?" : "Demo"}
          </button>
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-blue-700"
          >
            <Plus className="h-3 w-3" /> New
          </button>
        </div>
      </div>

      {/* Group cards */}
      {groups.length === 0 ? (
        <EmptyBlock
          icon={<Users className="h-6 w-6" />}
          title="No groups yet"
          description="Create a group to start splitting expenses"
          action={
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" /> Create Group
            </button>
          }
        />
      ) : (
        <div className="space-y-2">
          {groups.map(g => (
            <GroupCard
              key={g.id}
              group={g}
              active={g.id === activeGroupId}
              onClick={() => setActiveGroup(g.id)}
            />
          ))}
        </div>
      )}

      {/* Demo hint when all are demo groups */}
      {groups.length > 0 && groups.every(g => DEMO_IDS.has(g.id)) && (
        <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-[11px] text-amber-700">
          <Sparkles className="h-3 w-3 flex-shrink-0 text-amber-500" />
          These are demo groups — add your own or clear them!
        </div>
      )}

      {showCreate && <CreateGroupSheet onClose={() => setShowCreate(false)} />}
    </div>
  );
}
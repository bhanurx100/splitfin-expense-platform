"use client";

/**
 * features/splitpay/sections/split-settlement-section.tsx
 *
 * Renders the settlement plan tab content: member balances + minimum
 * transaction plan + UPI deep-link buttons.
 *
 * Extracted from the inline SettleTab component in split/page.tsx.
 * Business logic (computeGroupSettlement) stays in calculations.ts — untouched.
 */

import { useState, useCallback, useMemo } from "react";
import { Check, Copy, ArrowRight, ExternalLink } from "lucide-react";

import {
  computeGroupSettlement,
  buildSettlementText,
  resolveUpi,
  buildUpiLink,
} from "@/features/splitpay/lib/calculations";
import { Avatar, Card, EmptyBlock, SectionLabel, inr } from "@/components/splitpay/ui";
import { cn } from "@/lib/utils";
import type { Group } from "@/types/splitpay";

type Props = {
  group:      Group;
  settlement: ReturnType<typeof computeGroupSettlement>;
};

export function SplitSettlementSection({ group, settlement }: Props) {
  const [copied, setCopied] = useState(false);

  const memberMap = useMemo(
    () => Object.fromEntries(group.members.map((m) => [m.id, m])),
    [group.members]
  );

  const copy = useCallback(async () => {
    await navigator.clipboard.writeText(
      buildSettlementText(group, settlement.settlements)
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [group, settlement]);

  if (settlement.settlements.length === 0) {
    return (
      <EmptyBlock
        icon={<Check className="h-6 w-6" />}
        title="All settled up!"
        description="No outstanding balances in this group"
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* ── Balances card ──────────────────────────────────────────────────── */}
      <Card className="p-4 lg:p-5 dark:border-slate-700 dark:bg-slate-800/60">
        <div className="mb-4 flex items-center justify-between">
          <SectionLabel>Balances</SectionLabel>
          <button
            type="button"
            onClick={copy}
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 transition hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
          >
            {copied
              ? <Check className="h-3 w-3 text-emerald-600" />
              : <Copy className="h-3 w-3" />}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        <div className="space-y-2">
          {settlement.balances.map((b) => {
            const member = memberMap[b.memberId];
            if (!member) return null;
            return (
              <div key={b.memberId} className="flex items-center gap-3">
                <Avatar name={member.name} color={member.color} size={32} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-semibold text-slate-800 dark:text-slate-100">
                    {member.name}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Paid {inr(b.totalPaid, 0)} · Owes {inr(b.totalOwed, 0)}
                  </p>
                </div>
                <p
                  className={cn(
                    "shrink-0 text-[14px] font-bold",
                    b.netBalance > 0
                      ? "text-emerald-600 dark:text-emerald-400"
                      : b.netBalance < 0
                      ? "text-red-500 dark:text-red-400"
                      : "text-slate-400"
                  )}
                >
                  {b.netBalance > 0 ? "+" : ""}
                  {inr(b.netBalance, 0)}
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      {/* ── Settlement plan card ────────────────────────────────────────────── */}
      <Card className="p-4 lg:p-5 dark:border-slate-700 dark:bg-slate-800/60">
        <SectionLabel>Settlement Plan</SectionLabel>
        <div className="space-y-4">
          {settlement.settlements.map((s, i) => {
            const from = memberMap[s.fromId];
            const to   = memberMap[s.toId];
            if (!from || !to) return null;

            return (
              <div key={i} className="space-y-2">
                {/* Who pays whom */}
                <div className="flex flex-wrap items-center gap-2 text-[13px]">
                  <Avatar name={from.name} color={from.color} size={26} />
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {from.name}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <Avatar name={to.name} color={to.color} size={26} />
                  <span className="text-slate-600 dark:text-slate-300">{to.name}</span>
                  <span className="ml-auto font-bold text-red-500 dark:text-red-400">
                    {inr(s.amount, 0)}
                  </span>
                </div>

                {/* UPI button */}
                <a
                  href={buildUpiLink(from, s.amount)}
                  className="flex items-center justify-between rounded-xl bg-blue-600 px-4 py-2.5 text-white transition hover:bg-blue-700 active:scale-[0.98]"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Avatar
                      name={from.name}
                      color="rgba(255,255,255,0.25)"
                      size={24}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-semibold">
                        {from.name} pays {to.name}
                      </p>
                      <p className="truncate text-[10px] text-blue-200">
                        {resolveUpi(from)}
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span className="text-[13px] font-bold">{inr(s.amount, 0)}</span>
                    <ExternalLink className="h-3.5 w-3.5 text-blue-200" />
                  </div>
                </a>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-center text-[11px] text-slate-400 dark:text-slate-500">
          UPI links work with Google Pay, PhonePe, Paytm &amp; BHIM
        </p>
      </Card>
    </div>
  );
}
"use client";

import { cn } from "@/src/lib/utils";
import { Check } from "lucide-react";
import type { Member } from "@/src/features/splitpay/types";

// ── INR helper — re-exported for callers that import from this module ──────────
export { inr } from "@/src/shared/lib/currency";

// ── Avatar ────────────────────────────────────────────────────────────────────

function initials(name: string) {
  return name.trim().split(/\s+/).map((w) => w[0] ?? "").slice(0, 2).join("").toUpperCase() || "?";
}

export function Avatar({
  name, color, size = 32, className,
}: { name: string; color: string; size?: number; className?: string }) {
  const fs = Math.round(size * 0.36);
  return (
    <div
      className={cn("flex shrink-0 items-center justify-center rounded-full font-bold select-none", className)}
      style={{ width: size, height: size, background: color, fontSize: fs, color: "#fff", letterSpacing: "0.02em" }}
      aria-hidden
    />
  );
}

// ── ParticipantChip ───────────────────────────────────────────────────────────

export function ParticipantChip({
  member, selected, onClick,
}: { member: Member; selected: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-all duration-150 active:scale-[0.97]",
        selected
          ? "border-blue-200 bg-blue-50 text-blue-700"
          : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-700",
      )}
    >
      <Avatar name={member.name} color={selected ? member.color : "#cbd5e1"} size={22} />
      {member.name}
      {selected && <Check className="h-3 w-3 text-blue-500 shrink-0" />}
    </button>
  );
}

// ── SectionLabel ──────────────────────────────────────────────────────────────

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
      {children}
    </p>
  );
}

// ── Card shell ────────────────────────────────────────────────────────────────

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-slate-100 bg-white shadow-sm", className)}>
      {children}
    </div>
  );
}

// ── EmptyBlock ────────────────────────────────────────────────────────────────

export function EmptyBlock({
  icon, title, description, action,
}: { icon: React.ReactNode; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-300">
        {icon}
      </div>
      <p className="mb-1 text-[15px] font-semibold text-slate-600">{title}</p>
      {description && <p className="mb-5 max-w-[220px] text-[13px] text-slate-400">{description}</p>}
      {action}
    </div>
  );
}
"use client";

import { useState, useCallback, useRef } from "react";
import { Phone, AtSign, Palette, X } from "lucide-react";
import { useGroupStore } from "@/hooks/splitpay/useGroupStore";
import type { Member } from "@/types/splitpay";
import { Avatar } from "./ui";
import { cn } from "@/lib/utils";

// ── Validation ────────────────────────────────────────────────────────────────

function isValidPhone(v: string) {
  return /^[6-9]\d{9}$/.test(v.trim());
}

// ── Color palette (same as store's AVATAR_COLORS) ─────────────────────────────

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

// ── Props ─────────────────────────────────────────────────────────────────────

type Props = {
  groupId: string;
  member: Member;
  onClose: () => void;
};

// ═══════════════════════════════════════════════════════════════════════════════
// EDIT MEMBER SHEET
// ═══════════════════════════════════════════════════════════════════════════════

export function EditMemberSheet({ groupId, member, onClose }: Props) {
  const { updateMember } = useGroupStore();

  // Pre-fill with existing values
  const [name, setName] = useState(member.name);
  const [phone, setPhone] = useState(member.phone);
  const [upiId, setUpiId] = useState(member.upiId ?? "");
  const [color, setColor] = useState(member.color);
  const [showUpi, setShowUpi] = useState(!!member.upiId);

  const nameRef = useRef<HTMLInputElement>(null);

  const phoneError = phone.length > 0 && !isValidPhone(phone);
  const hasChanges =
    name.trim() !== member.name ||
    phone.trim() !== member.phone ||
    upiId.trim() !== (member.upiId ?? "") ||
    color !== member.color;

  const canSave = name.trim().length > 0 && isValidPhone(phone) && hasChanges;

  const handleSave = useCallback(() => {
    if (!canSave) return;
    updateMember(groupId, member.id, {
      name: name.trim(),
      phone: phone.trim(),
      upiId: upiId.trim() || undefined,
      color,
    });
    onClose();
  }, [
    canSave,
    updateMember,
    groupId,
    member.id,
    name,
    phone,
    upiId,
    color,
    onClose,
  ]);

  // Close on backdrop click
  const handleBackdrop = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center"
      onClick={handleBackdrop}
    >
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-900/5">
        {/* ── Header ── */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <Avatar name={name || member.name} color={color} size={36} />
            <div>
              <h3 className="text-[15px] font-bold text-slate-900">
                Edit Member
              </h3>
              <p className="text-[12px] text-slate-400">
                Changes reflect in all expenses
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="space-y-4 p-5">
          {/* Name */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Name
            </label>
            <input
              ref={nameRef}
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              placeholder="Full name"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Phone{" "}
              <span className="font-normal normal-case text-slate-400">
                (10 digits)
              </span>
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                }
                placeholder="9876543210"
                className={cn(
                  "h-10 w-full rounded-xl border bg-slate-50 pl-9 pr-3.5 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white",
                  phoneError
                    ? "border-red-300 focus:border-red-400"
                    : "border-slate-200 focus:border-blue-400"
                )}
              />
            </div>
            {phoneError && (
              <p className="mt-1 text-[11px] text-red-500">
                Enter a valid 10-digit Indian number
              </p>
            )}
            <p className="mt-1 text-[11px] text-slate-400">
              Default UPI:{" "}
              <span className="font-mono text-slate-600">
                {phone || member.phone}@upi
              </span>
            </p>
          </div>

          {/* UPI ID (optional) */}
          <div>
            <button
              type="button"
              onClick={() => setShowUpi((s) => !s)}
              className="flex items-center gap-1.5 text-[12px] font-medium text-blue-600 transition hover:text-blue-700"
            >
              <AtSign className="h-3.5 w-3.5" />
              {showUpi ? "Hide custom UPI ID" : "Set custom UPI ID (optional)"}
            </button>
            {showUpi && (
              <div className="mt-2">
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  placeholder="e.g. bhanu@okicici"
                  className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
                />
              </div>
            )}
          </div>

          {/* Avatar color */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              <Palette className="h-3 w-3" /> Avatar Color
            </label>
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full transition-all",
                    color === c
                      ? "scale-110 ring-2 ring-slate-900 ring-offset-2"
                      : "hover:scale-105"
                  )}
                  style={{ background: c }}
                  aria-label={`Color ${c}`}
                >
                  {color === c && (
                    <svg
                      className="h-3.5 w-3.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="flex gap-2.5 border-t border-slate-100 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-[14px] font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="flex-1 rounded-xl bg-blue-600 py-2.5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

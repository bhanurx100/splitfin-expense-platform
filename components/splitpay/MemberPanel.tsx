// components/splitpay/MemberPanel.tsx
"use client";

import { useState, useRef, useCallback } from "react";
import { UserPlus, Trash2, Phone, AtSign } from "lucide-react";
import { useGroupStore } from "@/hooks/splitpay/useGroupStore";
import type { Group } from "@/types/splitpay";
import { Avatar, SectionLabel } from "./ui";
import { cn } from "@/lib/utils";

// ── Validation ───────────────────────────────────────────────────────────────

function isValidPhone(v: string) { return /^[6-9]\d{9}$/.test(v); }

// ── AddMemberSheet ────────────────────────────────────────────────────────────

export function AddMemberSheet({
  groupId, onClose,
}: { groupId: string; onClose: () => void }) {
  const { addMember } = useGroupStore();
  const [name, setName]       = useState("");
  const [phone, setPhone]     = useState("");
  const [upiId, setUpiId]     = useState("");
  const [showUpi, setShowUpi] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const phoneError = phone.length > 0 && !isValidPhone(phone);

  const submit = useCallback(() => {
    if (!name.trim() || !isValidPhone(phone)) return;
    addMember(groupId, { name: name.trim(), phone, upiId: upiId.trim() || undefined });
    onClose();
  }, [name, phone, upiId, groupId, addMember, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <h2 className="mb-5 text-[17px] font-bold text-slate-900">Add Member</h2>

        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">Name</label>
            <input
              ref={nameRef} autoFocus type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submit()}
              placeholder="Bhanu, Akhil, Ravi…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-[14px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white transition"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Phone <span className="normal-case font-normal text-slate-400">(10 digits)</span>
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                type="tel" maxLength={10}
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="9876543210"
                className={cn(
                  "h-10 w-full rounded-xl border bg-slate-50 pl-9 pr-3.5 text-[14px] text-slate-900 outline-none placeholder:text-slate-400 focus:bg-white transition",
                  phoneError ? "border-red-300 focus:border-red-400" : "border-slate-200 focus:border-blue-400"
                )}
              />
            </div>
            {phoneError && <p className="mt-1 text-[11px] text-red-500">Enter a valid 10-digit Indian number</p>}
          </div>

          {/* Optional UPI toggle */}
          <button
            type="button"
            onClick={() => setShowUpi(s => !s)}
            className="flex items-center gap-1.5 text-[12px] font-medium text-blue-600 hover:text-blue-700"
          >
            <AtSign className="h-3.5 w-3.5" />
            {showUpi ? "Hide custom UPI ID" : "Add custom UPI ID (optional)"}
          </button>

          {showUpi && (
            <input
              type="text"
              value={upiId}
              onChange={e => setUpiId(e.target.value)}
              placeholder="e.g. bhanu@okicici"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-[14px] text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-400 focus:bg-white transition"
            />
          )}
        </div>

        <div className="mt-5 flex gap-2.5">
          <button type="button" onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-[14px] font-semibold text-slate-600 transition hover:bg-slate-50">
            Cancel
          </button>
          <button type="button" onClick={submit} disabled={!name.trim() || !isValidPhone(phone)}
            className="flex-1 rounded-xl bg-blue-600 py-2.5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-40">
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MemberList ────────────────────────────────────────────────────────────────

export function MemberList({ group }: { group: Group }) {
  const { removeMember } = useGroupStore();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <SectionLabel>Members</SectionLabel>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 transition hover:bg-slate-200"
        >
          <UserPlus className="h-3 w-3" /> Add
        </button>
      </div>

      {group.members.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
          <p className="text-[13px] text-slate-400">No members yet — add people to split with</p>
        </div>
      ) : (
        <div className="space-y-2">
          {group.members.map(m => (
            <div
              key={m.id}
              className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 transition hover:border-slate-200"
            >
              <Avatar name={m.name} color={m.color} size={34} />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-slate-800">{m.name}</p>
                <p className="text-[11px] text-slate-400">{m.upiId ?? `${m.phone}@upi`}</p>
              </div>
              <button
                type="button"
                onClick={() => removeMember(group.id, m.id)}
                className="rounded-lg p-1.5 text-slate-300 opacity-0 transition group-hover:opacity-100 hover:bg-red-50 hover:text-red-400"
                aria-label={`Remove ${m.name}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd && <AddMemberSheet groupId={group.id} onClose={() => setShowAdd(false)} />}
    </div>
  );
}
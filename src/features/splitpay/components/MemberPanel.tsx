"use client";

/** *
 * Renders the member list for a group.
 * Supports: Add, Edit, Remove members.
 * Edit opens EditMemberSheet (pre-filled modal).
 * Changes auto-propagate to all expenses via Zustand store.
 */

import { useState, useCallback, useRef } from "react";
import { UserPlus, Trash2, Phone, AtSign, Pencil } from "lucide-react";
import { useGroupStore } from "@/src/features/splitpay/hooks/useGroupStore";
import { EditMemberSheet } from "./EditMemberSheet";
import type { Group, Member } from "@/src/features/splitpay/types";
import { Avatar, SectionLabel } from "./ui";
import { cn } from "@/src/lib/utils";

// ── Validation ────────────────────────────────────────────────────────────────

function isValidPhone(v: string) {
  return /^[6-9]\d{9}$/.test(v.trim());
}

// ── AddMemberSheet ────────────────────────────────────────────────────────────

export function AddMemberSheet({
  groupId,
  onClose,
}: {
  groupId: string;
  onClose: () => void;
}) {
  const { addMember } = useGroupStore();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [upiId, setUpiId] = useState("");
  const [showUpi, setShowUpi] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);

  const phoneError = phone.length > 0 && !isValidPhone(phone);

  const submit = useCallback(() => {
    if (!name.trim() || !isValidPhone(phone)) return;
    addMember(groupId, {
      name: name.trim(),
      phone: phone.trim(),
      upiId: upiId.trim() || undefined,
    });
    onClose();
  }, [name, phone, upiId, groupId, addMember, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-900/5">
        <h3 className="mb-4 text-[15px] font-bold text-slate-900">
          Add Member
        </h3>

        <div className="space-y-3">
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
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Bhanu, Akhil, Ravi…"
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
                onKeyDown={(e) => e.key === "Enter" && submit()}
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
          </div>

          {/* Optional UPI */}
          <button
            type="button"
            onClick={() => setShowUpi((s) => !s)}
            className="flex items-center gap-1.5 text-[12px] font-medium text-blue-600 transition hover:text-blue-700"
          >
            <AtSign className="h-3.5 w-3.5" />
            {showUpi ? "Hide custom UPI ID" : "Add custom UPI ID (optional)"}
          </button>

          {showUpi && (
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. bhanu@okicici"
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-[14px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white"
            />
          )}
        </div>

        <div className="mt-5 flex gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-[14px] font-semibold text-slate-600 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!name.trim() || !isValidPhone(phone)}
            className="flex-1 rounded-xl bg-blue-600 py-2.5 text-[14px] font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MemberRow ─────────────────────────────────────────────────────────────────

function MemberRow({
  group,
  member,
  onEdit,
}: {
  group: Group;
  member: Member;
  onEdit: () => void;
}) {
  const { removeMember } = useGroupStore();

  // Count how many expenses this member is part of
  const expenseCount = group.expenses.filter(
    (e) =>
      e.participants.some((p) => p.memberId === member.id) ||
      e.paidBy === member.id
  ).length;

  return (
    <div className="group flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 transition hover:border-slate-200 hover:shadow-sm">
      {/* Avatar */}
      <Avatar name={member.name} color={member.color} size={36} />

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-semibold text-slate-800">
          {member.name}
        </p>
        <p className="text-[11px] text-slate-400">
          {member.upiId ?? `${member.phone}@upi`}
          {expenseCount > 0 && (
            <span className="ml-1.5 text-slate-300">
              · {expenseCount} expense{expenseCount !== 1 ? "s" : ""}
            </span>
          )}
        </p>
      </div>

      {/* Actions — visible on hover */}
      <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
        {/* Edit */}
        <button
          type="button"
          onClick={onEdit}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-blue-50 hover:text-blue-500"
          aria-label={`Edit ${member.name}`}
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>

        {/* Remove */}
        <button
          type="button"
          onClick={() => removeMember(group.id, member.id)}
          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-400"
          aria-label={`Remove ${member.name}`}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── MemberList ────────────────────────────────────────────────────────────────

export function MemberList({ group }: { group: Group }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SectionLabel>
          Members
          {group.members.length > 0 && (
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold normal-case tracking-normal text-slate-500">
              {group.members.length}
            </span>
          )}
        </SectionLabel>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 transition hover:bg-slate-200"
        >
          <UserPlus className="h-3 w-3" /> Add
        </button>
      </div>

      {/* Member list */}
      {group.members.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
          <p className="text-[13px] text-slate-400">
            No members yet — add people to split with
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {group.members.map((m) => (
            <MemberRow
              key={m.id}
              group={group}
              member={m}
              onEdit={() => setEditingMember(m)}
            />
          ))}
        </div>
      )}

      {/* Add member sheet */}
      {showAdd && (
        <AddMemberSheet groupId={group.id} onClose={() => setShowAdd(false)} />
      )}

      {/* Edit member sheet */}
      {editingMember && (
        <EditMemberSheet
          groupId={group.id}
          member={editingMember}
          onClose={() => setEditingMember(null)}
        />
      )}
    </div>
  );
}

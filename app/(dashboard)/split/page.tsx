"use client";

import { useState } from "react";
import { Plus, Trash2, ExternalLink } from "lucide-react";

type Member = { id: number; name: string; phone: string };

let nextId = 1;

export default function SplitPage() {
  const [members, setMembers]   = useState<Member[]>([]);
  const [name, setName]         = useState("");
  const [phone, setPhone]       = useState("");
  const [total, setTotal]       = useState("");
  const [split, setSplit]       = useState(false);

  const amount      = parseFloat(total) || 0;
  const share       = members.length > 0 ? amount / members.length : 0;
  const shareStr    = share.toFixed(2);

  function addMember() {
    const n = name.trim();
    const p = phone.trim();
    if (!n || !p) return;
    setMembers(prev => [...prev, { id: nextId++, name: n, phone: p }]);
    setName("");
    setPhone("");
  }

  function removeMember(id: number) {
    setMembers(prev => prev.filter(m => m.id !== id));
    setSplit(false);
  }

  function upiLink(member: Member) {
    const upiId  = encodeURIComponent(`${member.phone}@upi`);
    const pn     = encodeURIComponent(member.name);
    const am     = encodeURIComponent(shareStr);
    return `upi://pay?pa=${upiId}&pn=${pn}&am=${am}&cu=INR`;
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Header */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 px-4 py-5">
        <h1 className="text-lg font-bold text-white">Split &amp; Pay</h1>
        <p className="mt-0.5 text-xs text-blue-100">Split a bill equally and request payment via UPI</p>
      </div>

      <div className="px-4 py-6 space-y-4">

        {/* ── Add member ─────────────────────────────────────────────── */}
        <div className="rounded-xl bg-white shadow p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Add Member</h2>

          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <input
            type="tel"
            placeholder="Phone number (used as UPI ID)"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addMember()}
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
          <button
            onClick={addMember}
            disabled={!name.trim() || !phone.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-40"
          >
            <Plus className="h-4 w-4" />
            Add Member
          </button>
        </div>

        {/* ── Members list ───────────────────────────────────────────── */}
        {members.length > 0 && (
          <div className="rounded-xl bg-white shadow p-4 space-y-2">
            <h2 className="text-sm font-semibold text-gray-700">
              Members ({members.length})
            </h2>
            {members.map(m => (
              <div key={m.id}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5">
                {/* Avatar */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    {m.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.phone}@upi</p>
                  </div>
                </div>
                {/* Remove */}
                <button
                  onClick={() => removeMember(m.id)}
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                  aria-label={`Remove ${m.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ── Total amount ───────────────────────────────────────────── */}
        <div className="rounded-xl bg-white shadow p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-700">Total Bill Amount</h2>
          <div className="flex items-center gap-2">
            <span className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm font-semibold text-gray-500">
              ₹
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={total}
              onChange={e => { setTotal(e.target.value); setSplit(false); }}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <button
            onClick={() => setSplit(true)}
            disabled={members.length === 0 || amount <= 0}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-40"
          >
            Split Equally
          </button>
        </div>

        {/* ── Split preview + UPI buttons ───────────────────────────── */}
        {split && members.length > 0 && amount > 0 && (
          <div className="rounded-xl bg-white shadow p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-700">Split Preview</h2>
              <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
                ₹{shareStr} each
              </span>
            </div>

            {members.map(m => (
              <div key={m.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-3">
                {/* Member info */}
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                    {m.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{m.name}</p>
                    <p className="text-xs text-gray-400">owes ₹{shareStr}</p>
                  </div>
                </div>

                {/* UPI pay button */}
                <a
                  href={upiLink(m)}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-600 active:scale-95"
                >
                  Pay
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            ))}

            {/* Summary row */}
            <div className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2.5 mt-1">
              <span className="text-xs text-gray-500">Total</span>
              <span className="text-sm font-bold text-gray-800">
                ₹{amount.toFixed(2)} ÷ {members.length} members
              </span>
            </div>
          </div>
        )}

        {/* ── UPI note ───────────────────────────────────────────────── */}
        <p className="text-center text-[11px] text-gray-400 pb-2">
          UPI links use <span className="font-medium">phone@upi</span> format.
          Works with Google Pay, PhonePe, and Paytm.
        </p>

      </div>
    </div>
  );
}
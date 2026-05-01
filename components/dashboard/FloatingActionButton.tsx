"use client";

// components/dashboard/FloatingActionButton.tsx
// Shown only on mobile (rendered inside AppShell > lg:hidden wrapper).
// Opens existing sheets via real Zustand hooks.

import { useState } from "react";
import { Plus, Receipt, Wallet, Tag } from "lucide-react";
import { useNewTransaction } from "@/features/transactions/hooks/use-new-transaction";
import { useNewAccount } from "@/features/accounts/hooks/use-new-account";
import { useNewCategory } from "@/features/categories/hooks/use-new-category";

export function FloatingActionButton() {
  const [open, setOpen] = useState(false);

  const { onOpen: openTransaction } = useNewTransaction();
  const { onOpen: openAccount }     = useNewAccount();
  const { onOpen: openCategory }    = useNewCategory();

  function dispatch(fn: () => void) {
    fn();
    setOpen(false);
  }

  const ACTIONS = [
    {
      icon: <Receipt className="h-4 w-4" />,
      label: "Add Transaction",
      colorClass: "bg-blue-500",
      onTap: () => dispatch(openTransaction),
    },
    {
      icon: <Wallet className="h-4 w-4" />,
      label: "Add Account",
      colorClass: "bg-emerald-500",
      onTap: () => dispatch(openAccount),
    },
    {
      icon: <Tag className="h-4 w-4" />,
      label: "Add Category",
      colorClass: "bg-amber-500",
      onTap: () => dispatch(openCategory),
    },
  ] as const;

  return (
    <>
      <style>{`
        @keyframes fabSlideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-[1px]"
          onClick={() => setOpen(false)}
        />
      )}

      {open && (
        <div className="fixed bottom-24 left-1/2 z-40 flex -translate-x-1/2 flex-col items-center gap-3">
          {[...ACTIONS].reverse().map((action, i) => (
            <div
              key={action.label}
              className="flex items-center gap-3"
              style={{ animation: `fabSlideUp 0.18s ease ${i * 0.05}s both` }}
            >
              <span className="rounded-xl bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-lg">
                {action.label}
              </span>
              <button
                aria-label={action.label}
                onClick={action.onTap}
                className={`${action.colorClass} flex h-11 w-11 items-center justify-center rounded-full text-white shadow-lg transition hover:opacity-90 active:scale-95`}
              >
                {action.icon}
              </button>
            </div>
          ))}
        </div>
      )}

      <button
        aria-label={open ? "Close actions" : "Quick actions"}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-8 left-1/2 z-40 flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xl shadow-blue-500/40 transition-all hover:bg-blue-700 active:scale-95"
      >
        <Plus
          className="h-6 w-6 transition-transform duration-300"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        />
      </button>
    </>
  );
}
"use client";
/**
 * features/accounts/sections/AccountGrid.tsx
 *
 * Section: the card grid of all user accounts.
 * Extracted from app/(dashboard)/accounts/page.tsx.
 * Consumes data via props — no direct API calls.
 */

import { motion, AnimatePresence } from "framer-motion";
import { AccountCard } from "@/components/dashboard/AccountCard";

type Account = { id: string; name: string };

type Props = {
  accounts: Account[];
};

export function AccountGrid({ accounts }: Props) {
  return (
    <section>
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
        Your Accounts
      </p>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.07 } } }}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <AnimatePresence>
          {accounts.map((acc, i) => (
            <motion.div
              key={acc.id}
              variants={{
                hidden:  { opacity: 0, y: 12 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
              }}
            >
              <AccountCard id={acc.id} name={acc.name} index={i} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
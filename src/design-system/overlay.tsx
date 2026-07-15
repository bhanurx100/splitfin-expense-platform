"use client";

import { motion, AnimatePresence } from "framer-motion";
import { type ReactNode, useEffect } from "react";
import { cn } from "@/src/lib/utils";
import { auroraScaleIn } from "./motion";

export function AuroraOverlay({ open, onDismiss, children, className }: { open: boolean; onDismiss?: () => void; children: ReactNode; className?: string }) {
  useEffect(() => {
    if (!open || !onDismiss) return;
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && onDismiss();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onDismiss]);

  return <AnimatePresence>{open && <motion.div className="fixed inset-0 z-[var(--aurora-z-overlay)] grid place-items-center p-4" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <button className="absolute inset-0 cursor-default bg-[var(--aurora-overlay-backdrop)] backdrop-blur-sm" aria-label="Close overlay" onClick={onDismiss} />
    <motion.div role="dialog" aria-modal="true" className={cn("relative z-10 w-full max-w-lg", className)} variants={auroraScaleIn} initial="hidden" animate="visible" exit="hidden">{children}</motion.div>
  </motion.div>}</AnimatePresence>;
}

export function AuroraSheet({ open, onDismiss, children, className }: { open: boolean; onDismiss?: () => void; children: ReactNode; className?: string }) {
  return <AnimatePresence>{open && <motion.div className="fixed inset-0 z-[var(--aurora-z-overlay)] flex items-end" role="presentation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <button className="absolute inset-0 cursor-default bg-[var(--aurora-overlay-backdrop)] backdrop-blur-sm" aria-label="Close sheet" onClick={onDismiss} />
    <motion.div role="dialog" aria-modal="true" className={cn("relative z-10 max-h-[88dvh] w-full overflow-auto rounded-t-[var(--aurora-radius-panel)] border border-[var(--aurora-glass-border)] bg-[var(--surface-raised)] p-5 aurora-safe-bottom", className)} initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 28, stiffness: 300 }}><div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[var(--text-muted)]/40" />{children}</motion.div>
  </motion.div>}</AnimatePresence>;
}

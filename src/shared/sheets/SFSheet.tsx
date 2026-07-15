"use client";
/**
 * shared/sheets/SFSheet.tsx
 *
 * Bottom-sheet / modal wrapper for SplitFin.
 * Slides up from bottom on mobile, centered modal on desktop.
 * Wraps Radix Dialog for accessibility (focus trap, ESC close).
 *
 * Usage:
 *   <SFSheet open={open} onClose={() => setOpen(false)} title="Add Expense">
 *     …content…
 *   </SFSheet>
 */

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/src/components/ui/dialog";
import { X } from "lucide-react";
import { cn } from "@/src/lib/utils";

type SFSheetProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  /** Render a sticky CTA at the sheet bottom */
  footer?: React.ReactNode;
  className?: string;
};

export function SFSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  className,
}: SFSheetProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className={cn(
          /* Slide-up on mobile, centered on desktop */
          "fixed bottom-0 left-0 right-0 top-auto w-full max-h-[90vh] translate-x-0 translate-y-0",
          "sm:bottom-auto sm:left-1/2 sm:right-auto sm:top-1/2 sm:w-[480px] sm:-translate-x-1/2 sm:-translate-y-1/2",
          "rounded-t-3xl sm:rounded-3xl",
          "border-0 border-t border-[var(--sf-border-subtle)] sm:border",
          "bg-[var(--sf-card)]",
          "p-0 shadow-[var(--sf-shadow-lg)]",
          "flex flex-col overflow-hidden",
          "focus:outline-none",
          className,
        )}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-[var(--sf-border-strong)]" />
        </div>

        {/* Header */}
        {(title || subtitle) && (
          <div className="flex items-start justify-between border-b border-[var(--sf-border-subtle)] px-5 py-4">
            <div>
              {title && (
                <DialogTitle className="text-[17px] font-bold" style={{ color: "var(--sf-text-primary)" }}>
                  {title}
                </DialogTitle>
              )}
              {subtitle && (
                <p className="mt-0.5 text-[13px]" style={{ color: "var(--sf-text-muted)" }}>
                  {subtitle}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl transition hover:bg-[var(--sf-overlay)]"
              style={{ color: "var(--sf-text-muted)" }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>

        {/* Sticky footer */}
        {footer && (
          <div className="border-t border-[var(--sf-border-subtle)] px-5 py-4 pb-safe">
            {footer}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── CTA button inside sheets ───────────────────────────────────────────────────

type SFCTAProps = {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "danger" | "ghost";
  className?: string;
  type?: "button" | "submit";
};

export function SFCTA({ children, onClick, disabled, variant = "primary", className, type = "button" }: SFCTAProps) {
  const styles = {
    primary: "bg-[var(--brand)] text-white shadow-[0_4px_16px_rgba(108,92,231,0.35)] hover:opacity-90",
    danger: "bg-[var(--sf-expense)] text-white hover:opacity-90",
    ghost: "border border-[var(--sf-border-default)] text-[var(--sf-text-secondary)] hover:bg-[var(--sf-overlay)]",
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-2xl py-3.5 text-[15px] font-semibold transition-all duration-150 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed ${styles} ${className ?? ""}`}
    >
      {children}
    </button>
  );
}
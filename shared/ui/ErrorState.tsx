"use client";

/**
 * shared/ui/ErrorState.tsx
 *
 * Reusable error state component.
 * Variants: inline (banner), card (block), page (full-screen).
 */

import { AlertTriangle, RefreshCw, WifiOff, Lock, ServerCrash } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Error type → icon + label map ─────────────────────────────────────────────

type ErrorKind = "generic" | "network" | "auth" | "server" | "notFound";

const KIND_META: Record<
  ErrorKind,
  { Icon: React.ElementType; label: string }
> = {
  generic:  { Icon: AlertTriangle, label: "Something went wrong"       },
  network:  { Icon: WifiOff,       label: "Connection problem"          },
  auth:     { Icon: Lock,          label: "You don't have access"       },
  server:   { Icon: ServerCrash,   label: "Server error"               },
  notFound: { Icon: AlertTriangle, label: "Not found"                  },
};

// ── Inline error banner ────────────────────────────────────────────────────────

export function InlineError({
  message,
  onRetry,
  className,
}: {
  message: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl px-4 py-3 text-[13px]",
        className,
      )}
      style={{
        background: "var(--color-expense-bg)",
        border:     "1px solid var(--color-expense-border)",
        color:      "var(--color-expense)",
      }}
    >
      <AlertTriangle className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1 font-medium">{message}</span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="ml-2 flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition hover:opacity-80"
          style={{
            background: "var(--color-expense-bg-strong)",
            color:      "var(--color-expense)",
          }}
        >
          <RefreshCw className="h-3 w-3" />
          Retry
        </button>
      )}
    </div>
  );
}

// ── Card error ─────────────────────────────────────────────────────────────────

export function ErrorCard({
  kind = "generic",
  message,
  description,
  onRetry,
  className,
}: {
  kind?:        ErrorKind;
  message?:     string;
  description?: string;
  onRetry?:     () => void;
  className?:   string;
}) {
  const { Icon, label } = KIND_META[kind];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl px-6 py-12 text-center",
        className,
      )}
      style={{
        background: "var(--surface-card)",
        border:     "1px solid var(--border-default)",
        boxShadow:  "var(--shadow-card)",
      }}
    >
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{
          background: "var(--color-expense-bg)",
          border:     "1px solid var(--color-expense-border)",
        }}
      >
        <Icon
          className="h-6 w-6"
          style={{ color: "var(--color-expense)" }}
          strokeWidth={1.5}
        />
      </div>

      <p
        className="text-[15px] font-semibold"
        style={{ color: "var(--text-primary)" }}
      >
        {message ?? label}
      </p>

      {description && (
        <p
          className="mt-1.5 max-w-[260px] text-[13px] leading-relaxed"
          style={{ color: "var(--text-muted)" }}
        >
          {description}
        </p>
      )}

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-150 active:scale-95"
          style={{
            background: "var(--surface-sunken)",
            border:     "1px solid var(--border-default)",
            color:      "var(--text-secondary)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-strong)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border-default)";
          }}
        >
          <RefreshCw className="h-4 w-4" />
          Try again
        </button>
      )}
    </div>
  );
}

// ── Full-page error ────────────────────────────────────────────────────────────

export function ErrorState({
  kind = "generic",
  message,
  description,
  onRetry,
  className,
}: {
  kind?:        ErrorKind;
  message?:     string;
  description?: string;
  onRetry?:     () => void;
  className?:   string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[400px] flex-col items-center justify-center px-4",
        className,
      )}
    >
      <ErrorCard
        kind={kind}
        message={message}
        description={description}
        onRetry={onRetry}
        className="w-full max-w-sm"
      />
    </div>
  );
}
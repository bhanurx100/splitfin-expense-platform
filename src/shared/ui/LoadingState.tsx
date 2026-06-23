"use client";

/**
 * shared/ui/LoadingState.tsx
 *
 * Reusable loading state component.
 * Variants: spinner (inline), skeleton (block), pulse (card-shaped).
 */

import { cn } from "@/src/lib/utils";

// ── Spinner ────────────────────────────────────────────────────────────────────

type SpinnerSize = "xs" | "sm" | "md" | "lg";

const SPINNER_SIZE: Record<SpinnerSize, string> = {
  xs: "h-3 w-3 border",
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-8 w-8 border-[3px]",
};

export function Spinner({
  size = "md",
  className,
}: {
  size?: SpinnerSize;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full",
        "border-[var(--border-default)] border-t-[var(--text-brand)]",
        SPINNER_SIZE[size],
        className,
      )}
      role="status"
      aria-label="Loading"
    />
  );
}

// ── Inline loading ─────────────────────────────────────────────────────────────

export function InlineLoading({
  label = "Loading…",
  size = "sm",
  className,
}: {
  label?: string;
  size?: SpinnerSize;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Spinner size={size} />
      <span className="text-[13px]" style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
    </div>
  );
}

// ── Skeleton atom ──────────────────────────────────────────────────────────────

export function Skeleton({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl",
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r",
        "before:from-transparent before:via-[var(--surface-hover)] before:to-transparent",
        "before:bg-[length:200%_100%]",
        "before:animate-[shimmer_1.5s_ease-in-out_infinite]",
        className,
      )}
      style={{
        background: "var(--surface-sunken)",
        ...style,
      }}
    />
  );
}

// ── Skeleton row ───────────────────────────────────────────────────────────────

export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 px-1 py-2", className)}>
      <Skeleton className="h-9 w-9 flex-shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-2.5 w-20" />
      </div>
      <Skeleton className="h-3 w-14" />
    </div>
  );
}

// ── Skeleton card ──────────────────────────────────────────────────────────────

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn("rounded-2xl p-5", className)}
      style={{
        background: "var(--surface-card)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-7 w-7 rounded-xl" />
      </div>
      <Skeleton className="mb-2 h-8 w-36" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

// ── Skeleton grid ──────────────────────────────────────────────────────────────

export function SkeletonGrid({
  cols = 3,
  rows = 1,
  className,
}: {
  cols?: number;
  rows?: number;
  className?: string;
}) {
  return (
    <div
      className={cn("grid gap-4", className)}
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: cols * rows }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// ── Full-page loading ──────────────────────────────────────────────────────────

export function LoadingState({
  label = "Loading…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-24",
        className,
      )}
    >
      <div
        className="flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ background: "var(--surface-sunken)" }}
      >
        <Spinner size="md" />
      </div>
      <p
        className="text-[13px] font-medium"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </p>
    </div>
  );
}
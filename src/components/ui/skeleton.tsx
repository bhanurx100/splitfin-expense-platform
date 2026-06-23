import { cn } from "@/src/lib/utils";

/**
 * SpendWise Design System — Skeleton v3
 * Smooth shimmer that adapts to both light and dark surface layers.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        "rounded-xl",
        /* Base fill: sunken surface so it reads as placeholder */
        "bg-[var(--surface-sunken)]",
        /* Shimmer overlay via pseudo via CSS */
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r",
        "before:from-transparent before:via-[var(--surface-hover)] before:to-transparent",
        "before:bg-[length:200%_100%]",
        "before:animate-[shimmer_1.5s_ease-in-out_infinite]",
        className
      )}
      {...props}
    />
  );
}

/* ── Skeleton card ─────────────────────────────────────────────────────── */
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[1.125rem]",
        "border border-[var(--border-subtle)]",
        "bg-[var(--surface-2)]",
        "p-5",
        "shadow-[var(--shadow-xs)]",
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-7 w-7 rounded-xl" />
      </div>
      <Skeleton className="mb-2.5 h-8 w-36" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

/* ── Skeleton row ─────────────────────────────────────────────────────── */
function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3.5 px-4 py-3.5", className)}>
      <Skeleton className="h-10 w-10 flex-shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-3.5 w-16" />
    </div>
  );
}

/* ── Skeleton table ───────────────────────────────────────────────────── */
function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div>
      {/* Header */}
      <div className="mb-1 flex items-center gap-4 rounded-xl bg-[var(--surface-sunken)] px-4 py-3">
        <Skeleton className="h-3 w-4 rounded" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="ml-auto h-3 w-16" />
      </div>
      {/* Rows */}
      <div className="divide-y divide-[var(--border-subtle)]">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </div>
  );
}

/* ── Full page skeleton ───────────────────────────────────────────────── */
function SkeletonPage() {
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
      <div className="rounded-[1.125rem] border border-[var(--border-subtle)] bg-[var(--surface-2)] p-5 shadow-[var(--shadow-xs)]">
        <SkeletonTable rows={6} />
      </div>
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonRow, SkeletonTable, SkeletonPage };
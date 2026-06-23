/**
 * shared/skeletons/index.tsx
 *
 * Reusable skeleton shapes used across all features.
 * Moved from components/dashboard/Skeletons.tsx (keep that file for now,
 * import from here in new code).
 */

export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-2xl bg-[var(--surface-card)] p-5 shadow-sm ${className ?? ""}`}>
      <div className="mb-4 flex justify-between">
        <div className="h-5 w-24 rounded bg-[var(--surface-sunken)]" />
        <div className="h-8 w-20 rounded-xl bg-[var(--surface-sunken)]" />
      </div>
      <div className="h-48 rounded-xl bg-[var(--surface-sunken)]" />
    </div>
  );
}

export function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={`flex animate-pulse items-center gap-3 ${className ?? ""}`}>
      <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-[var(--surface-sunken)]" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-28 rounded bg-[var(--surface-sunken)]" />
        <div className="h-3 w-20 rounded bg-[var(--surface-sunken)]" />
      </div>
      <div className="h-4 w-16 rounded bg-[var(--surface-sunken)]" />
    </div>
  );
}

export function SkeletonGrid({ cols = 3, rows = 3 }: { cols?: number; rows?: number }) {
  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: cols * rows }).map((_, i) => (
        <div
          key={i}
          className="h-28 animate-pulse rounded-2xl bg-[var(--surface-sunken)]"
          style={{ animationDelay: `${i * 50}ms` }}
        />
      ))}
    </div>
  );
}

export function SkeletonPageHeader() {
  return (
    <div className="mb-6 flex items-center justify-between lg:mb-8">
      <div className="space-y-2">
        <div className="h-6 w-32 animate-pulse rounded-lg bg-[var(--surface-sunken)]" />
        <div className="h-4 w-48 animate-pulse rounded-lg bg-[var(--surface-sunken)]" />
      </div>
      <div className="h-9 w-32 animate-pulse rounded-xl bg-[var(--surface-sunken)]" />
    </div>
  );
}
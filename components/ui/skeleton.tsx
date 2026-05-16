import { cn } from "@/lib/utils";

/**
 * SpendWise Design System — Skeleton
 * Dark-mode aware shimmer loading placeholder.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-[var(--surface-overlay)]",
        "before:absolute before:inset-0",
        "before:bg-gradient-to-r before:from-[var(--surface-overlay)] before:via-[var(--surface-hover)] before:to-[var(--surface-overlay)]",
        "before:bg-[length:200%_100%]",
        "before:animate-[shimmer_1.4s_ease-in-out_infinite]",
        className
      )}
      {...props}
    />
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn(
      "rounded-[18px] border border-[var(--border-default)] bg-[var(--surface-card)] p-5 shadow-[var(--shadow-card)]",
      className
    )}>
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-7 w-7 rounded-xl" />
      </div>
      <Skeleton className="mb-2 h-8 w-36" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}

function SkeletonRow({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3 px-3 py-3", className)}>
      <Skeleton className="h-10 w-10 flex-shrink-0 rounded-xl" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-3.5 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
      <Skeleton className="h-3.5 w-16" />
    </div>
  );
}

function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div>
      <div className="mb-2 flex gap-4 rounded-xl bg-[var(--surface-overlay)] px-4 py-3">
        <Skeleton className="h-3 w-4" />
        <Skeleton className="h-3 w-20" />
        <Skeleton className="ml-auto h-3 w-16" />
      </div>
      <div className="space-y-0.5">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    </div>
  );
}

function SkeletonPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 xl:px-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>
      <div className="mb-6 grid grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
      </div>
      <div className="rounded-[18px] border border-[var(--border-default)] bg-[var(--surface-card)] p-6 shadow-[var(--shadow-card)]">
        <SkeletonTable rows={6} />
      </div>
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonRow, SkeletonTable, SkeletonPage };
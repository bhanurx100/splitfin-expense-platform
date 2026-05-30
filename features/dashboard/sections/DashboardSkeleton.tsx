"use client";

export function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 pb-20 pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-7 space-y-4">
      {/* Hero */}
      <div
        className="h-48 animate-pulse rounded-3xl"
        style={{ background: "var(--surface-sunken)" }}
      />

      {/* Quick actions */}
      <div className="grid grid-cols-4 gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-16 animate-pulse rounded-2xl"
            style={{ background: "var(--surface-sunken)", animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-2xl"
            style={{ background: "var(--surface-sunken)", animationDelay: `${i * 60}ms` }}
          />
        ))}
      </div>

      {/* Chart */}
      <div
        className="h-64 animate-pulse rounded-2xl"
        style={{
          background: "var(--surface-card)",
          border:     "1px solid var(--border-subtle)",
        }}
      />
    </div>
  );
}
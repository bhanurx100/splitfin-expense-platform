"use client";
/**
 * features/transactions/sections/TransactionsSkeleton.tsx
 *
 * Loading skeleton for the transactions page.
 * Extracted from app/(dashboard)/transactions/page.tsx.
 */

export function TransactionsSkeleton() {
  return (
    <div className="mx-auto w-full max-w-screen-xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div
        className="mb-6 flex items-start justify-between pb-5"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div className="space-y-2">
          <div
            className="h-5 w-24 animate-pulse rounded-xl"
            style={{ background: "var(--surface-sunken)" }}
          />
          <div
            className="h-4 w-48 animate-pulse rounded-xl"
            style={{ background: "var(--surface-sunken)" }}
          />
        </div>
        <div className="flex gap-2">
          <div
            className="h-9 w-28 animate-pulse rounded-xl"
            style={{ background: "var(--surface-sunken)" }}
          />
          <div
            className="h-9 w-36 animate-pulse rounded-xl"
            style={{ background: "var(--surface-sunken)" }}
          />
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2.5">
        <div
          className="h-9 w-52 animate-pulse rounded-xl"
          style={{ background: "var(--surface-sunken)" }}
        />
        <div
          className="ml-auto h-9 w-56 animate-pulse rounded-xl"
          style={{ background: "var(--surface-sunken)" }}
        />
      </div>

      <div
        className="overflow-hidden rounded-2xl"
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--border-default)",
          boxShadow: "var(--shadow-md)",
        }}
      >
        <div
          className="flex items-center gap-4 px-4 py-3"
          style={{
            background: "var(--surface-sunken)",
            borderBottom: "1px solid var(--border-subtle)",
          }}
        >
          <div
            className="h-4 w-4 animate-pulse rounded"
            style={{ background: "var(--border-default)" }}
          />
          {[16, 28, 20, 20, 16].map((w, i) => (
            <div
              key={i}
              className="h-3 animate-pulse rounded"
              style={{ width: `${w}%`, background: "var(--border-default)" }}
            />
          ))}
        </div>

        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 px-4 py-3.5"
            style={{ borderBottom: "1px solid var(--border-subtle)" }}
          >
            <div
              className="h-4 w-4 animate-pulse rounded"
              style={{ background: "var(--surface-sunken)" }}
            />
            <div
              className="h-3.5 w-20 animate-pulse rounded"
              style={{ background: "var(--surface-sunken)" }}
            />
            <div className="flex items-center gap-2">
              <div
                className="h-7 w-7 animate-pulse rounded-lg"
                style={{ background: "var(--surface-sunken)" }}
              />
              <div
                className="h-3.5 w-28 animate-pulse rounded"
                style={{ background: "var(--surface-sunken)" }}
              />
            </div>
            <div
              className="h-5 w-20 animate-pulse rounded-full"
              style={{ background: "var(--surface-sunken)" }}
            />
            <div
              className="h-3.5 w-24 animate-pulse rounded"
              style={{ background: "var(--surface-sunken)" }}
            />
            <div
              className="ml-auto h-3.5 w-16 animate-pulse rounded"
              style={{ background: "var(--surface-sunken)" }}
            />
          </div>
        ))}

        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderTop: "1px solid var(--border-subtle)" }}
        >
          <div
            className="h-3.5 w-24 animate-pulse rounded"
            style={{ background: "var(--surface-sunken)" }}
          />
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-7 w-7 animate-pulse rounded-lg"
                style={{ background: "var(--surface-sunken)" }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
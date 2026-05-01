// components/dashboard/Skeletons.tsx
// Moved from components/mobile/Skeletons.tsx — no changes.

export function BalanceCardSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl bg-blue-200 p-5 shadow-xl">
      <div className="mb-4 flex justify-between">
        <div className="h-4 w-28 rounded bg-blue-300" />
        <div className="h-4 w-20 rounded bg-blue-300" />
      </div>
      <div className="mb-4 h-9 w-40 rounded bg-blue-300" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-16 rounded-2xl bg-blue-300" />
        <div className="h-16 rounded-2xl bg-blue-300" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex justify-between">
        <div className="h-5 w-24 rounded bg-gray-200" />
        <div className="h-8 w-32 rounded-xl bg-gray-100" />
      </div>
      <div className="h-48 rounded-2xl bg-gray-100" />
    </div>
  );
}

export function TransactionSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex justify-between">
        <div className="h-5 w-36 rounded bg-gray-200" />
        <div className="h-5 w-16 rounded bg-gray-100" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 rounded-2xl p-3">
            <div className="h-11 w-11 rounded-2xl bg-gray-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-28 rounded bg-gray-200" />
              <div className="h-3 w-20 rounded bg-gray-100" />
            </div>
            <div className="h-4 w-16 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CategorySkeleton() {
  return (
    <div className="animate-pulse rounded-3xl bg-white p-5 shadow-sm">
      <div className="mb-4 flex justify-between">
        <div className="h-5 w-24 rounded bg-gray-200" />
        <div className="h-8 w-28 rounded-xl bg-gray-100" />
      </div>
      <div className="h-52 rounded-2xl bg-gray-100" />
    </div>
  );
}

export function AccountCardSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl bg-white p-5 shadow-sm">
      <div className="mb-3 h-5 w-32 rounded bg-gray-200" />
      <div className="mb-2 h-8 w-40 rounded bg-gray-100" />
      <div className="h-4 w-24 rounded bg-gray-100" />
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-4">
      <BalanceCardSkeleton />
      <ChartSkeleton />
      <TransactionSkeleton />
    </div>
  );
}
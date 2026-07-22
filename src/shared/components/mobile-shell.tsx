import { BottomNav } from '@/src/shared/navigation/BottomNav'
import type { ReactNode } from 'react'

export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh max-w-[480px]">
      <main className="pb-nav flex flex-col gap-6 px-4">{children}</main>
      <BottomNav />
    </div>
  )
}

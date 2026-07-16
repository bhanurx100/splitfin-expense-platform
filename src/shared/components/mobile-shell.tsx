import { BottomNav } from '@/src/shared/navigation/BottomNav'
import type { ReactNode } from 'react'

export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <main className="pb-nav flex flex-col gap-8 px-6">{children}</main>
      <BottomNav />
    </div>
  )
}

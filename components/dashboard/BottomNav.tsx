"use client";

// components/dashboard/BottomNav.tsx
// Shown only on mobile (hidden lg+).
// Routes → existing app routes, not /mobile/* stubs.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ArrowLeftRight, LayoutGrid, Wallet } from "lucide-react";

const NAV_ITEMS = [
  { href: "/",             label: "Home",         icon: Home,           exact: true  },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight, exact: false },
  { href: "/categories",   label: "Categories",   icon: LayoutGrid,     exact: false },
  { href: "/accounts",     label: "Accounts",     icon: Wallet,         exact: false },
] as const;

export function BottomNav() {
  const pathname = usePathname();

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex items-center justify-around border-t border-gray-100 bg-white/95 px-2 pb-safe pt-2 backdrop-blur-md">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href, item.exact);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-0.5 rounded-2xl px-4 py-2 transition ${
              active ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <div className={`rounded-xl p-1.5 transition ${active ? "bg-blue-50" : ""}`}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
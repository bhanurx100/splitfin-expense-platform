"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { formatCurrency } from "@/src/lib/transaction-selectors";

interface HeroCardProps {
  totalBalance: number;
  accountCount: number;
  monthlyChange: number;
  isDark: boolean;
}

export function HeroCard({ totalBalance, accountCount, monthlyChange, isDark }: HeroCardProps) {
  const [hidden, setHidden] = useState(false);

  return (
    <div
      className="relative mb-8 h-[225px] overflow-hidden rounded-[28px] p-6 md:h-[250px] lg:h-[275px] lg:p-8"
      style={{
        backgroundImage: isDark
          ? "url('/images/home/home-theme-dark.png')"
          : "url('/images/home/home-theme-light.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay for better text readability */}
      <div
        className="absolute inset-0"
        style={{
          background: isDark
            ? "linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)"
            : "linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)",
        }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between">
        {/* Top Left: Total Balance and Account Count */}
        <div className="mb-2">
          <p
            className="text-sm font-medium"
            style={{ color: isDark ? "#ffffff" : "#ffffff", opacity: 0.85 }}
          >
            Total Balance
          </p>
          <p
            className="text-xs"
            style={{ color: isDark ? "#ffffff" : "#ffffff", opacity: 0.7 }}
          >
            Across {accountCount} {accountCount === 1 ? "Account" : "Accounts"}
          </p>
        </div>

        {/* Large Balance - 44px desktop, 36px mobile */}
        <p
          className={cn(
            "font-bold tracking-tight",
            "text-[36px] lg:text-[44px]",
            hidden && "blur-xl select-none"
          )}
          style={{ color: isDark ? "#ffffff" : "#ffffff" }}
        >
          {formatCurrency(totalBalance)}
        </p>

        {/* Bottom Left: Monthly Change Pill */}
        <div className="mt-4 flex items-center gap-2">
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold",
              monthlyChange >= 0
                ? "bg-white/20 text-white backdrop-blur-sm"
                : "bg-white/20 text-white backdrop-blur-sm"
            )}
          >
            {monthlyChange >= 0 ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            {monthlyChange >= 0 ? "+" : ""}
            {monthlyChange.toFixed(1)}%
          </div>
          <span
            className="text-xs"
            style={{ color: isDark ? "#ffffff" : "#ffffff", opacity: 0.7 }}
          >
            Monthly Change
          </span>
        </div>
      </div>
    </div>
  );
}

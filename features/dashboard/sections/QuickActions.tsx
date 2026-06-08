"use client";

import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";

interface QuickActionsProps {
  onOpenNewTransaction?: () => void;
}

export function QuickActions({ onOpenNewTransaction }: QuickActionsProps) {
  const router = useRouter();
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme;
  const isDark = currentTheme === "dark";

  const actions = [
    {
      icon: "tabler:text-scan-ai",
      label: "Scan Bill",
      onClick: () => router.push("/transactions"),
      iconColor: "#ff4fa0",
      gradient: "radial-gradient(circle, rgba(255,79,160,0.25) 0%, rgba(255,79,160,0) 70%)",
    },
    {
      icon: "uil:import",
      label: "Add Income",
      onClick: onOpenNewTransaction,
      iconColor: "#00d27a",
      gradient: "radial-gradient(circle, rgba(0,210,122,0.25) 0%, rgba(0,210,122,0) 70%)",
    },
    {
      icon: "octicon:goal-24",
      label: "Set Goal",
      onClick: () => router.push("/accounts"),
      iconColor: "#ffae00",
      gradient: "radial-gradient(circle, rgba(255,174,0,0.25) 0%, rgba(255,174,0,0) 70%)",
    },
  ];

  return (
    <div className="mb-8 flex items-center justify-center gap-8 lg:gap-12">
      {actions.map((action) => (
        <button
          key={action.label}
          type="button"
          onClick={action.onClick}
          className="group flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:scale-105"
        >
          <div
            className="relative flex h-11 w-11 items-center justify-center transition-transform duration-300 group-hover:scale-110 lg:h-[44px] lg:w-[44px]"
            style={{
              background: action.gradient,
            }}
          >
            <Icon
              icon={action.icon}
              width={44}
              height={44}
              className="lg:w-[44px] lg:h-[44px]"
              style={{ color: action.iconColor }}
            />
          </div>
          <span
            className="text-[13px] font-semibold lg:text-[14px]"
            style={{
              color: isDark ? "#ffffff" : "#111827",
            }}
          >
            {action.label}
          </span>
        </button>
      ))}
    </div>
  );
}

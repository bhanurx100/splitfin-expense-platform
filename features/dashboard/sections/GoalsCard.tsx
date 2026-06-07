"use client";

import { Target } from "lucide-react";

interface GoalsCardProps {
  isDark: boolean;
}

export function GoalsCard({ isDark }: GoalsCardProps) {
  return (
    <div
      className="rounded-[28px] p-5 lg:p-7"
      style={{
        background: isDark ? "var(--surface-card)" : "var(--surface-card)",
        border: isDark ? "1px solid var(--border-default)" : "1px solid var(--border-default)",
        boxShadow: isDark ? "var(--shadow-lg)" : "var(--shadow-lg)",
      }}
    >
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <div
          className="mb-4 flex h-20 w-20 items-center justify-center rounded-full transition-transform duration-300 hover:scale-110"
          style={{
            background: isDark
              ? "rgba(244, 114, 182, 0.15)"
              : "rgba(244, 114, 182, 0.1)",
            border: `1px solid ${isDark ? "rgba(244, 114, 182, 0.3)" : "rgba(244, 114, 182, 0.2)"}`,
          }}
        >
          <Target className="h-10 w-10" style={{ color: "#F472B6" }} />
        </div>
        <h3
          className="mb-2 text-xl font-bold lg:text-2xl"
          style={{ color: isDark ? "#ffffff" : "#111827" }}
        >
          Upcoming Feature
        </h3>
        <p
          className="text-sm"
          style={{ color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)" }}
        >
          Set savings goals and track your progress
        </p>
        <p
          className="mt-3 rounded-full px-4 py-1.5 text-xs font-semibold"
          style={{
            color: "#F472B6",
            background: isDark
              ? "rgba(244, 114, 182, 0.15)"
              : "rgba(244, 114, 182, 0.1)",
            border: `1px solid ${isDark ? "rgba(244, 114, 182, 0.3)" : "rgba(244, 114, 182, 0.2)"}`,
          }}
        >
          Coming Soon
        </p>
      </div>
    </div>
  );
}

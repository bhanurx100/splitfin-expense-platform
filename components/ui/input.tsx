import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * SpendWise Design System — Input
 * Consistent fintech form input with proper focus states.
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Prepend an icon/element inside the left side */
  prefix?: React.ReactNode;
  /** Append an icon/element inside the right side */
  suffix?: React.ReactNode;
  /** Error state */
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, prefix, suffix, error, ...props }, ref) => {
    if (prefix || suffix) {
      return (
        <div className="relative flex items-center">
          {prefix && (
            <div className="pointer-events-none absolute left-3 flex items-center text-slate-400">
              {prefix}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              // Base
              "flex h-10 w-full rounded-xl border-[1.5px] bg-white",
              "text-[13px] text-slate-900 placeholder:text-slate-400",
              "outline-none transition-all duration-150",
              // Border
              error
                ? "border-red-400 focus:border-red-500 focus:shadow-[0_0_0_3px_rgb(239,68,68,0.12)]"
                : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgb(59,130,246,0.12)]",
              // Disabled
              "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100",
              // Padding with prefix/suffix
              prefix ? "pl-9" : "pl-3.5",
              suffix ? "pr-9" : "pr-3.5",
              className
            )}
            {...props}
          />
          {suffix && (
            <div className="absolute right-3 flex items-center text-slate-400">
              {suffix}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-xl border-[1.5px] bg-white px-3.5",
          "text-[13px] text-slate-900 placeholder:text-slate-400",
          "outline-none transition-all duration-150",
          error
            ? "border-red-400 focus:border-red-500 focus:shadow-[0_0_0_3px_rgb(239,68,68,0.12)]"
            : "border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:shadow-[0_0_0_3px_rgb(59,130,246,0.12)]",
          "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100",
          // File input reset
          "file:border-0 file:bg-transparent file:text-[13px] file:font-medium",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
export { Input };
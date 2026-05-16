import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * SpendWise Design System — Input
 * Dark-mode aware with semantic CSS variable tokens.
 */
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, leftIcon, rightIcon, error, ...props }, ref) => {
    const baseClasses = cn(
      "flex h-10 w-full rounded-xl",
      "border-[1.5px] bg-[var(--surface-card)]",
      "text-[13px] text-[var(--text-primary)]",
      "placeholder:text-[var(--text-muted)]",
      "outline-none transition-all duration-150",
      error
        ? "border-[var(--color-expense)] focus:border-[var(--color-expense)] focus:shadow-[0_0_0_3px_rgb(220,38,38,0.1)]"
        : "border-[var(--border-default)] hover:border-[var(--border-strong)] focus:border-[var(--border-focus)] focus:shadow-[0_0_0_3px_rgb(59,130,246,0.12)]",
      "disabled:cursor-not-allowed disabled:bg-[var(--surface-overlay)] disabled:text-[var(--text-muted)] disabled:border-[var(--border-subtle)]",
    );

    if (leftIcon || rightIcon) {
      return (
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="pointer-events-none absolute left-3 flex items-center text-[var(--text-muted)]">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            ref={ref}
            className={cn(
              baseClasses,
              leftIcon ? "pl-9" : "pl-3.5",
              rightIcon ? "pr-9" : "pr-3.5",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 flex items-center text-[var(--text-muted)]">
              {rightIcon}
            </div>
          )}
        </div>
      );
    }

    return (
      <input
        type={type}
        ref={ref}
        className={cn(baseClasses, "px-3.5", className)}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";
export { Input };
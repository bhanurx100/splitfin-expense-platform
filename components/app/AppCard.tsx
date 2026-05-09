// components/app/AppCard.tsx
import { cn } from "@/lib/utils";

type AppCardProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  /** stagger index for slide-up animation */
  index?: number;
  /** Remove default padding */
  noPadding?: boolean;
};

export function AppCard({ children, className, onClick, index, noPadding }: AppCardProps) {
  const Tag = onClick ? "button" : "div";
  const delay = index !== undefined ? `${index * 0.07}s` : undefined;

  return (
    <Tag
      onClick={onClick}
      style={delay ? { animationDelay: delay } : undefined}
      className={cn(
        // Base — matches the design system card exactly
        "slide-up w-full bg-white rounded-[18px] border border-slate-100 shadow-sm",
        // Interactive state
        onClick && [
          "text-left cursor-pointer",
          "transition-all duration-200",
          "hover:shadow-md hover:border-slate-200",
          "active:scale-[0.992]",
        ],
        // Padding
        !noPadding && "p-5",
        className
      )}
    >
      {children}
    </Tag>
  );
}
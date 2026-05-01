// components/app/AppCard.tsx
import { cn } from "@/lib/utils";

type AppCardProps = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  /** stagger index for slide-up animation */
  index?: number;
};

export function AppCard({ children, className, onClick, index }: AppCardProps) {
  const Tag = onClick ? "button" : "div";
  const delay = index !== undefined ? `${index * 0.07}s` : undefined;

  return (
    <Tag
      onClick={onClick}
      style={delay ? { animationDelay: delay } : undefined}
      className={cn(
        "slide-up w-full rounded-2xl border border-gray-100 bg-white p-4 shadow-sm",
        onClick && "text-left transition-all duration-200 hover:shadow-md active:scale-[0.985] cursor-pointer",
        className
      )}
    >
      {children}
    </Tag>
  );
}
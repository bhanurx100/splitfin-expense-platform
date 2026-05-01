// components/app/SectionLabel.tsx
// Small, consistent section heading above each card group.

type SectionLabelProps = {
  title: string;
  action?: { label: string; href: string };
};

export function SectionLabel({ title, action }: SectionLabelProps) {
  return (
    <div className="flex items-center justify-between px-1">
      <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</h2>
      {action && (
        <a href={action.href} className="text-xs font-semibold text-blue-600 transition hover:text-blue-700">
          {action.label}
        </a>
      )}
    </div>
  );
}
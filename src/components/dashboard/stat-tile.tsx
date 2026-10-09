import type { LucideIcon } from "lucide-react";

export function StatTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="relative px-5 py-4">
      <span className="absolute inset-x-0 bottom-0 h-0.5" style={{ backgroundColor: accent }} />
      <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" style={{ color: accent }} />
        {label}
      </div>
      <p className="mt-2 font-heading text-3xl font-bold tabular-nums leading-none">{value}</p>
    </div>
  );
}

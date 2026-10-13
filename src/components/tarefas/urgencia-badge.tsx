import { cn } from "@/lib/utils";
import { URGENCIA_INFO, type Urgencia } from "@/lib/urgencia";

export function UrgenciaBadge({ urgencia, className }: { urgencia: Urgencia; className?: string }) {
  const info = URGENCIA_INFO[urgencia];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-medium",
        info.badge,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", info.cor)} />
      {info.label}
    </span>
  );
}

import type { TooltipContentProps } from "recharts";

/**
 * Conteúdo customizado pro <Tooltip content={<ChartTooltipContent />} /> do Recharts —
 * tem a cara do resto da UI (card + borda) em vez do balão branco padrão.
 */
export function ChartTooltipContent({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-border bg-popover px-3 py-2 text-xs shadow-lg">
      {label && <p className="mb-1 font-medium text-popover-foreground">{label}</p>}
      {payload.map((item) => (
        <div key={item.name} className="flex items-center gap-1.5">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-muted-foreground">{item.name}:</span>
          <span className="font-medium tabular-nums text-popover-foreground">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { URGENCIA_INFO, URGENCIA_VALUES, type Urgencia } from "@/lib/urgencia";
import { cn } from "@/lib/utils";

export function UrgenciaSelect({
  value,
  onValueChange,
  className,
}: {
  value: Urgencia;
  onValueChange: (valor: Urgencia) => void;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={(v) => onValueChange(v as Urgencia)}>
      <SelectTrigger className={cn("w-[9.5rem]", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {URGENCIA_VALUES.map((v) => (
          <SelectItem key={v} value={v}>
            <span className="flex items-center gap-2">
              <span className={cn("h-2 w-2 shrink-0 rounded-full", URGENCIA_INFO[v].cor)} />
              {URGENCIA_INFO[v].label}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

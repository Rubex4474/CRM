"use client";

import { Pencil, Trash2 } from "lucide-react";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import { normalizarUrgencia } from "@/lib/urgencia";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UrgenciaBadge } from "./urgencia-badge";

export type TarefaLeadMinima = {
  id: string;
  descricao: string;
  dataPrevista: Date | null;
  concluida: boolean;
  urgencia: string;
};

export function TarefaLeadItem({
  tarefa,
  onToggle,
  onEditar,
  onExcluir,
  extra,
}: {
  tarefa: TarefaLeadMinima;
  onToggle: (id: string, concluida: boolean) => void;
  onEditar: (tarefa: TarefaLeadMinima) => void;
  onExcluir: (id: string) => void;
  /** Conteúdo extra abaixo da urgência/data — ex: link pro lead, na lista consolidada. */
  extra?: React.ReactNode;
}) {
  const atrasada = isOverdue(tarefa.dataPrevista, tarefa.concluida);
  const urgencia = normalizarUrgencia(tarefa.urgencia);

  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-lg border border-border p-2.5",
        atrasada && "border-destructive/40 bg-destructive/5",
      )}
    >
      <Checkbox
        checked={tarefa.concluida}
        onCheckedChange={(checked) => onToggle(tarefa.id, checked === true)}
        className="mt-0.5"
      />
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm", tarefa.concluida && "text-muted-foreground line-through")}>
          {tarefa.descricao}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {!tarefa.concluida && <UrgenciaBadge urgencia={urgencia} />}
          {tarefa.dataPrevista && (
            <span className={cn("text-xs text-muted-foreground", atrasada && "font-medium text-destructive")}>
              {formatDate(tarefa.dataPrevista)}
              {atrasada && " · atrasada"}
            </span>
          )}
        </div>
        {extra}
      </div>
      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => onEditar(tarefa)}>
        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
      </Button>
      <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => onExcluir(tarefa.id)}>
        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
      </Button>
    </div>
  );
}

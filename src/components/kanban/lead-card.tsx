"use client";

import { useDraggable } from "@dnd-kit/core";
import { AlertTriangle, Phone, Tag } from "lucide-react";
import type { LeadComTarefas } from "@/services/workspace.service";
import { cn, isOverdue } from "@/lib/utils";
import { Card } from "@/components/ui/card";

export function LeadCard({
  lead,
  onClick,
  dragOverlay,
}: {
  lead: LeadComTarefas;
  onClick?: () => void;
  dragOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    disabled: dragOverlay,
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const temAtrasada = lead.tarefas.some((t) => isOverdue(t.dataPrevista, t.concluida));
  const pendentes = lead.tarefas.filter((t) => !t.concluida).length;

  return (
    <Card
      ref={dragOverlay ? undefined : setNodeRef}
      style={style}
      {...(dragOverlay ? {} : { ...listeners, ...attributes })}
      onClick={onClick}
      className={cn(
        "cursor-pointer select-none p-3 transition-shadow hover:shadow-card",
        isDragging && "kanban-card-dragging",
        dragOverlay && "rotate-2 shadow-lg",
      )}
    >
      <p className="font-heading text-sm font-bold leading-tight">{lead.nome}</p>
      {lead.contato && (
        <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Phone className="h-3 w-3" />
          {lead.contato}
        </p>
      )}
      {lead.origem && (
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Tag className="h-3 w-3" />
          {lead.origem}
        </p>
      )}
      {(pendentes > 0 || temAtrasada) && (
        <div className="mt-2 flex items-center gap-1.5">
          {temAtrasada && (
            <span className="flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
              <AlertTriangle className="h-3 w-3" />
              Atrasada
            </span>
          )}
          {pendentes > 0 && !temAtrasada && (
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
              {pendentes} tarefa{pendentes > 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}

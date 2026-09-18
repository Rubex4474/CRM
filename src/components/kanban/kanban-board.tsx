"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { DndContext, DragOverlay, PointerSensor, useSensor, useSensors, type DragEndEvent, type DragStartEvent } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { EstagioComLeads, LeadComTarefas } from "@/services/workspace.service";
import { moverLeadAction } from "@/actions/leads.actions";
import { reordenarEstagiosAction } from "@/actions/estagios.actions";
import { Button } from "@/components/ui/button";
import { KanbanColumn } from "./kanban-column";
import { LeadCard } from "./lead-card";
import { LeadPanel } from "./lead-panel";
import { NewColumnDialog } from "./new-column-dialog";

export function KanbanBoard({
  clienteId,
  funilId,
  estagios,
}: {
  clienteId: string;
  funilId: string;
  estagios: EstagioComLeads[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [columns, setColumns] = useState(estagios);
  const [activeLead, setActiveLead] = useState<LeadComTarefas | null>(null);
  const [selectedLead, setSelectedLead] = useState<LeadComTarefas | null>(null);
  const [novaColunaOpen, setNovaColunaOpen] = useState(false);

  useEffect(() => {
    setColumns(estagios);
    if (selectedLead) {
      const atualizado = estagios
        .flatMap((estagio) => estagio.leads)
        .find((lead) => lead.id === selectedLead.id);
      setSelectedLead(atualizado ?? null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estagios]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  function handleDragStart(event: DragStartEvent) {
    const lead = columns.flatMap((c) => c.leads).find((l) => l.id === event.active.id);
    setActiveLead(lead ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveLead(null);
    const { active, over } = event;
    if (!over) return;

    const leadId = String(active.id);
    const destinoEstagioId = String(over.id);

    const origemEstagio = columns.find((c) => c.leads.some((l) => l.id === leadId));
    if (!origemEstagio || origemEstagio.id === destinoEstagioId) return;

    const lead = origemEstagio.leads.find((l) => l.id === leadId);
    if (!lead) return;

    const novaOrdem = (columns.find((c) => c.id === destinoEstagioId)?.leads.length ?? 0) + 1;

    setColumns((prev) =>
      prev.map((coluna) => {
        if (coluna.id === origemEstagio.id) {
          return { ...coluna, leads: coluna.leads.filter((l) => l.id !== leadId) };
        }
        if (coluna.id === destinoEstagioId) {
          return { ...coluna, leads: [...coluna.leads, { ...lead, estagioId: destinoEstagioId }] };
        }
        return coluna;
      }),
    );

    startTransition(async () => {
      try {
        await moverLeadAction({ clienteId, leadId, estagioId: destinoEstagioId, ordem: novaOrdem });
        router.refresh();
      } catch {
        toast.error("Não foi possível mover o lead.");
        router.refresh();
      }
    });
  }

  function moverColuna(estagioId: string, direcao: "esquerda" | "direita") {
    const index = columns.findIndex((c) => c.id === estagioId);
    const alvo = direcao === "esquerda" ? index - 1 : index + 1;
    if (alvo < 0 || alvo >= columns.length) return;

    const reordenadas = [...columns];
    [reordenadas[index], reordenadas[alvo]] = [reordenadas[alvo], reordenadas[index]];
    setColumns(reordenadas);

    startTransition(async () => {
      await reordenarEstagiosAction({ clienteId, ordemIds: reordenadas.map((c) => c.id) });
      router.refresh();
    });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-6 py-4">
        <p className="text-sm text-muted-foreground">
          Arraste os cards entre as colunas para avançar o funil.
        </p>
        <Button variant="outline" size="sm" onClick={() => setNovaColunaOpen(true)}>
          <Plus className="h-4 w-4" />
          Nova coluna
        </Button>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex h-full flex-1 gap-4 overflow-x-auto px-6 pb-6">
          {columns.map((estagio, index) => (
            <KanbanColumn
              key={estagio.id}
              clienteId={clienteId}
              funilId={funilId}
              estagio={estagio}
              onSelectLead={setSelectedLead}
              onMoveLeft={() => moverColuna(estagio.id, "esquerda")}
              onMoveRight={() => moverColuna(estagio.id, "direita")}
              podeMoverEsquerda={index > 0}
              podeMoverDireita={index < columns.length - 1}
            />
          ))}
        </div>
        <DragOverlay>{activeLead ? <LeadCard lead={activeLead} dragOverlay /> : null}</DragOverlay>
      </DndContext>

      <LeadPanel
        clienteId={clienteId}
        lead={selectedLead}
        onClose={() => setSelectedLead(null)}
      />

      <NewColumnDialog
        clienteId={clienteId}
        funilId={funilId}
        open={novaColunaOpen}
        onOpenChange={setNovaColunaOpen}
      />
    </div>
  );
}

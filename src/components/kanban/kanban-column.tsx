"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useDroppable } from "@dnd-kit/core";
import { ArrowLeft, ArrowRight, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { EstagioComLeads, LeadComTarefas } from "@/services/workspace.service";
import { renomearEstagioAction, excluirEstagioAction } from "@/actions/estagios.actions";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LeadCard } from "./lead-card";
import { NewLeadDialog } from "./new-lead-dialog";

export function KanbanColumn({
  clienteId,
  funilId,
  estagio,
  onSelectLead,
  onMoveLeft,
  onMoveRight,
  podeMoverEsquerda,
  podeMoverDireita,
}: {
  clienteId: string;
  funilId: string;
  estagio: EstagioComLeads;
  onSelectLead: (lead: LeadComTarefas) => void;
  onMoveLeft: () => void;
  onMoveRight: () => void;
  podeMoverEsquerda: boolean;
  podeMoverDireita: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const { setNodeRef, isOver } = useDroppable({ id: estagio.id });
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(estagio.nome);
  const [novoLeadOpen, setNovoLeadOpen] = useState(false);

  function salvarNome() {
    setEditando(false);
    if (!nome.trim() || nome === estagio.nome) {
      setNome(estagio.nome);
      return;
    }
    startTransition(async () => {
      await renomearEstagioAction({ clienteId, estagioId: estagio.id, nome: nome.trim() });
      router.refresh();
    });
  }

  function excluir() {
    startTransition(async () => {
      try {
        await excluirEstagioAction({ clienteId, estagioId: estagio.id });
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Não foi possível excluir a coluna.");
      }
    });
  }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex h-full w-72 shrink-0 flex-col rounded-xl border border-border bg-card/60 transition-colors",
        isOver && "border-primary/50 bg-primary/5",
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-3">
        {editando ? (
          <Input
            autoFocus
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onBlur={salvarNome}
            onKeyDown={(e) => e.key === "Enter" && salvarNome()}
            className="h-7 text-sm"
          />
        ) : (
          <button
            onClick={() => setEditando(true)}
            className="truncate text-left font-heading text-sm font-bold hover:text-primary"
          >
            {estagio.nome}
          </button>
        )}
        <div className="flex items-center gap-1.5">
          <Badge variant="secondary">{estagio.leads.length}</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setEditando(true)}>
                <Pencil className="h-3.5 w-3.5" />
                Renomear
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!podeMoverEsquerda} onClick={onMoveLeft}>
                <ArrowLeft className="h-3.5 w-3.5" />
                Mover para esquerda
              </DropdownMenuItem>
              <DropdownMenuItem disabled={!podeMoverDireita} onClick={onMoveRight}>
                <ArrowRight className="h-3.5 w-3.5" />
                Mover para direita
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem destructive onClick={excluir}>
                <Trash2 className="h-3.5 w-3.5" />
                Excluir coluna
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2.5">
        {estagio.leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} onClick={() => onSelectLead(lead)} />
        ))}
        {estagio.leads.length === 0 && (
          <p className="rounded-lg border border-dashed border-border py-6 text-center text-xs text-muted-foreground">
            Arraste um lead para cá
          </p>
        )}
      </div>

      <div className="border-t border-border p-2.5">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground"
          onClick={() => setNovoLeadOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Novo lead
        </Button>
      </div>

      <NewLeadDialog
        clienteId={clienteId}
        estagioId={estagio.id}
        open={novoLeadOpen}
        onOpenChange={setNovoLeadOpen}
      />
    </div>
  );
}

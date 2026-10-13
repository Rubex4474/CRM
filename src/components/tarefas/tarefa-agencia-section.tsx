"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";
import type { TarefaAgencia } from "@prisma/client";
import {
  alternarTarefaAgenciaAction,
  atualizarTarefaAgenciaAction,
  excluirTarefaAgenciaAction,
} from "@/actions/tarefas-agencia.actions";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import { normalizarUrgencia, URGENCIA_PESO } from "@/lib/urgencia";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { UrgenciaBadge } from "./urgencia-badge";
import { EditarTarefaDialog } from "./editar-tarefa-dialog";

function Linha({
  tarefa,
  onToggle,
  onEditar,
  onExcluir,
}: {
  tarefa: TarefaAgencia;
  onToggle: (id: string, concluida: boolean) => void;
  onEditar: (tarefa: TarefaAgencia) => void;
  onExcluir: (id: string) => void;
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
      </div>
      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => onEditar(tarefa)}>
        <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
      </Button>
      <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => onExcluir(tarefa.id)}>
        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
      </Button>
    </div>
  );
}

export function TarefaAgenciaSection({ tarefas }: { tarefas: TarefaAgencia[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editando, setEditando] = useState<TarefaAgencia | null>(null);
  const [concluidasAbertas, setConcluidasAbertas] = useState(false);

  const pendentes = tarefas
    .filter((t) => !t.concluida)
    .sort((a, b) => {
      const pesoA = URGENCIA_PESO[normalizarUrgencia(a.urgencia)];
      const pesoB = URGENCIA_PESO[normalizarUrgencia(b.urgencia)];
      if (pesoA !== pesoB) return pesoA - pesoB;
      if (!a.dataPrevista) return 1;
      if (!b.dataPrevista) return -1;
      return a.dataPrevista.getTime() - b.dataPrevista.getTime();
    });
  const concluidas = tarefas.filter((t) => t.concluida);

  function toggle(id: string, concluida: boolean) {
    startTransition(async () => {
      await alternarTarefaAgenciaAction({ tarefaId: id, concluida });
      router.refresh();
    });
  }

  function excluir(id: string) {
    startTransition(async () => {
      await excluirTarefaAgenciaAction({ tarefaId: id });
      router.refresh();
    });
  }

  async function salvarEdicao(dados: { descricao: string; dataPrevista: string; urgencia: string }) {
    if (!editando) return;
    await atualizarTarefaAgenciaAction({ tarefaId: editando.id, ...dados });
    router.refresh();
  }

  if (tarefas.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma tarefa ainda.</p>;
  }

  return (
    <div className="flex flex-col gap-4">
      {pendentes.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhuma tarefa pendente — tudo em dia.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {pendentes.map((t) => (
            <Linha key={t.id} tarefa={t} onToggle={toggle} onEditar={setEditando} onExcluir={excluir} />
          ))}
        </div>
      )}

      {concluidas.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setConcluidasAbertas((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", concluidasAbertas && "rotate-180")} />
            Concluídas ({concluidas.length})
          </button>
          {concluidasAbertas && (
            <div className="mt-2 flex flex-col gap-2">
              {concluidas.map((t) => (
                <Linha key={t.id} tarefa={t} onToggle={toggle} onEditar={setEditando} onExcluir={excluir} />
              ))}
            </div>
          )}
        </div>
      )}

      <EditarTarefaDialog
        tarefa={editando}
        open={!!editando}
        onOpenChange={(open) => !open && setEditando(null)}
        onSalvar={salvarEdicao}
      />
    </div>
  );
}

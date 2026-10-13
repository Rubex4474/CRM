"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import type { TarefaDoWorkspace } from "@/services/workspace.service";
import { alternarTarefaLeadAction, atualizarTarefaLeadAction } from "@/actions/tarefas-lead.actions";
import { normalizarUrgencia, URGENCIA_PESO } from "@/lib/urgencia";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { UrgenciaBadge } from "@/components/tarefas/urgencia-badge";
import { EditarTarefaDialog, type TarefaEditavel } from "@/components/tarefas/editar-tarefa-dialog";

function Linha({
  tarefa,
  clienteId,
  onToggle,
  onEditar,
}: {
  tarefa: TarefaDoWorkspace;
  clienteId: string;
  onToggle: (tarefaId: string, concluida: boolean) => void;
  onEditar: (tarefa: TarefaDoWorkspace) => void;
}) {
  const atrasada = isOverdue(tarefa.dataPrevista, tarefa.concluida);
  const urgencia = normalizarUrgencia(tarefa.urgencia);

  return (
    <div
      className={cn(
        "flex items-center gap-3 border-b border-border py-3 last:border-0",
        atrasada && "bg-destructive/5",
      )}
    >
      <Checkbox
        checked={tarefa.concluida}
        onCheckedChange={(checked) => onToggle(tarefa.id, checked === true)}
      />
      <div className="min-w-0 flex-1">
        <p className={cn("text-sm", tarefa.concluida && "text-muted-foreground line-through")}>
          {tarefa.descricao}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5">
          {!tarefa.concluida && <UrgenciaBadge urgencia={urgencia} />}
          <Link
            href={`/workspace/${clienteId}/kanban?lead=${tarefa.lead.id}`}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
          >
            {tarefa.lead.nome} · {tarefa.lead.estagio.nome}
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
      {tarefa.dataPrevista && (
        <span className={cn("shrink-0 text-xs text-muted-foreground", atrasada && "font-medium text-destructive")}>
          {formatDate(tarefa.dataPrevista)}
        </span>
      )}
      <button
        type="button"
        onClick={() => onEditar(tarefa)}
        className="shrink-0 text-xs font-medium text-muted-foreground hover:text-primary"
      >
        Editar
      </button>
    </div>
  );
}

export function WorkspaceTarefasList({
  clienteId,
  tarefas,
}: {
  clienteId: string;
  tarefas: TarefaDoWorkspace[];
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editando, setEditando] = useState<TarefaDoWorkspace | null>(null);

  function toggle(tarefaId: string, concluida: boolean) {
    startTransition(async () => {
      await alternarTarefaLeadAction({ clienteId, tarefaId, concluida });
      router.refresh();
    });
  }

  async function salvarEdicao(dados: { descricao: string; dataPrevista: string; urgencia: string }) {
    if (!editando) return;
    await atualizarTarefaLeadAction({ tarefaId: editando.id, clienteId, ...dados });
    router.refresh();
  }

  const porUrgencia = (a: TarefaDoWorkspace, b: TarefaDoWorkspace) =>
    URGENCIA_PESO[normalizarUrgencia(a.urgencia)] - URGENCIA_PESO[normalizarUrgencia(b.urgencia)];

  const atrasadas = tarefas.filter((t) => isOverdue(t.dataPrevista, t.concluida)).sort(porUrgencia);
  const noPrazo = tarefas.filter((t) => !t.concluida && !isOverdue(t.dataPrevista, t.concluida)).sort(porUrgencia);
  const concluidas = tarefas.filter((t) => t.concluida);

  if (tarefas.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Nenhuma tarefa cadastrada ainda. Abra um lead no Kanban pra criar a primeira.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {atrasadas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              Atrasadas
              <Badge variant="destructive">{atrasadas.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col pt-0">
            {atrasadas.map((t) => (
              <Linha key={t.id} tarefa={t} clienteId={clienteId} onToggle={toggle} onEditar={setEditando} />
            ))}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>No prazo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col pt-0">
          {noPrazo.length === 0 && (
            <p className="py-2 text-sm text-muted-foreground">Nenhuma tarefa pendente no prazo.</p>
          )}
          {noPrazo.map((t) => (
            <Linha key={t.id} tarefa={t} clienteId={clienteId} onToggle={toggle} onEditar={setEditando} />
          ))}
        </CardContent>
      </Card>

      {concluidas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-muted-foreground">Concluídas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col pt-0">
            {concluidas.map((t) => (
              <Linha key={t.id} tarefa={t} clienteId={clienteId} onToggle={toggle} onEditar={setEditando} />
            ))}
          </CardContent>
        </Card>
      )}

      <EditarTarefaDialog
        tarefa={editando as TarefaEditavel | null}
        open={!!editando}
        onOpenChange={(open) => !open && setEditando(null)}
        onSalvar={salvarEdicao}
      />
    </div>
  );
}

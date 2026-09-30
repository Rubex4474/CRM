"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AlertTriangle, ArrowRight } from "lucide-react";
import type { TarefaDoWorkspace } from "@/services/workspace.service";
import { alternarTarefaLeadAction } from "@/actions/tarefas-lead.actions";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

function Linha({
  tarefa,
  clienteId,
  onToggle,
}: {
  tarefa: TarefaDoWorkspace;
  clienteId: string;
  onToggle: (tarefaId: string, concluida: boolean) => void;
}) {
  const atrasada = isOverdue(tarefa.dataPrevista, tarefa.concluida);

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
        <Link
          href={`/workspace/${clienteId}?lead=${tarefa.lead.id}`}
          className="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
        >
          {tarefa.lead.nome} · {tarefa.lead.estagio.nome}
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      {tarefa.dataPrevista && (
        <span className={cn("shrink-0 text-xs text-muted-foreground", atrasada && "font-medium text-destructive")}>
          {formatDate(tarefa.dataPrevista)}
        </span>
      )}
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

  function toggle(tarefaId: string, concluida: boolean) {
    startTransition(async () => {
      await alternarTarefaLeadAction({ clienteId, tarefaId, concluida });
      router.refresh();
    });
  }

  const atrasadas = tarefas.filter((t) => isOverdue(t.dataPrevista, t.concluida));
  const noPrazo = tarefas.filter((t) => !t.concluida && !isOverdue(t.dataPrevista, t.concluida));
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
              <Linha key={t.id} tarefa={t} clienteId={clienteId} onToggle={toggle} />
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
            <Linha key={t.id} tarefa={t} clienteId={clienteId} onToggle={toggle} />
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
              <Linha key={t.id} tarefa={t} clienteId={clienteId} onToggle={toggle} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

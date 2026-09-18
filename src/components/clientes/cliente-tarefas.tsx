"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import type { TarefaAgencia } from "@prisma/client";
import {
  alternarTarefaAgenciaAction,
  criarTarefaAgenciaAction,
  excluirTarefaAgenciaAction,
} from "@/actions/tarefas-agencia.actions";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export function ClienteTarefas({ clienteId, tarefas }: { clienteId: string; tarefas: TarefaAgencia[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");

  function adicionar() {
    if (!descricao.trim()) return;
    const formData = new FormData();
    formData.set("clienteId", clienteId);
    formData.set("descricao", descricao.trim());
    if (data) formData.set("dataPrevista", data);

    startTransition(async () => {
      await criarTarefaAgenciaAction(formData);
      setDescricao("");
      setData("");
      router.refresh();
    });
  }

  function alternar(tarefaId: string, concluida: boolean) {
    startTransition(async () => {
      await alternarTarefaAgenciaAction({ tarefaId, concluida });
      router.refresh();
    });
  }

  function excluir(tarefaId: string) {
    startTransition(async () => {
      await excluirTarefaAgenciaAction({ tarefaId });
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tarefas</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        <div className="flex gap-2">
          <Input
            placeholder="Nova tarefa"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && adicionar()}
          />
          <Input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-40" />
          <Button size="icon" onClick={adicionar}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {tarefas.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma tarefa ainda.</p>}
        {tarefas.map((tarefa) => {
          const atrasada = isOverdue(tarefa.dataPrevista, tarefa.concluida);
          return (
            <div
              key={tarefa.id}
              className={cn(
                "flex items-start gap-2.5 rounded-lg border border-border p-2.5",
                atrasada && "border-destructive/40 bg-destructive/5",
              )}
            >
              <Checkbox
                checked={tarefa.concluida}
                onCheckedChange={(checked) => alternar(tarefa.id, checked === true)}
                className="mt-0.5"
              />
              <div className="flex-1">
                <p className={cn("text-sm", tarefa.concluida && "text-muted-foreground line-through")}>
                  {tarefa.descricao}
                </p>
                {tarefa.dataPrevista && (
                  <p className={cn("mt-0.5 flex items-center gap-1 text-xs text-muted-foreground", atrasada && "text-destructive")}>
                    {atrasada && <AlertTriangle className="h-3 w-3" />}
                    {formatDate(tarefa.dataPrevista)}
                  </p>
                )}
              </div>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => excluir(tarefa.id)}>
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

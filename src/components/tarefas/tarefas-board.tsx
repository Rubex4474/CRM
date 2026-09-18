"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import type { ClienteComTarefas } from "@/services/tarefas-agencia.service";
import {
  alternarTarefaAgenciaAction,
  criarTarefaAgenciaAction,
  excluirTarefaAgenciaAction,
} from "@/actions/tarefas-agencia.actions";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function TarefasBoard({ clientes }: { clientes: ClienteComTarefas[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [filtro, setFiltro] = useState<string>("todos");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");
  const [clienteNovaTarefa, setClienteNovaTarefa] = useState(clientes[0]?.id ?? "");

  const clientesFiltrados = useMemo(
    () => (filtro === "todos" ? clientes : clientes.filter((c) => c.id === filtro)),
    [clientes, filtro],
  );

  function adicionar() {
    if (!descricao.trim() || !clienteNovaTarefa) return;
    const formData = new FormData();
    formData.set("clienteId", clienteNovaTarefa);
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
    <div className="flex flex-col gap-5">
      <Card>
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Input
              placeholder="Nova tarefa (ex: Enviar relatório mensal)"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && adicionar()}
            />
          </div>
          <Select value={clienteNovaTarefa} onValueChange={setClienteNovaTarefa}>
            <SelectTrigger className="sm:w-48">
              <SelectValue placeholder="Cliente" />
            </SelectTrigger>
            <SelectContent>
              {clientes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input type="date" value={data} onChange={(e) => setData(e.target.value)} className="sm:w-40" />
          <Button onClick={adicionar}>
            <Plus className="h-4 w-4" />
            Adicionar
          </Button>
        </CardContent>
      </Card>

      <Select value={filtro} onValueChange={setFiltro}>
        <SelectTrigger className="w-56">
          <SelectValue placeholder="Filtrar por cliente" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="todos">Todos os clientes</SelectItem>
          {clientes.map((c) => (
            <SelectItem key={c.id} value={c.id}>
              {c.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex flex-col gap-6">
        {clientesFiltrados.map((cliente) => (
          <div key={cliente.id}>
            <h2 className="mb-2 font-heading text-sm font-bold text-muted-foreground">{cliente.nome}</h2>
            <div className="flex flex-col gap-2">
              {cliente.tarefas.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhuma tarefa para este cliente.</p>
              )}
              {cliente.tarefas.map((tarefa) => {
                const atrasada = isOverdue(tarefa.dataPrevista, tarefa.concluida);
                return (
                  <Card
                    key={tarefa.id}
                    className={cn("p-3", atrasada && "border-destructive/40 bg-destructive/5")}
                  >
                    <div className="flex items-start gap-3">
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
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => excluir(tarefa.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

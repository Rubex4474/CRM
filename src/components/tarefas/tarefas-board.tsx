"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { ClienteComTarefas } from "@/services/tarefas-agencia.service";
import { criarTarefaAgenciaAction } from "@/actions/tarefas-agencia.actions";
import type { Urgencia } from "@/lib/urgencia";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UrgenciaSelect } from "./urgencia-select";
import { TarefaAgenciaSection } from "./tarefa-agencia-section";

export function TarefasBoard({ clientes }: { clientes: ClienteComTarefas[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [filtro, setFiltro] = useState<string>("todos");
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");
  const [urgencia, setUrgencia] = useState<Urgencia>("media");
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
    formData.set("urgencia", urgencia);
    if (data) formData.set("dataPrevista", data);

    startTransition(async () => {
      await criarTarefaAgenciaAction(formData);
      setDescricao("");
      setData("");
      setUrgencia("media");
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardContent className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-end sm:flex-wrap">
          <div className="min-w-[12rem] flex-1">
            <Input
              placeholder="Nova tarefa (ex: Enviar relatório mensal)"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && adicionar()}
            />
          </div>
          <Select value={clienteNovaTarefa} onValueChange={setClienteNovaTarefa}>
            <SelectTrigger className="sm:w-44">
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
          <UrgenciaSelect value={urgencia} onValueChange={setUrgencia} />
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
            <TarefaAgenciaSection tarefas={cliente.tarefas} />
          </div>
        ))}
      </div>
    </div>
  );
}

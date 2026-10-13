"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import type { TarefaAgencia } from "@prisma/client";
import { criarTarefaAgenciaAction } from "@/actions/tarefas-agencia.actions";
import type { Urgencia } from "@/lib/urgencia";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UrgenciaSelect } from "@/components/tarefas/urgencia-select";
import { TarefaAgenciaSection } from "@/components/tarefas/tarefa-agencia-section";

export function ClienteTarefas({ clienteId, tarefas }: { clienteId: string; tarefas: TarefaAgencia[] }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");
  const [urgencia, setUrgencia] = useState<Urgencia>("media");

  function adicionar() {
    if (!descricao.trim()) return;
    const formData = new FormData();
    formData.set("clienteId", clienteId);
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
    <Card>
      <CardHeader>
        <CardTitle>Tarefas</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        <div className="flex flex-wrap items-end gap-2">
          <Input
            placeholder="Nova tarefa"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && adicionar()}
            className="min-w-[10rem] flex-1"
          />
          <UrgenciaSelect value={urgencia} onValueChange={setUrgencia} className="w-36" />
          <Input type="date" value={data} onChange={(e) => setData(e.target.value)} className="w-36" />
          <Button size="icon" onClick={adicionar}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <TarefaAgenciaSection tarefas={tarefas} />
      </CardContent>
    </Card>
  );
}

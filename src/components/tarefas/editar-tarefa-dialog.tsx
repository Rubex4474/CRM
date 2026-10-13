"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UrgenciaSelect } from "./urgencia-select";
import { normalizarUrgencia, type Urgencia } from "@/lib/urgencia";

export type TarefaEditavel = {
  id: string;
  descricao: string;
  dataPrevista: Date | null;
  urgencia: string;
};

export function EditarTarefaDialog({
  tarefa,
  open,
  onOpenChange,
  onSalvar,
}: {
  tarefa: TarefaEditavel | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSalvar: (dados: { descricao: string; dataPrevista: string; urgencia: Urgencia }) => Promise<void>;
}) {
  const [descricao, setDescricao] = useState("");
  const [data, setData] = useState("");
  const [urgencia, setUrgencia] = useState<Urgencia>("media");
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    if (!tarefa) return;
    setDescricao(tarefa.descricao);
    setData(tarefa.dataPrevista ? tarefa.dataPrevista.toISOString().slice(0, 10) : "");
    setUrgencia(normalizarUrgencia(tarefa.urgencia));
  }, [tarefa]);

  async function salvar() {
    if (!descricao.trim()) return;
    setSalvando(true);
    try {
      await onSalvar({ descricao: descricao.trim(), dataPrevista: data, urgencia });
      onOpenChange(false);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar tarefa</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="editar-tarefa-descricao">Descrição</Label>
            <Input
              id="editar-tarefa-descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && salvar()}
              autoFocus
            />
          </div>
          <div className="flex items-end gap-3">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="editar-tarefa-data">Data prevista</Label>
              <Input id="editar-tarefa-data" type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Urgência</Label>
              <UrgenciaSelect value={urgencia} onValueChange={setUrgencia} />
            </div>
          </div>
          <Button onClick={salvar} disabled={salvando}>
            {salvando ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

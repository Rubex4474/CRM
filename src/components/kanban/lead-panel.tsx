"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { MessageCircle, Plus, Trash2, X } from "lucide-react";
import type { LeadComTarefas } from "@/services/workspace.service";
import { atualizarLeadAction, excluirLeadAction } from "@/actions/leads.actions";
import {
  alternarTarefaLeadAction,
  criarTarefaLeadAction,
  excluirTarefaLeadAction,
} from "@/actions/tarefas-lead.actions";
import { buildWhatsappLink, cn, formatDate, isOverdue } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

export function LeadPanel({
  clienteId,
  lead,
  onClose,
}: {
  clienteId: string;
  lead: LeadComTarefas | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {lead && (
        <>
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/60"
            onClick={onClose}
          />
          <motion.div
            key="panel"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-card"
          >
            <PanelContent clienteId={clienteId} lead={lead} onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function PanelContent({
  clienteId,
  lead,
  onClose,
}: {
  clienteId: string;
  lead: LeadComTarefas;
  onClose: () => void;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [nome, setNome] = useState(lead.nome);
  const [contato, setContato] = useState(lead.contato ?? "");
  const [origem, setOrigem] = useState(lead.origem ?? "");
  const [notas, setNotas] = useState(lead.notas ?? "");
  const [novaTarefa, setNovaTarefa] = useState("");
  const [novaData, setNovaData] = useState("");

  useEffect(() => {
    setNome(lead.nome);
    setContato(lead.contato ?? "");
    setOrigem(lead.origem ?? "");
    setNotas(lead.notas ?? "");
  }, [lead.id, lead.nome, lead.contato, lead.origem, lead.notas]);

  const whatsappLink = buildWhatsappLink(contato);

  function salvarDados() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("leadId", lead.id);
      formData.set("clienteId", clienteId);
      formData.set("nome", nome);
      formData.set("contato", contato);
      formData.set("origem", origem);
      formData.set("notas", notas);
      await atualizarLeadAction(formData);
      router.refresh();
    });
  }

  function excluirLead() {
    if (!confirm(`Excluir o lead "${lead.nome}"? Essa ação não pode ser desfeita.`)) return;
    startTransition(async () => {
      await excluirLeadAction({ clienteId, leadId: lead.id });
      onClose();
      router.refresh();
    });
  }

  function adicionarTarefa() {
    if (!novaTarefa.trim()) return;
    const formData = new FormData();
    formData.set("clienteId", clienteId);
    formData.set("leadId", lead.id);
    formData.set("descricao", novaTarefa.trim());
    if (novaData) formData.set("dataPrevista", novaData);

    startTransition(async () => {
      await criarTarefaLeadAction(formData);
      setNovaTarefa("");
      setNovaData("");
      router.refresh();
    });
  }

  function alternarTarefa(tarefaId: string, concluida: boolean) {
    startTransition(async () => {
      await alternarTarefaLeadAction({ clienteId, tarefaId, concluida });
      router.refresh();
    });
  }

  function excluirTarefa(tarefaId: string) {
    startTransition(async () => {
      await excluirTarefaLeadAction({ clienteId, tarefaId });
      router.refresh();
    });
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="font-heading text-base font-bold">Detalhes do lead</h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={excluirLead} title="Excluir lead">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lead-nome">Nome</Label>
            <Input id="lead-nome" value={nome} onChange={(e) => setNome(e.target.value)} onBlur={salvarDados} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lead-contato">Contato</Label>
            <div className="flex gap-2">
              <Input
                id="lead-contato"
                value={contato}
                onChange={(e) => setContato(e.target.value)}
                onBlur={salvarDados}
                placeholder="Telefone ou e-mail"
              />
              {whatsappLink && (
                <Button asChild variant="success" size="icon" title="Abrir WhatsApp">
                  <a href={whatsappLink} target="_blank" rel="noreferrer">
                    <MessageCircle className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lead-origem">Origem</Label>
            <Input id="lead-origem" value={origem} onChange={(e) => setOrigem(e.target.value)} onBlur={salvarDados} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lead-notas">Notas</Label>
            <Textarea id="lead-notas" value={notas} onChange={(e) => setNotas(e.target.value)} onBlur={salvarDados} rows={4} />
          </div>
        </div>

        <Separator className="my-5" />

        <div>
          <h3 className="mb-3 font-heading text-sm font-bold">Tarefas</h3>
          <div className="flex flex-col gap-2">
            {lead.tarefas.map((tarefa) => {
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
                    onCheckedChange={(checked) => alternarTarefa(tarefa.id, checked === true)}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <p className={cn("text-sm", tarefa.concluida && "text-muted-foreground line-through")}>
                      {tarefa.descricao}
                    </p>
                    {tarefa.dataPrevista && (
                      <p className={cn("mt-0.5 text-xs text-muted-foreground", atrasada && "text-destructive")}>
                        {formatDate(tarefa.dataPrevista)} {atrasada && "· atrasada"}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => excluirTarefa(tarefa.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </div>
              );
            })}
            {lead.tarefas.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhuma tarefa criada ainda.</p>
            )}
          </div>

          <div className="mt-3 flex flex-col gap-2 rounded-lg border border-dashed border-border p-2.5">
            <Input
              placeholder="Ex: Ligar sexta-feira"
              value={novaTarefa}
              onChange={(e) => setNovaTarefa(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && adicionarTarefa()}
            />
            <div className="flex gap-2">
              <Input type="date" value={novaData} onChange={(e) => setNovaData(e.target.value)} className="flex-1" />
              <Button size="sm" onClick={adicionarTarefa}>
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

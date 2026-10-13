"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, MessageCircle, Plus, Trash2, X } from "lucide-react";
import type { LeadComTarefas } from "@/services/workspace.service";
import { atualizarLeadAction, excluirLeadAction } from "@/actions/leads.actions";
import {
  alternarTarefaLeadAction,
  atualizarTarefaLeadAction,
  criarTarefaLeadAction,
  excluirTarefaLeadAction,
} from "@/actions/tarefas-lead.actions";
import { buildWhatsappLink, cn, formatCurrency } from "@/lib/utils";
import { normalizarUrgencia, URGENCIA_PESO, type Urgencia } from "@/lib/urgencia";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { UrgenciaSelect } from "@/components/tarefas/urgencia-select";
import { TarefaLeadItem, type TarefaLeadMinima } from "@/components/tarefas/tarefa-lead-item";
import { EditarTarefaDialog } from "@/components/tarefas/editar-tarefa-dialog";

export function LeadPanel({
  clienteId,
  lead,
  estagioNome,
  onClose,
}: {
  clienteId: string;
  lead: LeadComTarefas | null;
  estagioNome: string;
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
            <PanelContent clienteId={clienteId} lead={lead} estagioNome={estagioNome} onClose={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function PanelContent({
  clienteId,
  lead,
  estagioNome,
  onClose,
}: {
  clienteId: string;
  lead: LeadComTarefas;
  estagioNome: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [nome, setNome] = useState(lead.nome);
  const [contato, setContato] = useState(lead.contato ?? "");
  const [origem, setOrigem] = useState(lead.origem ?? "");
  const [notas, setNotas] = useState(lead.notas ?? "");
  const [valorProposta, setValorProposta] = useState(lead.valorProposta?.toString() ?? "");
  const [novaTarefa, setNovaTarefa] = useState("");
  const [novaData, setNovaData] = useState("");
  const [novaUrgencia, setNovaUrgencia] = useState<Urgencia>("media");
  const [editando, setEditando] = useState<TarefaLeadMinima | null>(null);
  const [concluidasAbertas, setConcluidasAbertas] = useState(false);

  const ehEtapaDeProposta = estagioNome.toLowerCase().includes("proposta");

  useEffect(() => {
    setNome(lead.nome);
    setContato(lead.contato ?? "");
    setOrigem(lead.origem ?? "");
    setNotas(lead.notas ?? "");
    setValorProposta(lead.valorProposta?.toString() ?? "");
  }, [lead.id, lead.nome, lead.contato, lead.origem, lead.notas, lead.valorProposta]);

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
      formData.set("valorProposta", valorProposta);
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
    formData.set("urgencia", novaUrgencia);
    if (novaData) formData.set("dataPrevista", novaData);

    startTransition(async () => {
      await criarTarefaLeadAction(formData);
      setNovaTarefa("");
      setNovaData("");
      setNovaUrgencia("media");
      router.refresh();
    });
  }

  async function salvarEdicaoTarefa(dados: { descricao: string; dataPrevista: string; urgencia: string }) {
    if (!editando) return;
    await atualizarTarefaLeadAction({ tarefaId: editando.id, clienteId, ...dados });
    router.refresh();
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
          {ehEtapaDeProposta && (
            <div className="flex flex-col gap-1.5 rounded-lg border border-primary/30 bg-primary/5 p-3">
              <Label htmlFor="lead-valor-proposta">Valor da proposta enviada (R$)</Label>
              <Input
                id="lead-valor-proposta"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 1500.00"
                value={valorProposta}
                onChange={(e) => setValorProposta(e.target.value)}
                onBlur={salvarDados}
              />
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="lead-notas">Notas</Label>
            <Textarea id="lead-notas" value={notas} onChange={(e) => setNotas(e.target.value)} onBlur={salvarDados} rows={4} />
          </div>
        </div>

        <Separator className="my-5" />

        <div>
          <h3 className="mb-3 font-heading text-sm font-bold">Tarefas</h3>

          {lead.tarefas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma tarefa criada ainda.</p>
          ) : (
            (() => {
              const pendentes = lead.tarefas
                .filter((t) => !t.concluida)
                .sort((a, b) => {
                  const pesoA = URGENCIA_PESO[normalizarUrgencia(a.urgencia)];
                  const pesoB = URGENCIA_PESO[normalizarUrgencia(b.urgencia)];
                  if (pesoA !== pesoB) return pesoA - pesoB;
                  if (!a.dataPrevista) return 1;
                  if (!b.dataPrevista) return -1;
                  return a.dataPrevista.getTime() - b.dataPrevista.getTime();
                });
              const concluidas = lead.tarefas.filter((t) => t.concluida);

              return (
                <div className="flex flex-col gap-4">
                  {pendentes.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Nenhuma tarefa pendente.</p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {pendentes.map((tarefa) => (
                        <TarefaLeadItem
                          key={tarefa.id}
                          tarefa={tarefa}
                          onToggle={alternarTarefa}
                          onEditar={setEditando}
                          onExcluir={excluirTarefa}
                        />
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
                        <ChevronDown
                          className={cn("h-3.5 w-3.5 transition-transform", concluidasAbertas && "rotate-180")}
                        />
                        Concluídas ({concluidas.length})
                      </button>
                      {concluidasAbertas && (
                        <div className="mt-2 flex flex-col gap-2">
                          {concluidas.map((tarefa) => (
                            <TarefaLeadItem
                              key={tarefa.id}
                              tarefa={tarefa}
                              onToggle={alternarTarefa}
                              onEditar={setEditando}
                              onExcluir={excluirTarefa}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()
          )}

          <div className="mt-3 flex flex-col gap-2 rounded-lg border border-dashed border-border p-2.5">
            <Input
              placeholder="Ex: Ligar sexta-feira"
              value={novaTarefa}
              onChange={(e) => setNovaTarefa(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && adicionarTarefa()}
            />
            <div className="flex gap-2">
              <Input type="date" value={novaData} onChange={(e) => setNovaData(e.target.value)} className="flex-1" />
              <UrgenciaSelect value={novaUrgencia} onValueChange={setNovaUrgencia} className="w-32" />
              <Button size="sm" onClick={adicionarTarefa}>
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <EditarTarefaDialog
        tarefa={editando}
        open={!!editando}
        onOpenChange={(open) => !open && setEditando(null)}
        onSalvar={salvarEdicaoTarefa}
      />
    </div>
  );
}

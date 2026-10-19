"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Facebook, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  atualizarMetaAdsAction,
  conectarMetaAdsAction,
  desconectarMetaAdsAction,
  type ConectarMetaAdsState,
} from "@/actions/integracao-meta.actions";
import { cn, formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Estagio = { id: string; nome: string; funilNome: string };

type Integracao = {
  pageId: string;
  nomePagina: string | null;
  ativo: boolean;
  estagioDestinoId: string;
  ultimoLeadEm: Date | null;
} | null;

function InstrucoesMeta() {
  const [aberto, setAberto] = useState(false);
  const [origem, setOrigem] = useState("");

  useEffect(() => {
    setOrigem(window.location.origin);
  }, []);

  return (
    <div className="rounded-lg border border-dashed border-border">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        Como pegar o Page ID e o token no Meta Business Suite
        <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform", aberto && "rotate-180")} />
      </button>
      {aberto && (
        <div className="flex flex-col gap-3 border-t border-border px-3 py-3 text-xs text-muted-foreground">
          <div>
            <p className="font-medium text-foreground">1. Webhook (configurado uma única vez pelo App da Meta)</p>
            <p className="mt-1">
              URL:{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-foreground">{origem}/api/webhooks/meta/leads</code>
              {" · "}Campo: <code className="rounded bg-muted px-1 py-0.5 text-foreground">leadgen</code>
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">2. Page ID</p>
            <p className="mt-1">
              Na página do Facebook do cliente → Configurações → Geral, ou em business.facebook.com,
              abrindo a página em Configurações da Página.
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">3. Page Access Token</p>
            <p className="mt-1">
              Meta Business Suite → Configurações do negócio → Usuários do sistema (ou Graph API Explorer com
              o App conectado) → gerar um token de longa duração para essa Página, com as permissões{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-foreground">pages_show_list</code>,{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-foreground">pages_manage_ads</code> e{" "}
              <code className="rounded bg-muted px-1 py-0.5 text-foreground">leads_retrieval</code>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

const initialState: ConectarMetaAdsState = {};

export function ClienteMetaAdsCard({
  clienteId,
  estagios,
  integracao,
}: {
  clienteId: string;
  estagios: Estagio[];
  integracao: Integracao;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [state, formAction, pending] = useActionState(conectarMetaAdsAction, initialState);
  const [tocado, setTocado] = useState(false);

  useEffect(() => {
    if (!tocado) return;
    if (state.sucesso) toast.success("Meta Ads conectado — os próximos leads do anúncio já caem direto no funil.");
    if (state.erro) toast.error(state.erro);
  }, [state, tocado]);

  function salvarAjuste(formData: FormData) {
    startTransition(async () => {
      await atualizarMetaAdsAction(formData);
      router.refresh();
      toast.success("Configuração salva.");
    });
  }

  function desconectar() {
    if (!confirm("Desconectar o Meta Ads desse cliente? Novos leads do anúncio vão parar de cair automaticamente.")) {
      return;
    }
    startTransition(async () => {
      await desconectarMetaAdsAction({ clienteId });
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Facebook className="h-4 w-4 text-primary" />
          Meta Ads (Facebook/Instagram)
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
        {integracao ? (
          <>
            <div className="flex items-center justify-between gap-2 rounded-lg border border-border p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{integracao.nomePagina ?? integracao.pageId}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {integracao.ultimoLeadEm
                    ? `Último lead recebido em ${formatDate(integracao.ultimoLeadEm)}`
                    : "Nenhum lead recebido ainda por aqui."}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={desconectar} title="Desconectar">
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>

            <form action={salvarAjuste} className="flex flex-col gap-3">
              <input type="hidden" name="clienteId" value={clienteId} />
              <div className="flex flex-col gap-1.5">
                <Label>Leads novos caem em</Label>
                <Select name="estagioDestinoId" defaultValue={integracao.estagioDestinoId}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {estagios.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.funilNome} · {e.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox name="ativo" defaultChecked={integracao.ativo} />
                Integração ativa
              </label>
              <Button type="submit" variant="secondary" className="self-end">
                Salvar
              </Button>
            </form>
          </>
        ) : (
          <form action={formAction} onSubmit={() => setTocado(true)} className="flex flex-col gap-3">
            <input type="hidden" name="clienteId" value={clienteId} />
            <p className="text-sm text-muted-foreground">
              Conecte a Página do anúncio desse cliente pra leads de formulário caírem direto no Kanban.
            </p>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pageId">Page ID</Label>
              <Input id="pageId" name="pageId" placeholder="Ex: 102938475601234" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="pageAccessToken">Page Access Token</Label>
              <Input id="pageAccessToken" name="pageAccessToken" type="password" placeholder="EAAG..." required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Leads novos caem em</Label>
              <Select name="estagioDestinoId" defaultValue={estagios[0]?.id}>
                <SelectTrigger>
                  <SelectValue placeholder="Escolha o estágio" />
                </SelectTrigger>
                <SelectContent>
                  {estagios.map((e) => (
                    <SelectItem key={e.id} value={e.id}>
                      {e.funilNome} · {e.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <InstrucoesMeta />
            <Button type="submit" disabled={pending} className="self-end">
              {pending ? "Validando..." : "Conectar"}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

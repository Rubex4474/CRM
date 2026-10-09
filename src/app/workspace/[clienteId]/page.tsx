import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { getDashboardDoWorkspace } from "@/services/workspace.service";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeadsPorEstagioChart } from "@/components/charts/leads-por-estagio-chart";
import { NovosLeadsChart } from "@/components/charts/novos-leads-chart";
import { LeadsPorOrigemChart } from "@/components/charts/leads-por-origem-chart";

export default async function WorkspaceDashboardPage({
  params,
}: {
  params: Promise<{ clienteId: string }>;
}) {
  const { clienteId } = await params;
  const dados = await getDashboardDoWorkspace(clienteId);

  return (
    <div className="h-full overflow-y-auto px-6 py-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 pb-10">
        <div>
          <h1 className="font-heading text-xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Visão geral dos seus leads, propostas e tarefas.
          </p>
        </div>

        <div className="grid grid-cols-2 divide-x divide-y divide-border overflow-hidden rounded-lg border border-border sm:grid-cols-4 sm:divide-y-0">
          <div className="px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Total de leads</p>
            <p className="mt-1.5 font-heading text-2xl font-bold tabular-nums leading-none">{dados.totalLeads}</p>
          </div>
          <div className="px-5 py-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Em propostas</p>
            <p className="mt-1.5 font-heading text-2xl font-bold tabular-nums leading-none">
              {formatCurrency(dados.valorEmPropostas)}
            </p>
          </div>
          <div className="px-5 py-4">
            <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-destructive">
              <AlertTriangle className="h-3 w-3" />
              Atrasadas
            </p>
            <p className="mt-1.5 font-heading text-2xl font-bold tabular-nums leading-none">
              {dados.tarefasAtrasadas}
            </p>
          </div>
          <div className="px-5 py-4">
            <p className="flex items-center gap-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              <CheckCircle2 className="h-3 w-3" />
              No prazo
            </p>
            <p className="mt-1.5 font-heading text-2xl font-bold tabular-nums leading-none">
              {dados.tarefasNoPrazo}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Leads por etapa</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <LeadsPorEstagioChart dados={dados.leadsPorEstagio} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Leads por origem</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <LeadsPorOrigemChart dados={dados.leadsPorOrigem} />
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Novos leads (últimos 14 dias)</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <NovosLeadsChart dados={dados.novosLeadsPorDia} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

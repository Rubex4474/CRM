import { AlertTriangle, CheckCircle2, Users, Wallet } from "lucide-react";
import { getDashboardDoWorkspace } from "@/services/workspace.service";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/dashboard/stat-tile";
import { HorizontalBarChart } from "@/components/charts/horizontal-bar-chart";
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
          <StatTile icon={Users} label="Total de leads" value={dados.totalLeads} accent="#22D3EE" />
          <StatTile icon={Wallet} label="Em propostas" value={formatCurrency(dados.valorEmPropostas)} accent="#34D399" />
          <StatTile icon={AlertTriangle} label="Atrasadas" value={dados.tarefasAtrasadas} accent="#FB7185" />
          <StatTile icon={CheckCircle2} label="No prazo" value={dados.tarefasNoPrazo} accent="#A78BFA" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Novos leads (últimos 14 dias)</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <NovosLeadsChart dados={dados.novosLeadsPorDia} />
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Leads por etapa</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <HorizontalBarChart
                dados={dados.leadsPorEstagio.map((e) => ({ nome: e.nome, valor: e.quantidade }))}
              />
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
        </div>
      </div>
    </div>
  );
}

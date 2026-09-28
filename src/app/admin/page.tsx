import Link from "next/link";
import { AlertTriangle, ArrowRight, Calendar, FileCheck, Users, Wallet } from "lucide-react";
import { getResumoClientes, getResumoFinanceiro } from "@/services/dashboard.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [clientes, financeiro] = await Promise.all([getResumoClientes(), getResumoFinanceiro()]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visão geral de todos os clientes da agência.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Contratos ativos</p>
              <p className="font-heading text-2xl font-bold leading-tight">{financeiro.contratosAtivos}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Receita mensal (contratos ativos)</p>
              <p className="font-heading text-2xl font-bold leading-tight">
                {formatCurrency(financeiro.receitaMensal)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Próximos pagamentos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 pt-0">
          {financeiro.proximosPagamentos.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum vencimento configurado ainda.</p>
          )}
          {financeiro.proximosPagamentos.slice(0, 5).map((pagamento) => (
            <div
              key={pagamento.clienteId}
              className="flex items-center justify-between border-b border-border py-2 text-sm last:border-0"
            >
              <span className="font-medium">{pagamento.nome}</span>
              <span className="flex shrink-0 items-center gap-3 text-muted-foreground">
                {formatDate(pagamento.data)}
                {pagamento.valor != null && (
                  <span className="w-24 text-right font-medium text-foreground">
                    {formatCurrency(pagamento.valor)}
                  </span>
                )}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {clientes.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Nenhum cliente cadastrado ainda.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clientes.map((cliente) => (
            <Card key={cliente.id} className="flex flex-col justify-between">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-heading text-lg font-bold leading-tight">{cliente.nome}</h2>
                  {cliente.tarefasAtrasadas > 0 && (
                    <Badge variant="destructive">
                      <AlertTriangle className="h-3 w-3" />
                      {cliente.tarefasAtrasadas} atrasada{cliente.tarefasAtrasadas > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {cliente.totalLeads} lead{cliente.totalLeads === 1 ? "" : "s"}
                </div>
                <Button asChild className="mt-5 w-full">
                  <Link href={`/workspace/${cliente.id}`}>
                    Entrar no workspace
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

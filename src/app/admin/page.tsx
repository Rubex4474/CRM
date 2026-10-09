import Link from "next/link";
import { AlertTriangle, ArrowUpRight } from "lucide-react";
import { getResumoClientes, getResumoFinanceiro } from "@/services/dashboard.service";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [clientes, financeiro] = await Promise.all([getResumoClientes(), getResumoFinanceiro()]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visão geral de todos os clientes da agência.
        </p>
      </div>

      <div className="grid grid-cols-1 divide-y divide-border overflow-hidden rounded-lg border border-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <div className="px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Contratos ativos
          </p>
          <p className="mt-1.5 font-heading text-3xl font-bold tabular-nums leading-none">
            {financeiro.contratosAtivos}
          </p>
        </div>
        <div className="px-5 py-4">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Receita mensal recorrente
          </p>
          <p className="mt-1.5 font-heading text-3xl font-bold tabular-nums leading-none">
            {formatCurrency(financeiro.receitaMensal)}
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Próximos pagamentos
        </h2>
        {financeiro.proximosPagamentos.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum vencimento configurado ainda.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border">
            {financeiro.proximosPagamentos.slice(0, 5).map((pagamento, i) => (
              <div
                key={pagamento.clienteId}
                className={`flex items-center justify-between px-4 py-3 text-sm ${i > 0 ? "border-t border-border" : ""}`}
              >
                <span className="font-medium">{pagamento.nome}</span>
                <span className="flex shrink-0 items-center gap-4">
                  <span className="text-muted-foreground">{formatDate(pagamento.data)}</span>
                  {pagamento.valor != null && (
                    <span className="w-24 text-right font-medium tabular-nums">
                      {formatCurrency(pagamento.valor)}
                    </span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Clientes
        </h2>
        {clientes.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              Nenhum cliente cadastrado ainda.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {clientes.map((cliente) => (
              <Link key={cliente.id} href={`/workspace/${cliente.id}`} className="group">
                <Card className="h-full transition-colors group-hover:border-primary/40">
                  <CardContent className="flex h-full flex-col justify-between pt-5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-heading text-base font-bold leading-tight">{cliente.nome}</h3>
                      <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {cliente.totalLeads} lead{cliente.totalLeads === 1 ? "" : "s"}
                      </span>
                      {cliente.tarefasAtrasadas > 0 && (
                        <span className="flex items-center gap-1 font-medium text-destructive">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          {cliente.tarefasAtrasadas} atrasada{cliente.tarefasAtrasadas > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

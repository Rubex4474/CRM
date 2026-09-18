import Link from "next/link";
import { AlertTriangle, ArrowRight, Users } from "lucide-react";
import { getResumoClientes } from "@/services/dashboard.service";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default async function AdminDashboardPage() {
  const clientes = await getResumoClientes();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visão geral de todos os clientes da agência.
        </p>
      </div>

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

import Link from "next/link";
import { Users, ArrowRight } from "lucide-react";
import { getClientesGerenciados } from "@/services/clientes.service";
import { Card, CardContent } from "@/components/ui/card";
import { NovoClienteButton } from "@/components/clientes/novo-cliente-button";

export default async function ClientesPage() {
  const clientes = await getClientesGerenciados();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Clientes</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastre novos clientes e gerencie os que você já tem.
          </p>
        </div>
        <NovoClienteButton />
      </div>

      {clientes.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Nenhum cliente cadastrado ainda. Clique em &quot;Novo cliente&quot; para começar.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clientes.map((cliente) => (
            <Link key={cliente.id} href={`/admin/clientes/${cliente.id}`}>
              <Card className="h-full transition-colors hover:border-primary/40">
                <CardContent className="flex h-full flex-col justify-between pt-6">
                  <div>
                    <h2 className="font-heading text-lg font-bold leading-tight">{cliente.nome}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {cliente.usuarios[0]?.email ?? "Sem login configurado"}
                    </p>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      {cliente.leads.length} lead{cliente.leads.length === 1 ? "" : "s"}
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

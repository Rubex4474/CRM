import { notFound } from "next/navigation";
import { Users } from "lucide-react";
import { getClienteDetalhe } from "@/services/clientes.service";
import { ClienteHeader } from "@/components/clientes/cliente-header";
import { ClienteLoginCard } from "@/components/clientes/cliente-login-card";
import { ClienteContratoCard } from "@/components/clientes/cliente-contrato-card";
import { ClienteLogoCard } from "@/components/clientes/cliente-logo-card";
import { ClienteTarefas } from "@/components/clientes/cliente-tarefas";
import { NotasPanel } from "@/components/notas/notas-panel";
import { Badge } from "@/components/ui/badge";

export default async function ClienteDetalhePage({
  params,
}: {
  params: Promise<{ clienteId: string }>;
}) {
  const { clienteId } = await params;
  const cliente = await getClienteDetalhe(clienteId);
  if (!cliente || cliente.ehAgencia) notFound();

  const usuario = cliente.usuarios[0];

  return (
    <div className="flex flex-col gap-6">
      <ClienteHeader clienteId={cliente.id} nome={cliente.nome} />
      <Badge variant="secondary" className="w-fit">
        <Users className="h-3 w-3" />
        {cliente.leads.length} lead{cliente.leads.length === 1 ? "" : "s"}
      </Badge>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <ClienteLogoCard clienteId={cliente.id} nome={cliente.nome} logoUrl={cliente.logoUrl} />
          <ClienteContratoCard
            clienteId={cliente.id}
            valorContrato={cliente.valorContrato}
            diaVencimento={cliente.diaVencimento}
            inicioContrato={cliente.inicioContrato}
            fimContrato={cliente.fimContrato}
            obsContrato={cliente.obsContrato}
          />
          <ClienteLoginCard clienteId={cliente.id} usuarioId={usuario?.id} email={usuario?.email} />
          <ClienteTarefas clienteId={cliente.id} tarefas={cliente.tarefas} />
        </div>
        <div>
          <h2 className="mb-3 font-heading text-sm font-bold text-muted-foreground">
            Notas (escreva o que já foi feito com este cliente)
          </h2>
          <NotasPanel cliente={cliente} />
        </div>
      </div>
    </div>
  );
}

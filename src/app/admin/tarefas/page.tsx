import { getTarefasAgencia } from "@/services/tarefas-agencia.service";
import { TarefasBoard } from "@/components/tarefas/tarefas-board";

export default async function TarefasAgenciaPage() {
  const clientes = await getTarefasAgencia();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Tarefas da agência</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Suas tarefas internas, organizadas por cliente.
        </p>
      </div>
      <TarefasBoard clientes={clientes} />
    </div>
  );
}

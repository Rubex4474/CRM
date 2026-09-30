import { getTarefasDoWorkspace } from "@/services/workspace.service";
import { WorkspaceTarefasList } from "@/components/kanban/workspace-tarefas-list";

export default async function WorkspaceTarefasPage({
  params,
}: {
  params: Promise<{ clienteId: string }>;
}) {
  const { clienteId } = await params;
  const tarefas = await getTarefasDoWorkspace(clienteId);

  return (
    <div className="h-full overflow-y-auto px-6 py-6">
      <div className="mx-auto flex max-w-2xl flex-col gap-1 pb-4">
        <h1 className="font-heading text-xl font-bold tracking-tight">Tarefas</h1>
        <p className="text-sm text-muted-foreground">
          Todas as tarefas de todos os leads, num só lugar — o que está atrasado precisa de atenção primeiro.
        </p>
      </div>
      <div className="mx-auto max-w-2xl">
        <WorkspaceTarefasList clienteId={clienteId} tarefas={tarefas} />
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import { getWorkspaceData } from "@/services/workspace.service";
import { KanbanBoard } from "@/components/kanban/kanban-board";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ clienteId: string }>;
}) {
  const { clienteId } = await params;
  const data = await getWorkspaceData(clienteId);
  if (!data || !data.funil) notFound();

  return (
    <KanbanBoard clienteId={clienteId} funilId={data.funil.id} estagios={data.funil.estagios} />
  );
}

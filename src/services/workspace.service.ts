import { prisma } from "@/lib/prisma";

export async function getWorkspaceData(clienteId: string) {
  const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
  if (!cliente) return null;

  const funil = await prisma.funil.findFirst({
    where: { clienteId },
    include: {
      estagios: {
        orderBy: { ordem: "asc" },
        include: {
          leads: {
            orderBy: { ordem: "asc" },
            include: { tarefas: { orderBy: { dataPrevista: "asc" } } },
          },
        },
      },
    },
  });

  return { cliente, funil };
}

export type WorkspaceData = NonNullable<Awaited<ReturnType<typeof getWorkspaceData>>>;
export type EstagioComLeads = NonNullable<WorkspaceData["funil"]>["estagios"][number];
export type LeadComTarefas = EstagioComLeads["leads"][number];

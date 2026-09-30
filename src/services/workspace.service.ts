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

/** Todas as tarefas de todos os leads deste cliente, para a aba "Tarefas" consolidada. */
export async function getTarefasDoWorkspace(clienteId: string) {
  return prisma.tarefaLead.findMany({
    where: { lead: { clienteId } },
    include: { lead: { select: { id: true, nome: true, estagio: { select: { nome: true } } } } },
    orderBy: [{ concluida: "asc" }, { dataPrevista: "asc" }],
  });
}

export type TarefaDoWorkspace = Awaited<ReturnType<typeof getTarefasDoWorkspace>>[number];

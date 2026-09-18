import { prisma } from "@/lib/prisma";

export type ClienteResumo = {
  id: string;
  nome: string;
  totalLeads: number;
  tarefasAtrasadas: number;
};

export async function getResumoClientes(): Promise<ClienteResumo[]> {
  const clientes = await prisma.cliente.findMany({
    where: { ehAgencia: false },
    orderBy: { nome: "asc" },
    include: {
      leads: { select: { id: true } },
      tarefas: { select: { concluida: true, dataPrevista: true } },
    },
  });

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const resumos: ClienteResumo[] = [];
  for (const cliente of clientes) {
    const tarefasLead = await prisma.tarefaLead.count({
      where: {
        concluida: false,
        dataPrevista: { lt: hoje },
        lead: { clienteId: cliente.id },
      },
    });

    const tarefasAgenciaAtrasadas = cliente.tarefas.filter(
      (tarefa) => !tarefa.concluida && tarefa.dataPrevista && tarefa.dataPrevista < hoje,
    ).length;

    resumos.push({
      id: cliente.id,
      nome: cliente.nome,
      totalLeads: cliente.leads.length,
      tarefasAtrasadas: tarefasAgenciaAtrasadas + tarefasLead,
    });
  }

  return resumos;
}

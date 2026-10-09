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

export type DashboardDoWorkspace = {
  totalLeads: number;
  valorEmPropostas: number;
  tarefasAtrasadas: number;
  tarefasNoPrazo: number;
  leadsPorEstagio: { nome: string; quantidade: number }[];
  leadsPorOrigem: { nome: string; quantidade: number }[];
  novosLeadsPorDia: { data: string; quantidade: number }[];
};

/** Dados agregados pra aba Dashboard do workspace — leads, valores e funil deste cliente. */
export async function getDashboardDoWorkspace(clienteId: string): Promise<DashboardDoWorkspace> {
  const [funil, leads] = await Promise.all([
    prisma.funil.findFirst({
      where: { clienteId },
      include: { estagios: { orderBy: { ordem: "asc" }, include: { _count: { select: { leads: true } } } } },
    }),
    prisma.lead.findMany({
      where: { clienteId },
      select: { origem: true, valorProposta: true, criadoEm: true },
    }),
  ]);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const [tarefasAtrasadas, tarefasNoPrazo] = await Promise.all([
    prisma.tarefaLead.count({
      where: { concluida: false, dataPrevista: { lt: hoje }, lead: { clienteId } },
    }),
    prisma.tarefaLead.count({
      where: {
        concluida: false,
        lead: { clienteId },
        OR: [{ dataPrevista: null }, { dataPrevista: { gte: hoje } }],
      },
    }),
  ]);

  const leadsPorEstagio = (funil?.estagios ?? []).map((e) => ({ nome: e.nome, quantidade: e._count.leads }));

  const origemMap = new Map<string, number>();
  for (const lead of leads) {
    const chave = lead.origem?.trim() || "Não informado";
    origemMap.set(chave, (origemMap.get(chave) ?? 0) + 1);
  }
  const leadsPorOrigem = Array.from(origemMap, ([nome, quantidade]) => ({ nome, quantidade })).sort(
    (a, b) => b.quantidade - a.quantidade,
  );

  // Últimos 14 dias, incluindo dias sem lead algum (fica zero) pra o gráfico não "pular".
  const dias: { data: string; quantidade: number }[] = [];
  const porDia = new Map<string, number>();
  for (const lead of leads) {
    const chave = lead.criadoEm.toISOString().slice(0, 10);
    porDia.set(chave, (porDia.get(chave) ?? 0) + 1);
  }
  for (let i = 13; i >= 0; i--) {
    const d = new Date(hoje);
    d.setDate(d.getDate() - i);
    const chave = d.toISOString().slice(0, 10);
    dias.push({ data: chave, quantidade: porDia.get(chave) ?? 0 });
  }

  return {
    totalLeads: leads.length,
    valorEmPropostas: leads.reduce((soma, l) => soma + (l.valorProposta ?? 0), 0),
    tarefasAtrasadas,
    tarefasNoPrazo,
    leadsPorEstagio,
    leadsPorOrigem,
    novosLeadsPorDia: dias,
  };
}

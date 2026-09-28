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

export type ProximoPagamento = {
  clienteId: string;
  nome: string;
  valor: number | null;
  data: Date;
};

export type ResumoFinanceiro = {
  contratosAtivos: number;
  receitaMensal: number;
  proximosPagamentos: ProximoPagamento[];
};

/** Próxima ocorrência do dia de vencimento a partir de hoje (ajusta pra meses mais curtos, ex: dia 31 em fevereiro). */
function proximaDataVencimento(dia: number, hoje: Date): Date {
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  const diaAtual = hoje.getDate();

  let mesAlvo = mes;
  let anoAlvo = ano;
  if (diaAtual > dia) {
    mesAlvo += 1;
    if (mesAlvo > 11) {
      mesAlvo = 0;
      anoAlvo += 1;
    }
  }
  const ultimoDiaDoMes = new Date(anoAlvo, mesAlvo + 1, 0).getDate();
  return new Date(anoAlvo, mesAlvo, Math.min(dia, ultimoDiaDoMes));
}

export async function getResumoFinanceiro(): Promise<ResumoFinanceiro> {
  const clientes = await prisma.cliente.findMany({
    where: { ehAgencia: false },
    select: { id: true, nome: true, valorContrato: true, diaVencimento: true, fimContrato: true },
  });

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // Contrato "ativo" = tem valor configurado e, se tiver data de fim, ela ainda não passou.
  const ativos = clientes.filter((c) => c.valorContrato != null && (!c.fimContrato || c.fimContrato >= hoje));

  const receitaMensal = ativos.reduce((soma, c) => soma + (c.valorContrato ?? 0), 0);

  const proximosPagamentos: ProximoPagamento[] = ativos
    .filter((c) => c.diaVencimento != null)
    .map((c) => ({
      clienteId: c.id,
      nome: c.nome,
      valor: c.valorContrato,
      data: proximaDataVencimento(c.diaVencimento!, hoje),
    }))
    .sort((a, b) => a.data.getTime() - b.data.getTime());

  return { contratosAtivos: ativos.length, receitaMensal, proximosPagamentos };
}

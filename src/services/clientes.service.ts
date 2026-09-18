import { prisma } from "@/lib/prisma";

export async function getClientesGerenciados() {
  const clientes = await prisma.cliente.findMany({
    where: { ehAgencia: false },
    orderBy: { nome: "asc" },
    include: {
      usuarios: { select: { email: true } },
      leads: { select: { id: true } },
    },
  });

  return clientes;
}

export type ClienteGerenciado = Awaited<ReturnType<typeof getClientesGerenciados>>[number];

export async function getClienteDetalhe(clienteId: string) {
  const cliente = await prisma.cliente.findUnique({
    where: { id: clienteId },
    include: {
      usuarios: true,
      leads: { select: { id: true } },
      notas: { orderBy: { criadoEm: "desc" } },
      tarefas: { orderBy: [{ concluida: "asc" }, { dataPrevista: "asc" }] },
    },
  });

  return cliente;
}

export type ClienteDetalhe = NonNullable<Awaited<ReturnType<typeof getClienteDetalhe>>>;

export async function getAgenciaClienteId(): Promise<string | null> {
  const cliente = await prisma.cliente.findFirst({ where: { ehAgencia: true } });
  return cliente?.id ?? null;
}

import { prisma } from "@/lib/prisma";

export async function getTarefasAgencia() {
  const clientes = await prisma.cliente.findMany({
    orderBy: { nome: "asc" },
    include: {
      tarefas: { orderBy: [{ concluida: "asc" }, { dataPrevista: "asc" }] },
    },
  });

  return clientes;
}

export type ClienteComTarefas = Awaited<ReturnType<typeof getTarefasAgencia>>[number];

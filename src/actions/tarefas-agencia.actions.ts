"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const criarTarefaAgenciaSchema = z.object({
  clienteId: z.string().min(1),
  descricao: z.string().min(1, "Informe a tarefa."),
  dataPrevista: z.string().optional(),
});

export async function criarTarefaAgenciaAction(formData: FormData) {
  await requireAdmin();

  const parsed = criarTarefaAgenciaSchema.parse({
    clienteId: formData.get("clienteId"),
    descricao: formData.get("descricao"),
    dataPrevista: formData.get("dataPrevista") || undefined,
  });

  await prisma.tarefaAgencia.create({
    data: {
      clienteId: parsed.clienteId,
      descricao: parsed.descricao,
      dataPrevista: parsed.dataPrevista ? new Date(parsed.dataPrevista) : null,
    },
  });

  revalidatePath("/admin/tarefas");
}

export async function alternarTarefaAgenciaAction(input: { tarefaId: string; concluida: boolean }) {
  await requireAdmin();
  await prisma.tarefaAgencia.update({
    where: { id: input.tarefaId },
    data: { concluida: input.concluida },
  });
  revalidatePath("/admin/tarefas");
}

export async function excluirTarefaAgenciaAction(input: { tarefaId: string }) {
  await requireAdmin();
  await prisma.tarefaAgencia.delete({ where: { id: input.tarefaId } });
  revalidatePath("/admin/tarefas");
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { URGENCIA_VALUES } from "@/lib/urgencia";

const urgenciaSchema = z.enum(URGENCIA_VALUES);

const criarTarefaAgenciaSchema = z.object({
  clienteId: z.string().min(1),
  descricao: z.string().min(1, "Informe a tarefa."),
  dataPrevista: z.string().optional(),
  urgencia: urgenciaSchema.optional(),
});

export async function criarTarefaAgenciaAction(formData: FormData) {
  await requireAdmin();

  const parsed = criarTarefaAgenciaSchema.parse({
    clienteId: formData.get("clienteId"),
    descricao: formData.get("descricao"),
    dataPrevista: formData.get("dataPrevista") || undefined,
    urgencia: formData.get("urgencia") || undefined,
  });

  await prisma.tarefaAgencia.create({
    data: {
      clienteId: parsed.clienteId,
      descricao: parsed.descricao,
      dataPrevista: parsed.dataPrevista ? new Date(parsed.dataPrevista) : null,
      urgencia: parsed.urgencia ?? "media",
    },
  });

  revalidatePath("/admin/tarefas");
}

const atualizarTarefaAgenciaSchema = z.object({
  tarefaId: z.string().min(1),
  descricao: z.string().min(1, "Informe a tarefa."),
  dataPrevista: z.string().optional(),
  urgencia: urgenciaSchema,
});

export async function atualizarTarefaAgenciaAction(input: {
  tarefaId: string;
  descricao: string;
  dataPrevista: string;
  urgencia: string;
}) {
  await requireAdmin();

  const parsed = atualizarTarefaAgenciaSchema.parse(input);

  await prisma.tarefaAgencia.update({
    where: { id: parsed.tarefaId },
    data: {
      descricao: parsed.descricao,
      dataPrevista: parsed.dataPrevista ? new Date(parsed.dataPrevista) : null,
      urgencia: parsed.urgencia,
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

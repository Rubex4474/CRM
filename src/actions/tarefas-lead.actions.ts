"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAcessoCliente } from "@/lib/auth";

const criarTarefaLeadSchema = z.object({
  clienteId: z.string().min(1),
  leadId: z.string().min(1),
  descricao: z.string().min(1, "Informe a tarefa."),
  dataPrevista: z.string().optional(),
});

export async function criarTarefaLeadAction(formData: FormData) {
  const parsed = criarTarefaLeadSchema.parse({
    clienteId: formData.get("clienteId"),
    leadId: formData.get("leadId"),
    descricao: formData.get("descricao"),
    dataPrevista: formData.get("dataPrevista") || undefined,
  });

  await requireAcessoCliente(parsed.clienteId);

  await prisma.tarefaLead.create({
    data: {
      leadId: parsed.leadId,
      descricao: parsed.descricao,
      dataPrevista: parsed.dataPrevista ? new Date(parsed.dataPrevista) : null,
    },
  });

  revalidatePath(`/workspace/${parsed.clienteId}`);
}

export async function alternarTarefaLeadAction(input: {
  clienteId: string;
  tarefaId: string;
  concluida: boolean;
}) {
  await requireAcessoCliente(input.clienteId);
  await prisma.tarefaLead.update({
    where: { id: input.tarefaId },
    data: { concluida: input.concluida },
  });
  revalidatePath(`/workspace/${input.clienteId}`);
}

export async function excluirTarefaLeadAction(input: { clienteId: string; tarefaId: string }) {
  await requireAcessoCliente(input.clienteId);
  await prisma.tarefaLead.delete({ where: { id: input.tarefaId } });
  revalidatePath(`/workspace/${input.clienteId}`);
}

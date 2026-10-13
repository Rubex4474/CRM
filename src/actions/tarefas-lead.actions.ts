"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAcessoCliente } from "@/lib/auth";
import { URGENCIA_VALUES } from "@/lib/urgencia";

const urgenciaSchema = z.enum(URGENCIA_VALUES);

const criarTarefaLeadSchema = z.object({
  clienteId: z.string().min(1),
  leadId: z.string().min(1),
  descricao: z.string().min(1, "Informe a tarefa."),
  dataPrevista: z.string().optional(),
  urgencia: urgenciaSchema.optional(),
});

export async function criarTarefaLeadAction(formData: FormData) {
  const parsed = criarTarefaLeadSchema.parse({
    clienteId: formData.get("clienteId"),
    leadId: formData.get("leadId"),
    descricao: formData.get("descricao"),
    dataPrevista: formData.get("dataPrevista") || undefined,
    urgencia: formData.get("urgencia") || undefined,
  });

  await requireAcessoCliente(parsed.clienteId);

  await prisma.tarefaLead.create({
    data: {
      leadId: parsed.leadId,
      descricao: parsed.descricao,
      dataPrevista: parsed.dataPrevista ? new Date(parsed.dataPrevista) : null,
      urgencia: parsed.urgencia ?? "media",
    },
  });

  revalidatePath(`/workspace/${parsed.clienteId}`);
}

const atualizarTarefaLeadSchema = z.object({
  tarefaId: z.string().min(1),
  clienteId: z.string().min(1),
  descricao: z.string().min(1, "Informe a tarefa."),
  dataPrevista: z.string().optional(),
  urgencia: urgenciaSchema,
});

export async function atualizarTarefaLeadAction(input: {
  tarefaId: string;
  clienteId: string;
  descricao: string;
  dataPrevista: string;
  urgencia: string;
}) {
  const parsed = atualizarTarefaLeadSchema.parse(input);
  await requireAcessoCliente(parsed.clienteId);

  await prisma.tarefaLead.update({
    where: { id: parsed.tarefaId },
    data: {
      descricao: parsed.descricao,
      dataPrevista: parsed.dataPrevista ? new Date(parsed.dataPrevista) : null,
      urgencia: parsed.urgencia,
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

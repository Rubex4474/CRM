"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAcessoCliente } from "@/lib/auth";

const criarLeadSchema = z.object({
  clienteId: z.string().min(1),
  estagioId: z.string().min(1),
  nome: z.string().min(1, "Informe o nome do lead."),
  contato: z.string().optional(),
  origem: z.string().optional(),
  notas: z.string().optional(),
});

export async function criarLeadAction(formData: FormData) {
  const parsed = criarLeadSchema.parse({
    clienteId: formData.get("clienteId"),
    estagioId: formData.get("estagioId"),
    nome: formData.get("nome"),
    contato: formData.get("contato") || undefined,
    origem: formData.get("origem") || undefined,
    notas: formData.get("notas") || undefined,
  });

  await requireAcessoCliente(parsed.clienteId);

  const ultimo = await prisma.lead.findFirst({
    where: { estagioId: parsed.estagioId },
    orderBy: { ordem: "desc" },
  });

  await prisma.lead.create({
    data: {
      clienteId: parsed.clienteId,
      estagioId: parsed.estagioId,
      nome: parsed.nome,
      contato: parsed.contato,
      origem: parsed.origem,
      notas: parsed.notas,
      ordem: (ultimo?.ordem ?? -1) + 1,
    },
  });

  revalidatePath(`/workspace/${parsed.clienteId}`);
}

const atualizarLeadSchema = z.object({
  leadId: z.string().min(1),
  clienteId: z.string().min(1),
  nome: z.string().min(1, "Informe o nome do lead."),
  contato: z.string().optional(),
  origem: z.string().optional(),
  notas: z.string().optional(),
});

export async function atualizarLeadAction(formData: FormData) {
  const parsed = atualizarLeadSchema.parse({
    leadId: formData.get("leadId"),
    clienteId: formData.get("clienteId"),
    nome: formData.get("nome"),
    contato: formData.get("contato") || undefined,
    origem: formData.get("origem") || undefined,
    notas: formData.get("notas") || undefined,
  });

  await requireAcessoCliente(parsed.clienteId);

  await prisma.lead.update({
    where: { id: parsed.leadId },
    data: {
      nome: parsed.nome,
      contato: parsed.contato,
      origem: parsed.origem,
      notas: parsed.notas,
    },
  });

  revalidatePath(`/workspace/${parsed.clienteId}`);
}

export async function moverLeadAction(input: {
  clienteId: string;
  leadId: string;
  estagioId: string;
  ordem: number;
}) {
  await requireAcessoCliente(input.clienteId);

  await prisma.lead.update({
    where: { id: input.leadId },
    data: { estagioId: input.estagioId, ordem: input.ordem },
  });

  revalidatePath(`/workspace/${input.clienteId}`);
}

export async function excluirLeadAction(input: { clienteId: string; leadId: string }) {
  await requireAcessoCliente(input.clienteId);
  await prisma.lead.delete({ where: { id: input.leadId } });
  revalidatePath(`/workspace/${input.clienteId}`);
}

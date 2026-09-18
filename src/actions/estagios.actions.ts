"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAcessoCliente } from "@/lib/auth";

const criarEstagioSchema = z.object({
  clienteId: z.string().min(1),
  funilId: z.string().min(1),
  nome: z.string().min(1, "Informe o nome da coluna."),
});

export async function criarEstagioAction(formData: FormData) {
  const parsed = criarEstagioSchema.parse({
    clienteId: formData.get("clienteId"),
    funilId: formData.get("funilId"),
    nome: formData.get("nome"),
  });

  await requireAcessoCliente(parsed.clienteId);

  const ultimo = await prisma.estagio.findFirst({
    where: { funilId: parsed.funilId },
    orderBy: { ordem: "desc" },
  });

  await prisma.estagio.create({
    data: { funilId: parsed.funilId, nome: parsed.nome, ordem: (ultimo?.ordem ?? -1) + 1 },
  });

  revalidatePath(`/workspace/${parsed.clienteId}`);
}

export async function renomearEstagioAction(input: {
  clienteId: string;
  estagioId: string;
  nome: string;
}) {
  await requireAcessoCliente(input.clienteId);
  await prisma.estagio.update({ where: { id: input.estagioId }, data: { nome: input.nome } });
  revalidatePath(`/workspace/${input.clienteId}`);
}

export async function reordenarEstagiosAction(input: {
  clienteId: string;
  ordemIds: string[];
}) {
  await requireAcessoCliente(input.clienteId);

  await prisma.$transaction(
    input.ordemIds.map((id, index) =>
      prisma.estagio.update({ where: { id }, data: { ordem: index } }),
    ),
  );

  revalidatePath(`/workspace/${input.clienteId}`);
}

export async function excluirEstagioAction(input: { clienteId: string; estagioId: string }) {
  await requireAcessoCliente(input.clienteId);

  const totalLeads = await prisma.lead.count({ where: { estagioId: input.estagioId } });
  if (totalLeads > 0) {
    throw new Error("Mova ou exclua os leads desta coluna antes de removê-la.");
  }

  await prisma.estagio.delete({ where: { id: input.estagioId } });
  revalidatePath(`/workspace/${input.clienteId}`);
}

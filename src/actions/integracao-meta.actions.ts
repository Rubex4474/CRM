"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { validarPaginaMeta } from "@/lib/meta-leads";

const conectarSchema = z.object({
  clienteId: z.string().min(1),
  pageId: z.string().min(1, "Informe o ID da Página."),
  pageAccessToken: z.string().min(1, "Informe o Page Access Token."),
  estagioDestinoId: z.string().min(1, "Escolha em qual estágio os leads vão cair."),
});

export type ConectarMetaAdsState = { erro?: string; sucesso?: boolean };

export async function conectarMetaAdsAction(
  _prevState: ConectarMetaAdsState,
  formData: FormData,
): Promise<ConectarMetaAdsState> {
  await requireAdmin();

  const parsed = conectarSchema.safeParse({
    clienteId: formData.get("clienteId"),
    pageId: formData.get("pageId"),
    pageAccessToken: formData.get("pageAccessToken"),
    estagioDestinoId: formData.get("estagioDestinoId"),
  });
  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }
  const { clienteId, pageId, pageAccessToken, estagioDestinoId } = parsed.data;

  const paginaDeOutroCliente = await prisma.integracaoMetaAds.findFirst({
    where: { pageId, clienteId: { not: clienteId } },
  });
  if (paginaDeOutroCliente) {
    return { erro: "Essa Página já está conectada a outro cliente no CRM." };
  }

  let nomePagina: string;
  try {
    nomePagina = (await validarPaginaMeta(pageId, pageAccessToken)).nome;
  } catch (error) {
    return { erro: error instanceof Error ? error.message : "Não foi possível validar a Página." };
  }

  await prisma.integracaoMetaAds.upsert({
    where: { clienteId },
    create: { clienteId, pageId, pageAccessToken, nomePagina, estagioDestinoId },
    update: { pageId, pageAccessToken, nomePagina, estagioDestinoId, ativo: true },
  });

  revalidatePath(`/admin/clientes/${clienteId}`);
  return { sucesso: true };
}

const atualizarSchema = z.object({
  clienteId: z.string().min(1),
  estagioDestinoId: z.string().min(1),
  ativo: z.string().optional(),
});

export async function atualizarMetaAdsAction(formData: FormData) {
  await requireAdmin();

  const parsed = atualizarSchema.parse({
    clienteId: formData.get("clienteId"),
    estagioDestinoId: formData.get("estagioDestinoId"),
    ativo: formData.get("ativo") || undefined,
  });

  await prisma.integracaoMetaAds.update({
    where: { clienteId: parsed.clienteId },
    data: { estagioDestinoId: parsed.estagioDestinoId, ativo: parsed.ativo === "on" },
  });

  revalidatePath(`/admin/clientes/${parsed.clienteId}`);
}

export async function desconectarMetaAdsAction(input: { clienteId: string }) {
  await requireAdmin();
  await prisma.integracaoMetaAds.delete({ where: { clienteId: input.clienteId } });
  revalidatePath(`/admin/clientes/${input.clienteId}`);
}

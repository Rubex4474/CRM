"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const ESTAGIOS_PADRAO = ["Novo lead", "Contato feito", "Proposta enviada", "Fechado"];

const criarClienteSchema = z.object({
  nome: z.string().min(1, "Informe o nome do cliente."),
  email: z.string().email("Informe um e-mail válido para o login do cliente."),
  senha: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
});

export type CriarClienteState = { erro?: string };

export async function criarClienteAction(
  _prevState: CriarClienteState,
  formData: FormData,
): Promise<CriarClienteState> {
  await requireAdmin();

  const parsed = criarClienteSchema.safeParse({
    nome: formData.get("nome"),
    email: formData.get("email"),
    senha: formData.get("senha"),
  });

  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const emailExistente = await prisma.usuario.findUnique({ where: { email: parsed.data.email } });
  if (emailExistente) {
    return { erro: "Já existe um usuário com esse e-mail." };
  }

  const cliente = await prisma.cliente.create({
    data: {
      nome: parsed.data.nome,
      funis: {
        create: {
          nome: "Funil de vendas",
          estagios: {
            create: ESTAGIOS_PADRAO.map((nome, index) => ({ nome, ordem: index })),
          },
        },
      },
      usuarios: {
        create: {
          nome: parsed.data.nome,
          email: parsed.data.email,
          senhaHash: await bcrypt.hash(parsed.data.senha, 10),
          papel: "cliente",
        },
      },
    },
  });

  revalidatePath("/admin/clientes");
  redirect(`/admin/clientes/${cliente.id}`);
}

const renomearClienteSchema = z.object({
  clienteId: z.string().min(1),
  nome: z.string().min(1, "Informe o nome do cliente."),
});

export async function renomearClienteAction(formData: FormData) {
  await requireAdmin();

  const parsed = renomearClienteSchema.parse({
    clienteId: formData.get("clienteId"),
    nome: formData.get("nome"),
  });

  await prisma.cliente.update({ where: { id: parsed.clienteId }, data: { nome: parsed.nome } });
  revalidatePath(`/admin/clientes/${parsed.clienteId}`);
  revalidatePath("/admin/clientes");
}

const redefinirSenhaSchema = z.object({
  usuarioId: z.string().min(1),
  clienteId: z.string().min(1),
  novaSenha: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
});

export type RedefinirSenhaState = { erro?: string; sucesso?: boolean };

export async function redefinirSenhaClienteAction(
  _prevState: RedefinirSenhaState,
  formData: FormData,
): Promise<RedefinirSenhaState> {
  await requireAdmin();

  const parsed = redefinirSenhaSchema.safeParse({
    usuarioId: formData.get("usuarioId"),
    clienteId: formData.get("clienteId"),
    novaSenha: formData.get("novaSenha"),
  });

  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await prisma.usuario.update({
    where: { id: parsed.data.usuarioId },
    data: { senhaHash: await bcrypt.hash(parsed.data.novaSenha, 10) },
  });

  revalidatePath(`/admin/clientes/${parsed.data.clienteId}`);
  return { sucesso: true };
}

export async function excluirClienteAction(input: { clienteId: string }) {
  await requireAdmin();

  const cliente = await prisma.cliente.findUnique({ where: { id: input.clienteId } });
  if (!cliente || cliente.ehAgencia) {
    throw new Error("Não é possível excluir este workspace.");
  }

  await prisma.cliente.delete({ where: { id: input.clienteId } });
  revalidatePath("/admin/clientes");
}

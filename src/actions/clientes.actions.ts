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
  tarefas: z.string().optional(),
});

/** Uma tarefa por linha, ignorando linhas em branco — sem exigir data. */
function parseTarefasChecklist(texto: string | undefined): string[] {
  if (!texto) return [];
  return texto
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean);
}

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
    tarefas: formData.get("tarefas") || undefined,
  });

  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const emailExistente = await prisma.usuario.findUnique({ where: { email: parsed.data.email } });
  if (emailExistente) {
    return { erro: "Já existe um usuário com esse e-mail." };
  }

  const descricoesTarefas = parseTarefasChecklist(parsed.data.tarefas);

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
      tarefas: {
        create: descricoesTarefas.map((descricao) => ({ descricao })),
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

const atualizarLogoSchema = z.object({
  clienteId: z.string().min(1),
  logoUrl: z.string().optional(),
});

export async function atualizarLogoAction(formData: FormData) {
  await requireAdmin();

  const parsed = atualizarLogoSchema.parse({
    clienteId: formData.get("clienteId"),
    logoUrl: formData.get("logoUrl") || undefined,
  });

  await prisma.cliente.update({
    where: { id: parsed.clienteId },
    data: { logoUrl: parsed.logoUrl?.trim() || null },
  });

  revalidatePath(`/admin/clientes/${parsed.clienteId}`);
  revalidatePath(`/workspace/${parsed.clienteId}`);
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

const atualizarContratoSchema = z.object({
  clienteId: z.string().min(1),
  valorContrato: z.string().optional(),
  diaVencimento: z.string().optional(),
  inicioContrato: z.string().optional(),
  fimContrato: z.string().optional(),
  obsContrato: z.string().optional(),
});

export type AtualizarContratoState = { erro?: string; sucesso?: boolean };

export async function atualizarContratoAction(
  _prevState: AtualizarContratoState,
  formData: FormData,
): Promise<AtualizarContratoState> {
  await requireAdmin();

  const parsed = atualizarContratoSchema.safeParse({
    clienteId: formData.get("clienteId"),
    valorContrato: formData.get("valorContrato") || undefined,
    diaVencimento: formData.get("diaVencimento") || undefined,
    inicioContrato: formData.get("inicioContrato") || undefined,
    fimContrato: formData.get("fimContrato") || undefined,
    obsContrato: formData.get("obsContrato") || undefined,
  });

  if (!parsed.success) {
    return { erro: "Dados inválidos." };
  }

  const diaVencimento = parsed.data.diaVencimento ? Number(parsed.data.diaVencimento) : null;
  if (diaVencimento !== null && (diaVencimento < 1 || diaVencimento > 31)) {
    return { erro: "O dia de vencimento precisa ser entre 1 e 31." };
  }

  await prisma.cliente.update({
    where: { id: parsed.data.clienteId },
    data: {
      valorContrato: parsed.data.valorContrato ? Number(parsed.data.valorContrato) : null,
      diaVencimento,
      inicioContrato: parsed.data.inicioContrato ? new Date(parsed.data.inicioContrato) : null,
      fimContrato: parsed.data.fimContrato ? new Date(parsed.data.fimContrato) : null,
      obsContrato: parsed.data.obsContrato || null,
    },
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

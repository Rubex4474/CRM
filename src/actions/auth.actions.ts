"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { criarSessao, destruirSessao } from "@/lib/session";

const loginSchema = z.object({
  email: z.string().email("Informe um e-mail válido."),
  senha: z.string().min(1, "Informe a senha."),
});

export type LoginState = {
  erro?: string;
  redirectTo?: string;
};

export async function loginAction(_prevState: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    senha: formData.get("senha"),
  });

  if (!parsed.success) {
    return { erro: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const usuario = await prisma.usuario.findUnique({ where: { email: parsed.data.email } });
  if (!usuario) {
    return { erro: "E-mail ou senha incorretos." };
  }

  const senhaOk = await bcrypt.compare(parsed.data.senha, usuario.senhaHash);
  if (!senhaOk) {
    return { erro: "E-mail ou senha incorretos." };
  }

  await criarSessao({
    usuarioId: usuario.id,
    nome: usuario.nome,
    papel: usuario.papel as "admin" | "cliente",
    clienteId: usuario.clienteId,
  });

  return {
    redirectTo: usuario.papel === "admin" ? "/admin" : `/workspace/${usuario.clienteId}`,
  };
}

export async function logoutAction() {
  await destruirSessao();
}

import "server-only";
import { redirect } from "next/navigation";
import { getSessao, type SessionPayload } from "@/lib/session";

export async function requireSessao(): Promise<SessionPayload> {
  const sessao = await getSessao();
  if (!sessao) redirect("/login");
  return sessao;
}

export async function requireAdmin(): Promise<SessionPayload> {
  const sessao = await requireSessao();
  if (sessao.papel !== "admin") redirect("/login");
  return sessao;
}

/** Admin acessa qualquer workspace; cliente só o próprio. */
export async function requireAcessoCliente(clienteId: string): Promise<SessionPayload> {
  const sessao = await requireSessao();
  if (sessao.papel === "admin") return sessao;
  if (sessao.papel === "cliente" && sessao.clienteId === clienteId) return sessao;
  redirect("/login");
}

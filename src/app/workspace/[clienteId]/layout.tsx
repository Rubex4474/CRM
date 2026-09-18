import { requireAcessoCliente } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { WorkspaceHeader } from "@/components/layout/workspace-header";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ clienteId: string }>;
}) {
  const { clienteId } = await params;
  const sessao = await requireAcessoCliente(clienteId);

  const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
  if (!cliente) notFound();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <WorkspaceHeader clienteNome={cliente.nome} isAdmin={sessao.papel === "admin"} />
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  );
}

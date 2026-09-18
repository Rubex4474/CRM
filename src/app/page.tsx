import { redirect } from "next/navigation";
import { getSessao } from "@/lib/session";

export default async function HomePage() {
  const sessao = await getSessao();
  if (!sessao) redirect("/login");
  if (sessao.papel === "admin") redirect("/admin");
  redirect(`/workspace/${sessao.clienteId}`);
}

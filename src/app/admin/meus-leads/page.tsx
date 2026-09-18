import { redirect, notFound } from "next/navigation";
import { getAgenciaClienteId } from "@/services/clientes.service";

export default async function MeusLeadsPage() {
  const clienteId = await getAgenciaClienteId();
  if (!clienteId) notFound();
  redirect(`/workspace/${clienteId}`);
}

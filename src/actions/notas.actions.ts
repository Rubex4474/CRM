"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

const criarNotaSchema = z.object({
  clienteId: z.string().min(1),
  texto: z.string().min(1, "Escreva uma nota."),
});

export async function criarNotaAction(formData: FormData) {
  await requireAdmin();

  const parsed = criarNotaSchema.parse({
    clienteId: formData.get("clienteId"),
    texto: formData.get("texto"),
  });

  await prisma.notaCliente.create({ data: parsed });

  revalidatePath(`/admin/clientes/${parsed.clienteId}`);
}

export async function excluirNotaAction(input: { clienteId: string; notaId: string }) {
  await requireAdmin();
  await prisma.notaCliente.delete({ where: { id: input.notaId } });
  revalidatePath(`/admin/clientes/${input.clienteId}`);
}

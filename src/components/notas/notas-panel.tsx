"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import type { Cliente, NotaCliente } from "@prisma/client";
import { criarNotaAction, excluirNotaAction } from "@/actions/notas.actions";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export function NotasPanel({ cliente }: { cliente: Cliente & { notas: NotaCliente[] } }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      await criarNotaAction(new FormData(e.currentTarget));
      formRef.current?.reset();
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function excluir(notaId: string) {
    await excluirNotaAction({ clienteId: cliente.id, notaId });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardContent className="pt-6">
          <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-3">
            <input type="hidden" name="clienteId" value={cliente.id} />
            <Textarea name="texto" placeholder={`Nova nota sobre ${cliente.nome}...`} required rows={3} />
            <Button type="submit" disabled={pending} className="self-end">
              {pending ? "Salvando..." : "Adicionar nota"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {cliente.notas.length === 0 && (
          <p className="text-sm text-muted-foreground">Nenhuma nota registrada ainda.</p>
        )}
        {cliente.notas.map((nota) => (
          <Card key={nota.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="whitespace-pre-wrap text-sm">{nota.texto}</p>
              <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => excluir(nota.id)}>
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{formatDate(nota.criadoEm)}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}

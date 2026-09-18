"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { renomearClienteAction, excluirClienteAction } from "@/actions/clientes.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function ClienteHeader({ clienteId, nome }: { clienteId: string; nome: string }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editando, setEditando] = useState(false);
  const [valor, setValor] = useState(nome);

  function salvar() {
    setEditando(false);
    if (!valor.trim() || valor === nome) {
      setValor(nome);
      return;
    }
    const formData = new FormData();
    formData.set("clienteId", clienteId);
    formData.set("nome", valor.trim());
    startTransition(async () => {
      await renomearClienteAction(formData);
      router.refresh();
    });
  }

  function excluir() {
    if (!confirm(`Excluir "${nome}" e todos os seus leads, tarefas e notas? Essa ação não pode ser desfeita.`)) {
      return;
    }
    startTransition(async () => {
      try {
        await excluirClienteAction({ clienteId });
        router.push("/admin/clientes");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Não foi possível excluir o cliente.");
      }
    });
  }

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-2">
        {editando ? (
          <Input
            autoFocus
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            onBlur={salvar}
            onKeyDown={(e) => e.key === "Enter" && salvar()}
            className="h-9 font-heading text-xl font-bold"
          />
        ) : (
          <h1 className="font-heading text-2xl font-bold tracking-tight">{nome}</h1>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditando(true)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button asChild>
          <Link href={`/workspace/${clienteId}`}>
            Entrar no workspace
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button variant="ghost" size="icon" onClick={excluir} title="Excluir cliente">
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

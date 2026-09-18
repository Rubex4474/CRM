"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { criarClienteAction, type CriarClienteState } from "@/actions/clientes.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const initialState: CriarClienteState = {};

export function NovoClienteButton() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(criarClienteAction, initialState);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Novo cliente
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo cliente</DialogTitle>
          </DialogHeader>
          <form action={formAction} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nome-cliente">Nome do cliente</Label>
              <Input id="nome-cliente" name="nome" required autoFocus placeholder="Ex: CL Cuidados" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email-cliente">E-mail de login do cliente</Label>
              <Input id="email-cliente" name="email" type="email" required placeholder="cliente@empresa.com" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="senha-cliente">Senha inicial</Label>
              <Input id="senha-cliente" name="senha" type="text" required placeholder="Mínimo 6 caracteres" />
            </div>
            {state.erro && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {state.erro}
              </p>
            )}
            <Button type="submit" disabled={pending}>
              {pending ? "Criando..." : "Criar cliente"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

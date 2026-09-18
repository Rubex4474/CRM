"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { criarLeadAction } from "@/actions/leads.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function NewLeadDialog({
  clienteId,
  estagioId,
  open,
  onOpenChange,
}: {
  clienteId: string;
  estagioId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      await criarLeadAction(new FormData(e.currentTarget));
      formRef.current?.reset();
      onOpenChange(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo lead</DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="clienteId" value={clienteId} />
          <input type="hidden" name="estagioId" value={estagioId} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" name="nome" required autoFocus placeholder="Nome do lead" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="contato">Contato</Label>
            <Input id="contato" name="contato" placeholder="Telefone ou e-mail" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="origem">Origem</Label>
            <Input id="origem" name="origem" placeholder="Ex: Instagram, indicação..." />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notas">Notas</Label>
            <Textarea id="notas" name="notas" placeholder="Observações sobre o lead" />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Criar lead"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

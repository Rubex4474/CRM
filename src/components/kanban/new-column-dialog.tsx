"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { criarEstagioAction } from "@/actions/estagios.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function NewColumnDialog({
  clienteId,
  funilId,
  open,
  onOpenChange,
}: {
  clienteId: string;
  funilId: string;
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
      await criarEstagioAction(new FormData(e.currentTarget));
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
          <DialogTitle>Nova coluna</DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="hidden" name="clienteId" value={clienteId} />
          <input type="hidden" name="funilId" value={funilId} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nome-coluna">Nome da coluna</Label>
            <Input id="nome-coluna" name="nome" required autoFocus placeholder="Ex: Negociação" />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Criar coluna"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

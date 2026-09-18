"use client";

import { useActionState, useState } from "react";
import { KeyRound } from "lucide-react";
import {
  redefinirSenhaClienteAction,
  type RedefinirSenhaState,
} from "@/actions/clientes.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const initialState: RedefinirSenhaState = {};

export function ClienteLoginCard({
  clienteId,
  usuarioId,
  email,
}: {
  clienteId: string;
  usuarioId: string | undefined;
  email: string | undefined;
}) {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(redefinirSenhaClienteAction, initialState);

  if (!usuarioId || !email) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Login do cliente</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 text-sm text-muted-foreground">
          Nenhum login configurado para este cliente.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Login do cliente</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between pt-0">
        <p className="text-sm">{email}</p>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <KeyRound className="h-3.5 w-3.5" />
          Redefinir senha
        </Button>
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Redefinir senha de {email}</DialogTitle>
          </DialogHeader>
          <form action={formAction} className="flex flex-col gap-4">
            <input type="hidden" name="usuarioId" value={usuarioId} />
            <input type="hidden" name="clienteId" value={clienteId} />
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="nova-senha">Nova senha</Label>
              <Input id="nova-senha" name="novaSenha" required placeholder="Mínimo 6 caracteres" />
            </div>
            {state.erro && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {state.erro}
              </p>
            )}
            {state.sucesso && (
              <p className="rounded-lg border border-success/30 bg-success/10 px-3 py-2 text-sm text-success">
                Senha atualizada.
              </p>
            )}
            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Salvar nova senha"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

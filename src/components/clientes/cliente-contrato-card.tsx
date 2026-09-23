"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { atualizarContratoAction, type AtualizarContratoState } from "@/actions/clientes.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const initialState: AtualizarContratoState = {};

/** Formata um Date para o formato yyyy-MM-dd que <input type="date"> espera. */
function paraInputDate(valor: Date | null): string {
  if (!valor) return "";
  return new Date(valor).toISOString().slice(0, 10);
}

export function ClienteContratoCard({
  clienteId,
  valorContrato,
  diaVencimento,
  inicioContrato,
  fimContrato,
  obsContrato,
}: {
  clienteId: string;
  valorContrato: number | null;
  diaVencimento: number | null;
  inicioContrato: Date | null;
  fimContrato: Date | null;
  obsContrato: string | null;
}) {
  const [state, formAction, pending] = useActionState(atualizarContratoAction, initialState);
  const [tocado, setTocado] = useState(false);

  useEffect(() => {
    if (!tocado) return;
    if (state.sucesso) toast.success("Informações do contrato salvas.");
    if (state.erro) toast.error(state.erro);
  }, [state, tocado]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contrato</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <form
          action={formAction}
          onSubmit={() => setTocado(true)}
          className="flex flex-col gap-3"
        >
          <input type="hidden" name="clienteId" value={clienteId} />
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="valorContrato">Valor (R$)</Label>
              <Input
                id="valorContrato"
                name="valorContrato"
                type="number"
                step="0.01"
                min="0"
                placeholder="1500.00"
                defaultValue={valorContrato ?? ""}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="diaVencimento">Dia do vencimento</Label>
              <Input
                id="diaVencimento"
                name="diaVencimento"
                type="number"
                min="1"
                max="31"
                placeholder="Ex: 10"
                defaultValue={diaVencimento ?? ""}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="inicioContrato">Início do contrato</Label>
              <Input
                id="inicioContrato"
                name="inicioContrato"
                type="date"
                defaultValue={paraInputDate(inicioContrato)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="fimContrato">Fim / renovação</Label>
              <Input
                id="fimContrato"
                name="fimContrato"
                type="date"
                defaultValue={paraInputDate(fimContrato)}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="obsContrato">Observações</Label>
            <Textarea
              id="obsContrato"
              name="obsContrato"
              rows={3}
              placeholder="Forma de pagamento, condições especiais, etc."
              defaultValue={obsContrato ?? ""}
            />
          </div>
          <Button type="submit" disabled={pending} className="self-end">
            {pending ? "Salvando..." : "Salvar contrato"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

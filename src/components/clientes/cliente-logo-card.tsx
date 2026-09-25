"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { atualizarLogoAction } from "@/actions/clientes.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ClienteLogoCard({
  clienteId,
  nome,
  logoUrl,
}: {
  clienteId: string;
  nome: string;
  logoUrl: string | null;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, setPending] = useState(false);
  const [preview, setPreview] = useState(logoUrl ?? "");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      await atualizarLogoAction(new FormData(e.currentTarget));
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Logo do cliente</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="mb-3 text-xs text-muted-foreground">
          Quando configurada, essa logo aparece no lugar da logo da Stockmann no workspace deste
          cliente (com &quot;Stockmann CRM&quot; como assinatura menor embaixo do nome).
        </p>
        <form ref={formRef} onSubmit={handleSubmit} className="flex items-end gap-3">
          <input type="hidden" name="clienteId" value={clienteId} />
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element -- preview simples de URL arbitrária
              <img
                src={preview}
                alt={nome}
                className="h-full w-full object-contain"
                onError={(e) => (e.currentTarget.style.opacity = "0.2")}
              />
            ) : (
              <span className="text-xs text-muted-foreground">Sem logo</span>
            )}
          </div>
          <div className="flex flex-1 flex-col gap-1.5">
            <Label htmlFor="logoUrl">Link da logo</Label>
            <Input
              id="logoUrl"
              name="logoUrl"
              placeholder="/logos/cliente.png ou uma URL pública de imagem"
              defaultValue={logoUrl ?? ""}
              onChange={(e) => setPreview(e.target.value)}
            />
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Salvar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

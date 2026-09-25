"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { atualizarLogoAction } from "@/actions/clientes.actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const TAMANHO_MAX_PX = 320;

/** Redimensiona no navegador (mantendo proporção e transparência) antes de virar base64,
 * pra não guardar imagens enormes no banco só porque o arquivo original era grande. */
function redimensionarImagem(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler o arquivo."));
    reader.onload = () => {
      const img = new window.Image();
      img.onerror = () => reject(new Error("Arquivo não é uma imagem válida."));
      img.onload = () => {
        const escala = Math.min(1, TAMANHO_MAX_PX / Math.max(img.width, img.height));
        const w = Math.round(img.width * escala);
        const h = Math.round(img.height * escala);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas não suportado."));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/png"));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState(false);
  const [valor, setValor] = useState(logoUrl ?? "");
  const [processandoArquivo, setProcessandoArquivo] = useState(false);

  const ehArquivoEnviado = valor.startsWith("data:");

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Escolha um arquivo de imagem (PNG, JPG, SVG...).");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande (máximo 5MB).");
      return;
    }

    setProcessandoArquivo(true);
    try {
      const dataUrl = await redimensionarImagem(file);
      setValor(dataUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível processar a imagem.");
    } finally {
      setProcessandoArquivo(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    try {
      await atualizarLogoAction(new FormData(e.currentTarget));
      router.refresh();
      toast.success("Logo salva.");
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
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input type="hidden" name="clienteId" value={clienteId} />
          <input type="hidden" name="logoUrl" value={valor} />

          <div className="flex items-end gap-3">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
              {valor ? (
                // eslint-disable-next-line @next/next/no-img-element -- preview de arquivo local (data URL) ou URL arbitrária
                <img
                  src={valor}
                  alt={nome}
                  className="h-full w-full object-contain"
                  onError={(e) => (e.currentTarget.style.opacity = "0.2")}
                />
              ) : (
                <span className="text-xs text-muted-foreground">Sem logo</span>
              )}
            </div>

            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor="logoUrlVisivel">Link da logo (ou envie um arquivo abaixo)</Label>
              {ehArquivoEnviado ? (
                <div className="flex h-9 items-center justify-between rounded-lg border border-border bg-background px-3 text-sm text-muted-foreground">
                  Arquivo enviado do computador
                  <button
                    type="button"
                    onClick={() => setValor("")}
                    className="text-muted-foreground hover:text-foreground"
                    title="Remover"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
                <Input
                  id="logoUrlVisivel"
                  placeholder="/logos/cliente.png ou uma URL pública de imagem"
                  value={valor}
                  onChange={(e) => setValor(e.target.value)}
                />
              )}
            </div>

            <Button type="submit" disabled={pending}>
              {pending ? "Salvando..." : "Salvar"}
            </Button>
          </div>

          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={processandoArquivo}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-3.5 w-3.5" />
              {processandoArquivo ? "Processando..." : "Enviar arquivo do computador"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

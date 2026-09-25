"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Espera a logo em `public/logo.png`. Mostra o fallback (🐺) por padrão e só
 * troca pra imagem real depois de confirmar (via preload client-side) que ela
 * carrega — um <img onError> comum não é confiável aqui porque o navegador
 * tenta carregar a imagem antes da hidratação terminar, e o evento de erro
 * nativo já disparou antes do React conseguir anexar o handler.
 */
export function Logo({ className }: { className?: string }) {
  const [logoOk, setLogoOk] = useState(false);

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => setLogoOk(true);
    img.src = "/logo.png";
  }, []);

  if (!logoOk) {
    return (
      <div
        className={cn(
          "flex items-center justify-center rounded-xl bg-primary text-primary-foreground",
          className,
        )}
      >
        🐺
      </div>
    );
  }

  // eslint-disable-next-line @next/next/no-img-element -- tamanho variável entre usos
  return <img src="/logo.png" alt="Stockmann CRM" className={cn("object-contain", className)} />;
}

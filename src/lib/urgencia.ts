export const URGENCIA_VALUES = ["urgente", "media", "tranquila"] as const;
export type Urgencia = (typeof URGENCIA_VALUES)[number];

export const URGENCIA_INFO: Record<Urgencia, { label: string; cor: string; badge: string }> = {
  urgente: {
    label: "Urgente",
    cor: "bg-destructive",
    badge: "bg-destructive/10 text-destructive border-destructive/25",
  },
  media: {
    label: "Média",
    cor: "bg-warning",
    badge: "bg-warning/10 text-warning border-warning/25",
  },
  tranquila: {
    label: "Tranquila",
    cor: "bg-success",
    badge: "bg-success/10 text-success border-success/25",
  },
};

/** Pra ordenar pendentes com a mais urgente primeiro. */
export const URGENCIA_PESO: Record<Urgencia, number> = { urgente: 0, media: 1, tranquila: 2 };

export function ehUrgencia(valor: string): valor is Urgencia {
  return (URGENCIA_VALUES as readonly string[]).includes(valor);
}

export function normalizarUrgencia(valor: string | null | undefined): Urgencia {
  return valor && ehUrgencia(valor) ? valor : "media";
}

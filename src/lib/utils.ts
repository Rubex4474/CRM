import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string | Date): string {
  const date = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function isOverdue(dataPrevista: Date | string | null, concluida: boolean): boolean {
  if (!dataPrevista || concluida) return false;
  const date = typeof dataPrevista === "string" ? new Date(dataPrevista) : dataPrevista;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  return date.getTime() < hoje.getTime();
}

/** Monta o link https://wa.me/55NUMERO a partir de um contato em texto livre, se parecer telefone. */
export function buildWhatsappLink(contato: string | null | undefined): string | null {
  if (!contato) return null;
  let digits = contato.replace(/\D/g, "");
  if (digits.length < 10) return null;

  digits = digits.replace(/^0+/, "");
  if (!digits.startsWith("55")) {
    digits = `55${digits}`;
  }
  return `https://wa.me/${digits}`;
}

export function initials(nome: string): string {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

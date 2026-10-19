import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assinaturaMetaValida, buscarLeadgenDetalhado } from "@/lib/meta-leads";

/**
 * Handshake de verificação do webhook — a Meta chama isso uma vez quando
 * você cola essa URL no painel de Webhooks do App, pra confirmar que o
 * endpoint é seu. Só responde ao challenge se o verify_token bater.
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const modo = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (modo === "subscribe" && token === process.env.META_WEBHOOK_VERIFY_TOKEN && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }
  return new NextResponse("Forbidden", { status: 403 });
}

type LeadgenChange = {
  field: string;
  value: { leadgen_id: string; page_id: string; form_id?: string; created_time?: number };
};

/** Notificação real de um novo lead preenchido num formulário de anúncio. */
export async function POST(request: NextRequest) {
  const corpoBruto = await request.text();

  if (!assinaturaMetaValida(corpoBruto, request.headers.get("x-hub-signature-256"))) {
    return new NextResponse("Invalid signature", { status: 401 });
  }

  let payload: { entry?: { changes?: LeadgenChange[] }[] };
  try {
    payload = JSON.parse(corpoBruto);
  } catch {
    return new NextResponse("Invalid JSON", { status: 400 });
  }

  const eventos = (payload.entry ?? []).flatMap((entry) => entry.changes ?? []);
  const leadgenEventos = eventos.filter((c) => c.field === "leadgen");

  for (const evento of leadgenEventos) {
    await processarLeadgen(evento.value);
  }

  // A Meta só se importa com 200 — qualquer outro status ela reenvia o evento
  // em retry. Erros por evento já ficam logados em processarLeadgen.
  return new NextResponse("OK", { status: 200 });
}

async function processarLeadgen(value: LeadgenChange["value"]) {
  try {
    const jaExiste = await prisma.lead.findUnique({ where: { metaLeadgenId: value.leadgen_id } });
    if (jaExiste) return; // Meta reenvia notificação às vezes — idempotente.

    const integracao = await prisma.integracaoMetaAds.findUnique({
      where: { pageId: value.page_id },
      include: { estagioDestino: true },
    });
    if (!integracao || !integracao.ativo) {
      console.warn(`[meta-leads] leadgen ${value.leadgen_id} ignorado: página ${value.page_id} sem integração ativa.`);
      return;
    }

    const detalhado = await buscarLeadgenDetalhado(value.leadgen_id, integracao.pageAccessToken);

    const ultimo = await prisma.lead.findFirst({
      where: { estagioId: integracao.estagioDestinoId },
      orderBy: { ordem: "desc" },
    });

    await prisma.$transaction([
      prisma.lead.create({
        data: {
          clienteId: integracao.clienteId,
          estagioId: integracao.estagioDestinoId,
          nome: detalhado.nome,
          contato: detalhado.contato,
          origem: detalhado.formName ? `Meta Ads · ${detalhado.formName}` : "Meta Ads",
          notas: detalhado.notas || null,
          metaLeadgenId: value.leadgen_id,
          ordem: (ultimo?.ordem ?? -1) + 1,
        },
      }),
      prisma.integracaoMetaAds.update({
        where: { id: integracao.id },
        data: { ultimoLeadEm: new Date() },
      }),
    ]);
  } catch (error) {
    console.error(`[meta-leads] falha ao processar leadgen ${value.leadgen_id}:`, error);
  }
}

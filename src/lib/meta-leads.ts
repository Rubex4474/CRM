import "server-only";
import crypto from "node:crypto";

const GRAPH_API_VERSION = "v21.0";

/**
 * Confere o header X-Hub-Signature-256 que a Meta manda em todo POST de
 * webhook — garante que o payload é mesmo da Meta (assinado com o App
 * Secret) e não de alguém batendo direto no endpoint.
 */
export function assinaturaMetaValida(corpoBruto: string, headerAssinatura: string | null): boolean {
  const appSecret = process.env.META_APP_SECRET;
  if (!appSecret || !headerAssinatura) return false;

  const esperada = `sha256=${crypto.createHmac("sha256", appSecret).update(corpoBruto).digest("hex")}`;

  const bufA = Buffer.from(esperada);
  const bufB = Buffer.from(headerAssinatura);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

type MetaFieldData = { name: string; values: string[] };

type LeadgenDetalhado = {
  nome: string;
  contato: string | null;
  notas: string;
  formName: string | null;
};

const CAMPOS_NOME = ["full_name", "nome_completo", "nome", "name"];
const CAMPOS_CONTATO = ["phone_number", "telefone", "whatsapp", "celular", "email", "e-mail"];

/** Traduz o field_data (formato livre, depende de como o cliente montou o formulário) pros campos do nosso Lead. */
function interpretarFieldData(fieldData: MetaFieldData[]): { nome: string | null; contato: string | null; linhas: string[] } {
  const porNome = new Map(fieldData.map((f) => [f.name.toLowerCase(), f.values?.[0] ?? ""]));

  let nome: string | null = null;
  for (const chave of CAMPOS_NOME) {
    if (porNome.get(chave)) {
      nome = porNome.get(chave)!;
      break;
    }
  }
  if (!nome) {
    const primeiro = porNome.get("first_name");
    const ultimo = porNome.get("last_name");
    if (primeiro || ultimo) nome = [primeiro, ultimo].filter(Boolean).join(" ");
  }

  let contato: string | null = null;
  for (const chave of CAMPOS_CONTATO) {
    if (porNome.get(chave)) {
      contato = porNome.get(chave)!;
      break;
    }
  }

  const linhas = fieldData.map((f) => `${f.name}: ${f.values?.join(", ") ?? ""}`);

  return { nome, contato, linhas };
}

/** Busca os dados completos de um lead na Graph API a partir do leadgen_id que veio no webhook. */
export async function buscarLeadgenDetalhado(leadgenId: string, pageAccessToken: string): Promise<LeadgenDetalhado> {
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${leadgenId}?fields=field_data,form_name&access_token=${encodeURIComponent(pageAccessToken)}`;
  const resposta = await fetch(url);
  if (!resposta.ok) {
    const corpo = await resposta.text();
    throw new Error(`Graph API recusou a busca do lead ${leadgenId}: ${resposta.status} ${corpo}`);
  }

  const dados = (await resposta.json()) as { field_data?: MetaFieldData[]; form_name?: string };
  const { nome, contato, linhas } = interpretarFieldData(dados.field_data ?? []);

  return {
    nome: nome || "Lead do Instagram/Facebook",
    contato,
    notas: linhas.join("\n"),
    formName: dados.form_name ?? null,
  };
}

/** Confirma que o pageId + token formam um par válido, e devolve o nome da página pra mostrar na UI. */
export async function validarPaginaMeta(pageId: string, pageAccessToken: string): Promise<{ nome: string }> {
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}?fields=name&access_token=${encodeURIComponent(pageAccessToken)}`;
  const resposta = await fetch(url);
  if (!resposta.ok) {
    throw new Error("Não consegui validar essa Página com esse token — confira o ID e se o token não expirou.");
  }
  const dados = (await resposta.json()) as { name?: string; id?: string };
  if (!dados.name) {
    throw new Error("Resposta inesperada da Meta ao validar a Página.");
  }
  return { nome: dados.name };
}

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const ESTAGIOS_PADRAO = ["Novo lead", "Contato feito", "Proposta enviada", "Fechado"];

async function criarClienteComFunil(nome: string, email: string, senha: string) {
  const cliente = await prisma.cliente.create({ data: { nome } });

  const funil = await prisma.funil.create({
    data: {
      clienteId: cliente.id,
      nome: "Funil de vendas",
      estagios: {
        create: ESTAGIOS_PADRAO.map((nomeEstagio, index) => ({
          nome: nomeEstagio,
          ordem: index,
        })),
      },
    },
    include: { estagios: true },
  });

  await prisma.usuario.create({
    data: {
      nome,
      email,
      senhaHash: await bcrypt.hash(senha, 10),
      papel: "cliente",
      clienteId: cliente.id,
    },
  });

  return { cliente, funil };
}

const ESTAGIOS_MEUS_LEADS = ["Novo lead", "Contato feito", "Reunião marcada", "Proposta enviada", "Fechado"];

async function criarWorkspaceAgencia() {
  const cliente = await prisma.cliente.create({
    data: { nome: "Meus Leads (Agência)", ehAgencia: true },
  });

  await prisma.funil.create({
    data: {
      clienteId: cliente.id,
      nome: "Prospecção da agência",
      estagios: {
        create: ESTAGIOS_MEUS_LEADS.map((nomeEstagio, index) => ({
          nome: nomeEstagio,
          ordem: index,
        })),
      },
    },
  });

  return cliente;
}

async function main() {
  await prisma.usuario.create({
    data: {
      nome: "Rubens (Admin)",
      email: "admin@agencia.com",
      senhaHash: await bcrypt.hash("admin123", 10),
      papel: "admin",
    },
  });

  await criarWorkspaceAgencia();

  // Padrão de credenciais por cliente: cliente@[empresa].com / [empresa]123
  const { funil: funilA } = await criarClienteComFunil(
    "CL Cuidados",
    "cliente@clcuidados.com",
    "clcuidados123",
  );

  const { funil: funilB } = await criarClienteComFunil(
    "Tandello Vidros",
    "cliente@tandellovidros.com",
    "tandellovidros123",
  );

  const [novoA, contatoA] = funilA.estagios;
  const lead1 = await prisma.lead.create({
    data: {
      clienteId: funilA.clienteId,
      estagioId: novoA.id,
      nome: "Maria Souza",
      contato: "(11) 98888-1234",
      origem: "Indicação",
      notas: "Interessada em plano mensal de cuidadores.",
      ordem: 0,
    },
  });
  await prisma.tarefaLead.create({
    data: {
      leadId: lead1.id,
      descricao: "Ligar para apresentar planos",
      dataPrevista: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.lead.create({
    data: {
      clienteId: funilA.clienteId,
      estagioId: contatoA.id,
      nome: "João Pereira",
      contato: "(11) 97777-5678",
      origem: "Instagram",
      ordem: 0,
    },
  });

  const [novoB] = funilB.estagios;
  await prisma.lead.create({
    data: {
      clienteId: funilB.clienteId,
      estagioId: novoB.id,
      nome: "Construtora Alfa",
      contato: "contato@construtoraalfa.com",
      origem: "Google Ads",
      ordem: 0,
    },
  });

  await prisma.tarefaAgencia.create({
    data: {
      clienteId: funilA.clienteId,
      descricao: "Enviar relatório mensal de tráfego",
      dataPrevista: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  });
  await prisma.tarefaAgencia.create({
    data: {
      clienteId: funilB.clienteId,
      descricao: "Revisar campanha do Google Ads",
      dataPrevista: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.notaCliente.create({
    data: {
      clienteId: funilA.clienteId,
      texto: "Cliente prefere contato por WhatsApp após as 18h.",
    },
  });

  console.log("Seed concluído.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

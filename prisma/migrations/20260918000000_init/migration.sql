-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senhaHash" TEXT NOT NULL,
    "papel" TEXT NOT NULL,
    "clienteId" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ehAgencia" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valorContrato" DOUBLE PRECISION,
    "diaVencimento" INTEGER,
    "inicioContrato" TIMESTAMP(3),
    "fimContrato" TIMESTAMP(3),
    "obsContrato" TEXT,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Funil" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Funil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Estagio" (
    "id" TEXT NOT NULL,
    "funilId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "ordem" INTEGER NOT NULL,

    CONSTRAINT "Estagio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "estagioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "contato" TEXT,
    "origem" TEXT,
    "notas" TEXT,
    "ordem" INTEGER NOT NULL DEFAULT 0,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TarefaLead" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "dataPrevista" TIMESTAMP(3),
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TarefaLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TarefaAgencia" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "dataPrevista" TIMESTAMP(3),
    "concluida" BOOLEAN NOT NULL DEFAULT false,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TarefaAgencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotaCliente" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotaCliente_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Usuario_clienteId_idx" ON "Usuario"("clienteId");

-- CreateIndex
CREATE INDEX "Funil_clienteId_idx" ON "Funil"("clienteId");

-- CreateIndex
CREATE INDEX "Estagio_funilId_idx" ON "Estagio"("funilId");

-- CreateIndex
CREATE INDEX "Lead_clienteId_idx" ON "Lead"("clienteId");

-- CreateIndex
CREATE INDEX "Lead_estagioId_idx" ON "Lead"("estagioId");

-- CreateIndex
CREATE INDEX "TarefaLead_leadId_idx" ON "TarefaLead"("leadId");

-- CreateIndex
CREATE INDEX "TarefaAgencia_clienteId_idx" ON "TarefaAgencia"("clienteId");

-- CreateIndex
CREATE INDEX "NotaCliente_clienteId_idx" ON "NotaCliente"("clienteId");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Funil" ADD CONSTRAINT "Funil_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Estagio" ADD CONSTRAINT "Estagio_funilId_fkey" FOREIGN KEY ("funilId") REFERENCES "Funil"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_estagioId_fkey" FOREIGN KEY ("estagioId") REFERENCES "Estagio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TarefaLead" ADD CONSTRAINT "TarefaLead_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TarefaAgencia" ADD CONSTRAINT "TarefaAgencia_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotaCliente" ADD CONSTRAINT "NotaCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;


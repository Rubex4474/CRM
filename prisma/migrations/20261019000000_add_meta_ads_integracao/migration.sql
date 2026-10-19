-- AlterTable
ALTER TABLE "Lead" ADD COLUMN "metaLeadgenId" TEXT;

-- CreateTable
CREATE TABLE "IntegracaoMetaAds" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "nomePagina" TEXT,
    "pageAccessToken" TEXT NOT NULL,
    "estagioDestinoId" TEXT NOT NULL,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "ultimoLeadEm" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "IntegracaoMetaAds_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_metaLeadgenId_key" ON "Lead"("metaLeadgenId");

-- CreateIndex
CREATE UNIQUE INDEX "IntegracaoMetaAds_clienteId_key" ON "IntegracaoMetaAds"("clienteId");

-- CreateIndex
CREATE UNIQUE INDEX "IntegracaoMetaAds_pageId_key" ON "IntegracaoMetaAds"("pageId");

-- CreateIndex
CREATE INDEX "IntegracaoMetaAds_clienteId_idx" ON "IntegracaoMetaAds"("clienteId");

-- AddForeignKey
ALTER TABLE "IntegracaoMetaAds" ADD CONSTRAINT "IntegracaoMetaAds_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IntegracaoMetaAds" ADD CONSTRAINT "IntegracaoMetaAds_estagioDestinoId_fkey" FOREIGN KEY ("estagioDestinoId") REFERENCES "Estagio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "TarefaLead" ADD COLUMN "urgencia" TEXT NOT NULL DEFAULT 'media';

-- AlterTable
ALTER TABLE "TarefaAgencia" ADD COLUMN "urgencia" TEXT NOT NULL DEFAULT 'media';

# CRM Agência

CRM multi-tenant para a agência: um workspace com kanban de leads por cliente, cada cliente com login próprio, e um dashboard/board de tarefas exclusivo do admin. Ver `../crm-mvp-especificacao.md` para a especificação original.

## Stack

Next.js 15 (App Router) + TypeScript + Tailwind CSS v3 + Prisma (PostgreSQL — Neon/Supabase) + Framer Motion + dnd-kit + Zod.

Autenticação própria (sem NextAuth): sessão em cookie httpOnly assinado com JWT (`jose`), senha com hash `bcryptjs`, controle de papel (`admin`/`cliente`) via `src/middleware.ts` + `src/lib/auth.ts`.

## Variáveis de ambiente

Copie `.env.example` para `.env` e preencha:

- `DATABASE_URL` — connection string do Postgres **com pooling** (usada pelo app em runtime).
- `DIRECT_URL` — connection string **sem pooling** (usada só pelo `prisma migrate`). No Neon, é a mesma tela da connection string, só desligar o toggle "Connection pooling".
- `SESSION_SECRET` — string aleatória forte. Gere com `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`.

## Rodando localmente

```bash
npm install
npm run db:migrate   # aplica o schema no banco apontado por DATABASE_URL/DIRECT_URL
npm run dev
```

Para popular com dados de teste (só em dev, nunca em produção): `npm run db:seed`.

## Deploy (Vercel + Neon)

1. Crie um banco no [Neon](https://neon.tech) (grátis) e pegue as duas connection strings (com e sem pooling).
2. No Vercel, importe este repositório e configure as 3 variáveis de ambiente acima (`DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`).
3. Deploy. O script `build` (`prisma generate && prisma migrate deploy && next build`) já aplica as migrações no banco novo automaticamente — não precisa rodar nada manual.
4. **Importante:** o build de produção não roda o seed (ele só existe para dev, com senhas de teste). Depois do primeiro deploy, crie o usuário admin real diretamente no banco (rode um script apontando `DATABASE_URL` para a connection string do Neon).

## Login de teste (dados do seed, só em dev)

| Papel | E-mail | Senha |
|---|---|---|
| Admin | admin@agencia.com | admin123 |
| Cliente (CL Cuidados) | cliente@clcuidados.com | cliente123 |
| Cliente (Tandello Vidros) | cliente@tandellovidros.com | cliente123 |

Troque essas credenciais antes de qualquer uso real — `prisma/seed.ts` é só para desenvolvimento.

## Estrutura

- `src/app/login` — tela de login única (redireciona por papel).
- `src/app/admin` — área do admin:
  - `/admin` — dashboard com resumo de todos os clientes.
  - `/admin/clientes` — cadastra novos clientes (cria o funil padrão + o login do cliente de uma vez) e lista os existentes.
  - `/admin/clientes/[clienteId]` — hub de um cliente: renomear, redefinir a senha de login dele, tarefas e notas (o que já foi feito com ele).
  - `/admin/meus-leads` — atalho para o workspace kanban reservado do próprio admin (prospecção da agência via anúncios — mesmo Lead/Kanban dos clientes, só que "cliente" aqui é a própria agência, marcado com `Cliente.ehAgencia = true` e por isso não aparece na lista de clientes nem no dashboard).
  - `/admin/tarefas` — board de tarefas internas da agência, cross-cliente.
- `src/app/workspace/[clienteId]` — kanban de leads; acessível pelo admin (qualquer cliente, incluindo o `ehAgencia`) ou pelo próprio cliente logado.
- `src/actions/*` — Server Actions (mutações), cada uma revalida a rota afetada.
- `src/services/*` — leituras (Server Components) via Prisma.
- `src/lib/session.ts` / `src/lib/auth.ts` — sessão JWT em cookie e guards de papel/acesso por cliente.

## Fora do escopo deste MVP

Captura automática de leads (Meta Ads/WhatsApp/formulário), múltiplos usuários por cliente, qualificação por IA, notificações automáticas de tarefas vencidas e métricas avançadas de funil — conforme a especificação original.

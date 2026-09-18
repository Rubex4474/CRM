# CRM Agência

CRM multi-tenant para a agência: um workspace com kanban de leads por cliente, cada cliente com login próprio, e um dashboard/board de tarefas exclusivo do admin. Ver `../crm-mvp-especificacao.md` para a especificação original.

## Stack

Next.js 15 (App Router) + TypeScript + Tailwind CSS v3 + Prisma (SQLite em dev, troque o `provider`/`url` em `prisma/schema.prisma` para Postgres em produção) + Framer Motion + dnd-kit + Zod.

Autenticação própria (sem NextAuth): sessão em cookie httpOnly assinado com JWT (`jose`), senha com hash `bcryptjs`, controle de papel (`admin`/`cliente`) via `src/middleware.ts` + `src/lib/auth.ts`.

## Rodando localmente

```bash
npm install
npm run db:migrate   # cria o banco SQLite e aplica o schema (roda o seed automaticamente)
npm run dev
```

Se precisar popular o banco de novo manualmente: `npm run db:seed`.

## Login de teste (dados do seed)

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

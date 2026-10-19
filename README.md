# A.A.A.E.S. — Associação Atlética Acadêmica Engenharia de Software

Portal da atlética: loja com pedidos e controle de estoque, eventos com reserva
de ingressos, calendário de partidas e gestão de membros com aprovação por RGM.

Stack: Next.js 16 (App Router) + React 18 + Tailwind + Supabase (Postgres,
Storage) + JWT próprio em cookie httpOnly.

## Setup

```bash
git clone https://github.com/sntosz/eng-soft.git
cd eng-soft
npm install
cp .env.local.example .env.local   # preencha os valores
npm run dev
```

### Variáveis de ambiente (`.env.local`)

| Variável | Obrigatória | Descrição |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | sim | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | sim | chave pública (client) |
| `SUPABASE_SERVICE_ROLE_KEY` | sim | chave service role (server only, nunca expor) |
| `JWT_SECRET` | sim | segredo para assinar o cookie `auth-token` |
| `RESEND_API_KEY` | não | envio do OTP de reset de senha (sem ela, o código vai pro log do servidor) |
| `EMAIL_FROM` | não | remetente dos e-mails |
| `NEXT_PUBLIC_PIX_KEY` | não | chave Pix exibida no checkout |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | não | WhatsApp exibido no checkout |

## Banco de dados

- `schema.sql` — snapshot completo para instalação nova.
- `supabase/migrations/` — deltas incrementais aplicados em ordem. Ao mudar o
  schema, atualize os dois lugares (estado final + nova migration).
- Local/CI: `npx supabase start` sobe o stack e aplica todas as migrations.
  Produção: aplique via SQL Editor do dashboard ou `npx supabase db push`.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | servidor de desenvolvimento |
| `npm run build` / `npm run start` | build e start de produção |
| `npm run lint` | ESLint |
| `npm run test:unit` | testes unitários (node:test + tsx, sem banco) |
| `npm run test:integration:orders` | teste de concorrência de pedidos — exige `SUPABASE_TEST_URL` e `SUPABASE_TEST_SERVICE_ROLE_KEY` apontando para Supabase **local** (`npx supabase start`) |
| `npm run test:e2e` | Playwright contra `npm run start` rodando |

## CI

`.github/workflows/ci.yml` roda em todo push/PR:

- **Lint & Build** — ESLint, testes unitários e `next build`
- **Integration** — Supabase local + teste de concorrência de pedidos
- **E2E** — Supabase local + Playwright (report vira artifact em falha)

## Convenções de API

- Paginação: `?limit=&offset=` (padrão 100, máx 200); respostas incluem `total`
- Filtros: `?upcoming=true|false` em `/api/events` e `/api/matches`;
  `?status=concluida|agendada` em `/api/matches`;
  `?includeInactive=true` em `/api/members`
- Membros usam soft-delete (`membros.ativo`) — pedidos e ingressos são preservados
- Escritas em banco passam pelo service role no backend; RLS mantém só leitura
  pública de produtos/partidas/eventos

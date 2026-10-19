# 🏆 A.A.A.E.S. - Associação Atlética Acadêmica Engenharia de Software
### Unigran Capital

Portal web oficial da **Associação Atlética Acadêmica de Engenharia de Software (A.A.A.E.S.)** da Unigran Capital. A plataforma oferece gestão completa de membros, loja oficial de produtos e mantos, acompanhamento de partidas esportivas, agenda de eventos e painel administrativo integrado.

---

## 📋 Sumário

- [Visão Geral](#-visão-geral)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Licença e Contribuição](#-licença-e-contribuição)

---

## 🚀 Visão Geral

A plataforma foi desenvolvida para conectar estudantes, atletas, torcedores e a diretoria da atlética em um único ambiente moderno e performático.

Permite que acadêmicos se associem, comprem produtos e mantos oficiais da loja, fiquem por dentro dos próximos jogos e campeonatos, acompanhem eventos universitários e visualizem sua carteirinha digital de membro.

---

## ✨ Funcionalidades Principais

### 🛍️ Lojinha Oficial
- Catálogo de produtos com fotos, descrições, preços e estoque em tempo real.
- Suporte a itens em destaque (ex: Mantos / Jerseys oficiais).
- Carrinho de compras interativo com resumo e processo de checkout.

### ⚽ Partidas e Campeonatos
- Exibição dos próximos jogos com contagem regressiva, local e data.
- Placares em tempo real de partidas passadas e ao vivo.
- Filtro por modalidades esportivas (Futsal, Vôlei, Basquete, eSports, Handball, etc.).

### 📅 Eventos da Atlética
- Calendário e lista de festas, recepção de calouros, treinos e eventos acadêmicos.
- Detalhes de ingressos, lote, valores e localização.

### 👤 Área do Membro & Autenticação
- Cadastro e login seguro de acadêmicos com validação de dados.
- Emissão de **Carteirinha Digital do Membro** interativa.
- Recuperação de senha via código OTP enviado por e-mail (integração Resend).
- Gerenciamento de perfil e dados acadêmicos.

### 🛠️ Painel Administrativo
- Controle de membros (listagem, inclusão, edição e permissões de administrador).
- Gestão de estoque e cadastro de produtos na Lojinha.
- Agendamento e gerenciamento de eventos e partidas esportivas.
- Upload e gerenciamento de mídias e imagens via Supabase Storage.

---

## 🛠️ Tecnologias Utilizadas

### Frontend & Framework
- **[Next.js 16](https://nextjs.org/)** (App Router)
- **[React 18](https://react.dev/)**
- **[TypeScript](https://www.typescriptlang.org/)**
- **[Tailwind CSS](https://tailwindcss.com/)**
- **[Shadcn UI](https://ui.shadcn.com/)** / **[Radix UI](https://www.radix-ui.com/)**
- **[Lucide React](https://lucide.dev/)** (Ícones)
- **[Recharts](https://recharts.org/)** & **[Embla Carousel](https://www.embla-carousel.com/)**

### Backend & Serviços
- **[Supabase](https://supabase.com/)** (Banco de dados PostgreSQL, Autenticação e Storage)
- **[TanStack React Query v5](https://tanstack.com/query/latest)** (Gerenciamento de estado e cache)
- **[Resend](https://resend.com/)** (Serviço de envio de e-mails para reset de senha)
- **[Zod](https://zod.dev/)** & **[React Hook Form](https://react-hook-form.com/)** (Validação de formulários)
- **[JWT](https://jwt.io/)** & **[BcryptJS](https://github.com/dcodeIO/bcrypt.js)**

---

## 📁 Estrutura do Projeto

```
eng-soft/
├── public/                     # Arquivos estáticos e imagens públicas
├── src/
│   ├── app/                    # Rotas e páginas do Next.js (App Router)
│   │   ├── api/                # Endpoints de API serverless
│   │   ├── events/             # Página de Eventos
│   │   ├── forgot-password/    # Recuperação e redefinição de senha
│   │   ├── login/              # Página de Login e Cadastro
│   │   ├── matches/            # Página de Partidas e Placares
│   │   ├── members/            # Área do Membro e Carteirinha
│   │   ├── settings/           # Configurações de conta
│   │   ├── store/              # Lojinha e produtos
│   │   ├── globals.css         # Estilos globais e Tailwind CSS
│   │   ├── layout.tsx          # Layout principal e Providers
│   │   └── page.tsx            # Página inicial (Landing / Showcase)
│   ├── components/             # Componentes reutilizáveis
│   │   ├── ui/                 # Componentes da biblioteca UI (Shadcn/Radix)
│   │   ├── CheckoutModal.tsx   # Modal de finalização de compra
│   │   ├── DashboardSidebar.tsx# Barra lateral administrativa
│   │   ├── MemberIdCard.tsx    # Carteirinha digital do membro
│   │   └── ...                 # Modais de cadastro/edição (Eventos, Produtos, Partidas)
│   ├── contexts/               # Contextos do React (Auth, Carrinho, etc.)
│   ├── hooks/                  # Custom Hooks (ex: useAuth)
│   ├── lib/                    # Utilitários e configurações (Supabase, Auth, Email)
│   ├── services/               # Serviços de API e chamadas assíncronas
│   └── types/                  # Definições de tipos TypeScript
├── .env.local.example          # Exemplo de variáveis de ambiente
├── schema.sql                  # Script SQL para criação de tabelas e políticas do Supabase
├── tailwind.config.mjs         # Configuração do Tailwind CSS
├── tsconfig.json               # Configuração do TypeScript
└── package.json                # Dependências e scripts do Node.js
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

---

## 🤝 Licença e Contribuição

Este projeto é mantido pela diretoria de tecnologia da **Associação Atlética Acadêmica Engenharia de Software Unigran Capital**.

Sinta-se à vontade para abrir *Issues* ou enviar *Pull Requests* com melhorias, correções de bugs ou novas funcionalidades!

---
<p align="center">
  Desenvolvido com 💚 pela <b>A.A.A.E.S. Unigran Capital</b>
</p>

# 🏆 A.A.A.E.S. - Associação Atlética Acadêmica Engenharia de Software
### Unigran Capital

Portal web oficial da **Associação Atlética Acadêmica de Engenharia de Software (A.A.A.E.S.)** da Unigran Capital. A plataforma oferece gestão completa de membros, loja oficial de produtos e mantos, acompanhamento de partidas esportivas, agenda de eventos e painel administrativo integrado.

---

## 📋 Sumário

- [Visão Geral](#-visão-geral)
- [Funcionalidades Principais](#-funcionalidades-principais)
- [Tecnologias Utilizadas](#-tecnologias-utilizadas)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Configuração do Banco de Dados](#-configuração-do-banco-de-dados)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Como Executar o Projeto](#-como-executar-o-projeto)
- [Scripts Disponíveis](#-scripts-disponíveis)
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

---

## 🗄️ Configuração do Banco de Dados

O projeto utiliza o **Supabase (PostgreSQL)**. Para criar a estrutura do banco de dados necessária, execute o conteúdo do arquivo [`schema.sql`](./schema.sql) no Editor SQL do seu projeto no Supabase Dashboard.

### Tabelas Criadas:
- `membros`: Cadastro de alunos, e-mail, curso, ano/turma, credenciais e flag `e_admin`.
- `produtos`: Itens da Lojinha (nome, descrição, preço, estoque, imagem_url e destaque).
- `pedidos`: Registro de compras realizadas na loja.
- `partidas`: Histórico e agendamento de jogos (time casa/fora, placares, data, campeonato, local).
- `eventos`: Cadastro de festas e eventos (data, local, imagem, preço de ingresso).

---

## 🔑 Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto baseando-se no arquivo `.env.local.example`:

```bash
cp .env.local.example .env.local
```

Preencha as variáveis com suas credenciais:

```env
# Configurações do Supabase (Acesse: Settings -> API no Supabase Dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon-publica
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-secreta

# Chave Secreta para assinatura de JWTs da aplicação
JWT_SECRET=seu-segredo-jwt-ultra-seguro

# Configuração do Resend para envio de e-mails de recuperação de senha (Opcional)
RESEND_API_KEY=re_sua_chave_api_resend
EMAIL_FROM="A.A.A.E.S. <noreply@resend.dev>"
```

---

## 💻 Como Executar o Projeto

### Pré-requisitos
- **Node.js**: v18.x ou superior
- **npm**, **yarn**, **pnpm** ou **bun**

### Passo a Passo

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/sntosz/eng-soft.git
   cd eng-soft
   ```

2. **Instalar as dependências:**
   > **Nota:** Devido a resoluções de pares de dependências do Next.js e ESLint, utilize a flag `--legacy-peer-deps`.
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configurar as variáveis de ambiente:**
   Copie `.env.local.example` para `.env.local` e preencha suas chaves do Supabase e JWT (veja a seção acima).

4. **Executar em modo de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acessar a aplicação:**
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 📜 Scripts Disponíveis

No arquivo `package.json`, você encontrará os seguintes comandos principais:

| Script | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento do Next.js em `http://localhost:3000` |
| `npm run build` | Compila o projeto otimizado para produção na pasta `.next` |
| `npm run start` | Inicia o servidor em modo de produção (após ter rodado `build`) |
| `npm run lint` | Executa o ESLint para verificar erros de código e padronização |

---

## 🤝 Licença e Contribuição

Este projeto é mantido pela diretoria de tecnologia da **Associação Atlética Acadêmica Engenharia de Software Unigran Capital**.

Sinta-se à vontade para abrir *Issues* ou enviar *Pull Requests* com melhorias, correções de bugs ou novas funcionalidades!

---
<p align="center">
  Desenvolvido com 💚 pela <b>A.A.A.E.S. Unigran Capital</b>
</p>

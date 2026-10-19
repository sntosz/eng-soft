# Welcome to your Associação Atlética Acadêmica Engenharia de Software Unigran Capital project

### How to execute:

```bash
git clone https://github.com/sntosz/eng-soft.git
cd eng-soft
npm install
npm run dev
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

## 🤝 Licença e Contribuição

Este projeto é mantido pela diretoria de tecnologia da **Associação Atlética Acadêmica Engenharia de Software Unigran Capital**.

Sinta-se à vontade para abrir *Issues* ou enviar *Pull Requests* com melhorias, correções de bugs ou novas funcionalidades!

---
<p align="center">
  Desenvolvido com 💚 pela <b>A.A.A.E.S. Unigran Capital</b>
</p>

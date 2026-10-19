-- Schema base: tabelas iniciais do projeto (estado pré-migrations).
-- Extraído de schema.sql para que `supabase db reset`/`supabase start`
-- consigam montar o banco do zero (local e CI).
-- As colunas/tabelas criadas pelos deltas subsequentes (rgm, senha_atualizada_em,
-- ingressos, solicitacoes_acesso, funções) ficam nas migrations seguintes.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.membros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  curso TEXT NOT NULL,
  ano_turma TEXT,
  e_admin BOOLEAN DEFAULT FALSE,
  senha_hash TEXT,
  senha_atualizada_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  estoque INTEGER NOT NULL DEFAULT 0,
  imagem_url TEXT,
  destaque BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pedidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  membro_id UUID REFERENCES public.membros(id) ON DELETE CASCADE,
  status_pedido TEXT NOT NULL DEFAULT 'Processando...',
  total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.itens_pedido (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES public.produtos(id) ON DELETE SET NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(10, 2) NOT NULL DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS public.partidas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  time_casa TEXT NOT NULL DEFAULT 'AAAES',
  time_visitante TEXT NOT NULL,
  data_partida TIMESTAMP WITH TIME ZONE NOT NULL,
  local_partida TEXT DEFAULT 'Arena Principal',
  tipo_confronto TEXT DEFAULT 'Melhor de 3',
  tag_partida TEXT DEFAULT 'Amistoso',
  concluida BOOLEAN DEFAULT FALSE,
  vitoria_atletica BOOLEAN DEFAULT FALSE,
  foto_casa TEXT,
  foto_visitante TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.eventos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  descricao TEXT,
  data_evento TIMESTAMP WITH TIME ZONE NOT NULL,
  local TEXT,
  imagem_url TEXT,
  preco DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Leitura pública de produtos" ON public.produtos FOR SELECT USING (true);
CREATE POLICY "Leitura pública de partidas" ON public.partidas FOR SELECT USING (true);
CREATE POLICY "Leitura pública de eventos" ON public.eventos FOR SELECT USING (true);

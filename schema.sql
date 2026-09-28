-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Membros
CREATE TABLE IF NOT EXISTS membros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  curso TEXT NOT NULL,
  ano_turma TEXT,
  e_admin BOOLEAN DEFAULT FALSE,
  senha_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Produtos
CREATE TABLE IF NOT EXISTS produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  estoque INTEGER NOT NULL DEFAULT 0,
  imagem_url TEXT,
  destaque BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Pedidos
CREATE TABLE IF NOT EXISTS pedidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  membro_id UUID REFERENCES membros(id) ON DELETE CASCADE,
  status_pedido TEXT NOT NULL DEFAULT 'Processando...',
  total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Itens do Pedido
CREATE TABLE IF NOT EXISTS itens_pedido (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pedido_id UUID REFERENCES pedidos(id) ON DELETE CASCADE,
  produto_id UUID REFERENCES produtos(id) ON DELETE SET NULL,
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(10, 2) NOT NULL DEFAULT 0.00
);

-- 5. Tabela de Partidas
CREATE TABLE IF NOT EXISTS partidas (
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

-- 6. Tabela de Eventos
CREATE TABLE IF NOT EXISTS eventos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  descricao TEXT,
  data_evento TIMESTAMP WITH TIME ZONE NOT NULL,
  local TEXT,
  imagem_url TEXT,
  preco DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE partidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública (vitrine, calendário e jogos visíveis)
CREATE POLICY "Leitura pública de produtos" ON produtos FOR SELECT USING (true);
CREATE POLICY "Leitura pública de partidas" ON partidas FOR SELECT USING (true);
CREATE POLICY "Leitura pública de eventos" ON eventos FOR SELECT USING (true);

-- As operações de escrita e dados sensíveis (senhas, pedidos, membros)
-- são gerenciadas com segurança pelo backend via Supabase Service Role (supabaseAdmin).

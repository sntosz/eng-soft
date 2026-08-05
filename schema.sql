-- Tabela de Membros
CREATE TABLE membros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  curso TEXT NOT NULL,
  ano_turma TEXT,
  e_admin BOOLEAN DEFAULT FALSE,
  senha_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Produtos
CREATE TABLE produtos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  descricao TEXT,
  preco DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  estoque INTEGER NOT NULL DEFAULT 0,
  imagem_url TEXT,
  destaque BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Pedidos
CREATE TABLE pedidos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  membro_id UUID REFERENCES membros(id),
  nome TEXT NOT NULL,
  status TEXT NOT NULL,
  pronto BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Partidas
CREATE TABLE partidas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  time_casa JSONB NOT NULL DEFAULT '{"short": "SWE", "name": "Software Eng."}',
  time_fora JSONB NOT NULL,
  placar_casa INTEGER,
  placar_fora INTEGER,
  data_partida TIMESTAMP WITH TIME ZONE NOT NULL,
  local TEXT,
  campeonato TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Eventos
CREATE TABLE eventos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  descricao TEXT,
  data_evento TIMESTAMP WITH TIME ZONE NOT NULL,
  local TEXT,
  imagem_url TEXT,
  preco DECIMAL(10, 2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security) e permitir tudo para simplificar inicialmente
ALTER TABLE membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE partidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow ALL on membros" ON membros FOR ALL USING (true);
CREATE POLICY "Allow ALL on produtos" ON produtos FOR ALL USING (true);
CREATE POLICY "Allow ALL on pedidos" ON pedidos FOR ALL USING (true);
CREATE POLICY "Allow ALL on partidas" ON partidas FOR ALL USING (true);
CREATE POLICY "Allow ALL on eventos" ON eventos FOR ALL USING (true);

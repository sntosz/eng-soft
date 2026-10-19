-- ============================================================================
-- schema.sql — snapshot COMPLETO do banco para instalação nova.
-- Para bancos já existentes, aplique apenas os deltas em supabase/migrations/
-- (cada arquivo é incremental). Ao alterar o schema, atualize os dois lugares:
-- aqui (estado final) e uma nova migration (delta).
-- ============================================================================

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
  senha_atualizada_em TIMESTAMP WITH TIME ZONE,
  ativo BOOLEAN NOT NULL DEFAULT TRUE,
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

-- 7. Tabela de Ingressos (reservas de eventos)
CREATE TABLE IF NOT EXISTS ingressos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  membro_id UUID NOT NULL REFERENCES membros(id) ON DELETE CASCADE,
  evento_id UUID NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  preco_unitario DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'reservado'
    CHECK (status IN ('reservado', 'pago', 'cancelado')),
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ingressos_membro_id_idx ON ingressos (membro_id);
CREATE INDEX IF NOT EXISTS ingressos_evento_id_idx ON ingressos (evento_id);

-- Habilitar RLS (Row Level Security)
ALTER TABLE membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_pedido ENABLE ROW LEVEL SECURITY;
ALTER TABLE ingressos ENABLE ROW LEVEL SECURITY;
ALTER TABLE partidas ENABLE ROW LEVEL SECURITY;
ALTER TABLE eventos ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública (vitrine, calendário e jogos visíveis)
CREATE POLICY "Leitura pública de produtos" ON produtos FOR SELECT USING (true);
CREATE POLICY "Leitura pública de partidas" ON partidas FOR SELECT USING (true);
CREATE POLICY "Leitura pública de eventos" ON eventos FOR SELECT USING (true);

-- As operações de escrita e dados sensíveis (senhas, pedidos, membros)
-- são gerenciadas com segurança pelo backend via Supabase Service Role (supabaseAdmin).

-- Solicitações de acesso: contas públicas só são criadas após validação manual do RGM.
ALTER TABLE public.membros
  ADD COLUMN IF NOT EXISTS rgm TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS membros_rgm_unique
  ON public.membros (rgm)
  WHERE rgm IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.solicitacoes_acesso (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  rgm TEXT NOT NULL,
  curso TEXT NOT NULL,
  ano_turma TEXT,
  senha_hash TEXT,
  status TEXT NOT NULL DEFAULT 'em_analise'
    CHECK (status IN ('em_analise', 'aprovada', 'recusada')),
  membro_id UUID REFERENCES public.membros(id) ON DELETE SET NULL,
  analisado_por UUID REFERENCES public.membros(id) ON DELETE SET NULL,
  analisado_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS solicitacoes_acesso_rgm_pendente_unique
  ON public.solicitacoes_acesso (rgm)
  WHERE status = 'em_analise';

CREATE UNIQUE INDEX IF NOT EXISTS solicitacoes_acesso_email_pendente_unique
  ON public.solicitacoes_acesso (email)
  WHERE status = 'em_analise';

ALTER TABLE public.solicitacoes_acesso ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.approve_member_access_request(
  p_request_id UUID,
  p_reviewed_by UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_request public.solicitacoes_acesso%ROWTYPE;
  v_member public.membros%ROWTYPE;
BEGIN
  SELECT *
  INTO v_request
  FROM public.solicitacoes_acesso
  WHERE id = p_request_id
    AND status = 'em_analise'
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'REQUEST_NOT_PENDING';
  END IF;

  INSERT INTO public.membros (nome, email, rgm, curso, ano_turma, senha_hash, e_admin)
  VALUES (
    v_request.nome,
    v_request.email,
    v_request.rgm,
    v_request.curso,
    v_request.ano_turma,
    v_request.senha_hash,
    FALSE
  )
  RETURNING * INTO v_member;

  UPDATE public.solicitacoes_acesso
  SET status = 'aprovada',
      membro_id = v_member.id,
      analisado_por = p_reviewed_by,
      analisado_em = NOW(),
      senha_hash = NULL
  WHERE id = p_request_id;

  RETURN jsonb_build_object('member_id', v_member.id);
END;
$function$;

REVOKE ALL ON FUNCTION public.approve_member_access_request(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.approve_member_access_request(UUID, UUID) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.approve_member_access_request(UUID, UUID) TO service_role;

-- Cancela um pedido atomicamente e repõe o estoque dos itens.
CREATE OR REPLACE FUNCTION public.cancel_order_atomic(
  p_pedido_id UUID,
  p_membro_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_pedido public.pedidos%ROWTYPE;
  v_item RECORD;
BEGIN
  SELECT * INTO v_pedido
  FROM public.pedidos WHERE id = p_pedido_id FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'ORDER_NOT_FOUND';
  END IF;

  IF p_membro_id IS NOT NULL AND v_pedido.membro_id != p_membro_id THEN
    RAISE EXCEPTION USING ERRCODE = 'P0003', MESSAGE = 'ORDER_NOT_OWNED';
  END IF;

  -- Membro só cancela pedidos em processamento; admin também pode cancelar
  -- pedidos já pagos que ainda não foram entregues.
  IF p_membro_id IS NOT NULL THEN
    IF v_pedido.status_pedido NOT IN ('Processando...') THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ORDER_NOT_CANCELABLE';
    END IF;
  ELSE
    IF v_pedido.status_pedido NOT IN ('Processando...', 'Pago / Aguardando Retirada') THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ORDER_NOT_CANCELABLE';
    END IF;
  END IF;

  FOR v_item IN
    SELECT produto_id, quantidade FROM public.itens_pedido WHERE pedido_id = p_pedido_id
  LOOP
    UPDATE public.produtos SET estoque = estoque + v_item.quantidade WHERE id = v_item.produto_id;
  END LOOP;

  UPDATE public.pedidos SET status_pedido = 'Cancelado' WHERE id = p_pedido_id RETURNING * INTO v_pedido;

  RETURN jsonb_build_object('pedido', to_jsonb(v_pedido));
END;
$function$;

REVOKE ALL ON FUNCTION public.cancel_order_atomic(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cancel_order_atomic(UUID, UUID) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_order_atomic(UUID, UUID) TO service_role;

-- Cria um pedido atomicamente e debita o estoque do produto.
CREATE OR REPLACE FUNCTION public.create_order_atomic(
  p_membro_id UUID,
  p_produto_id UUID,
  p_quantidade INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  v_preco NUMERIC(10, 2);
  v_novo_estoque INTEGER;
  v_pedido public.pedidos%ROWTYPE;
BEGIN
  IF p_quantidade IS NULL OR p_quantidade < 1 THEN
    RAISE EXCEPTION 'Quantidade inválida' USING ERRCODE = '22023';
  END IF;

  UPDATE public.produtos
  SET estoque = estoque - p_quantidade
  WHERE id = p_produto_id
    AND estoque >= p_quantidade
  RETURNING preco, estoque INTO v_preco, v_novo_estoque;

  IF NOT FOUND THEN
    IF EXISTS (SELECT 1 FROM public.produtos WHERE id = p_produto_id) THEN
      RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'INSUFFICIENT_STOCK';
    END IF;

    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'PRODUCT_NOT_FOUND';
  END IF;

  INSERT INTO public.pedidos (membro_id, status_pedido, total)
  VALUES (p_membro_id, 'Processando...', v_preco * p_quantidade)
  RETURNING * INTO v_pedido;

  INSERT INTO public.itens_pedido (pedido_id, produto_id, quantidade, preco_unitario)
  VALUES (v_pedido.id, p_produto_id, p_quantidade, v_preco);

  RETURN jsonb_build_object(
    'pedido', to_jsonb(v_pedido),
    'novo_estoque', v_novo_estoque
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.create_order_atomic(UUID, UUID, INTEGER) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.create_order_atomic(UUID, UUID, INTEGER) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_order_atomic(UUID, UUID, INTEGER) TO service_role;

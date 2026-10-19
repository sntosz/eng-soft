-- Reservas de ingressos para eventos
CREATE TABLE IF NOT EXISTS public.ingressos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  membro_id UUID NOT NULL REFERENCES public.membros(id) ON DELETE CASCADE,
  evento_id UUID NOT NULL REFERENCES public.eventos(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL CHECK (quantidade > 0),
  preco_unitario DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  status TEXT NOT NULL DEFAULT 'reservado'
    CHECK (status IN ('reservado', 'pago', 'cancelado')),
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ingressos_membro_id_idx ON public.ingressos (membro_id);
CREATE INDEX IF NOT EXISTS ingressos_evento_id_idx ON public.ingressos (evento_id);

ALTER TABLE public.ingressos ENABLE ROW LEVEL SECURITY;

-- Leitura/escrita acontece apenas via backend (service role), como pedidos.

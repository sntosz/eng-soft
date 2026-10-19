-- Soft delete de membros: em vez de excluir o registro (o que apagaria
-- pedidos e ingressos em cascade), o membro é marcado como inativo.
-- Membros inativos não aparecem na listagem nem conseguem autenticar.
ALTER TABLE public.membros
  ADD COLUMN IF NOT EXISTS ativo BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS membros_ativo_idx
  ON public.membros (ativo)
  WHERE ativo = FALSE;

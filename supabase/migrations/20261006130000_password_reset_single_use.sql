-- Marca o momento do último reset para invalidar tokens de recuperação já usados
ALTER TABLE public.membros
  ADD COLUMN IF NOT EXISTS senha_atualizada_em TIMESTAMPTZ;

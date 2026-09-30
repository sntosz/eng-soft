CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
  senha_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'em_analise'
    CHECK (status IN ('em_analise', 'aprovada', 'recusada')),
  membro_id UUID REFERENCES public.membros(id) ON DELETE SET NULL,
  analisado_por UUID REFERENCES public.membros(id) ON DELETE SET NULL,
  analisado_em TIMESTAMPTZ,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.solicitacoes_acesso
  ALTER COLUMN senha_hash DROP NOT NULL;

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

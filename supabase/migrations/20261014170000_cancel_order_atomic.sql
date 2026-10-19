-- Cancela um pedido atomicamente e repõe o estoque dos produtos.
-- Só permite cancelar pedidos que ainda NÃO foram cancelados/entregues.
CREATE OR REPLACE FUNCTION public.cancel_order_atomic(
  p_pedido_id UUID,
  p_membro_id UUID DEFAULT NULL  -- se informado, valida que o pedido pertence ao membro
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
  -- Trava o pedido para evitar race-condition
  SELECT *
  INTO v_pedido
  FROM public.pedidos
  WHERE id = p_pedido_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION USING ERRCODE = 'P0002', MESSAGE = 'ORDER_NOT_FOUND';
  END IF;

  -- Se p_membro_id foi informado, garante que é dono do pedido
  IF p_membro_id IS NOT NULL AND v_pedido.membro_id != p_membro_id THEN
    RAISE EXCEPTION USING ERRCODE = 'P0003', MESSAGE = 'ORDER_NOT_OWNED';
  END IF;

  -- Só permite cancelar se estiver em "Processando..."
  IF v_pedido.status_pedido NOT IN ('Processando...') THEN
    RAISE EXCEPTION USING ERRCODE = 'P0001', MESSAGE = 'ORDER_NOT_CANCELABLE';
  END IF;

  -- Repõe o estoque de cada item
  FOR v_item IN
    SELECT produto_id, quantidade
    FROM public.itens_pedido
    WHERE pedido_id = p_pedido_id
  LOOP
    UPDATE public.produtos
    SET estoque = estoque + v_item.quantidade
    WHERE id = v_item.produto_id;
  END LOOP;

  -- Atualiza o status do pedido
  UPDATE public.pedidos
  SET status_pedido = 'Cancelado'
  WHERE id = p_pedido_id
  RETURNING * INTO v_pedido;

  RETURN jsonb_build_object('pedido', to_jsonb(v_pedido));
END;
$function$;

REVOKE ALL ON FUNCTION public.cancel_order_atomic(UUID, UUID) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.cancel_order_atomic(UUID, UUID) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_order_atomic(UUID, UUID) TO service_role;

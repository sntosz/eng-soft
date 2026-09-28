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

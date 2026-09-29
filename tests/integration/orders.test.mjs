import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_TEST_URL;
const serviceRoleKey = process.env.SUPABASE_TEST_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "Defina SUPABASE_TEST_URL e SUPABASE_TEST_SERVICE_ROLE_KEY para executar o teste de integração."
  );
}

const hostname = new URL(supabaseUrl).hostname;
const isLocal = ["localhost", "127.0.0.1", "::1"].includes(hostname);

if (!isLocal && process.env.SUPABASE_TEST_ALLOW_REMOTE !== "I_KNOW_THIS_IS_NOT_PRODUCTION") {
  throw new Error(
    "Por segurança, o teste exige Supabase local. Para um projeto remoto exclusivo de testes, defina SUPABASE_TEST_ALLOW_REMOTE=I_KNOW_THIS_IS_NOT_PRODUCTION."
  );
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

test("duas compras concorrentes não vendem além do estoque e mantêm os registros consistentes", async () => {
  const memberId = randomUUID();
  const productId = randomUUID();
  const initialStock = 5;
  const requestedQuantity = 4;

  const { error: memberError } = await supabase.from("membros").insert({
    id: memberId,
    nome: "Teste de concorrência",
    email: `order-race-${memberId}@example.invalid`,
    curso: "Teste",
    ano_turma: "Teste",
    e_admin: false,
  });
  assert.equal(memberError, null, memberError?.message);

  try {
    const { error: productError } = await supabase.from("produtos").insert({
      id: productId,
      nome: "Produto de teste de concorrência",
      preco: 10,
      estoque: initialStock,
    });
    assert.equal(productError, null, productError?.message);

    const results = await Promise.all(
      Array.from({ length: 2 }, () =>
        supabase.rpc("create_order_atomic", {
          p_membro_id: memberId,
          p_produto_id: productId,
          p_quantidade: requestedQuantity,
        })
      )
    );

    const successfulOrders = results.filter(({ data, error }) => !error && data?.pedido);
    const rejectedOrders = results.filter(({ error }) => error);
    assert.equal(successfulOrders.length, 1, "Exatamente uma compra deve ser aceita");
    assert.equal(rejectedOrders.length, 1, "A outra compra deve falhar por falta de estoque");
    assert.equal(rejectedOrders[0].error.code, "P0001");
    assert.equal(rejectedOrders[0].error.message, "INSUFFICIENT_STOCK");

    const { data: product, error: stockError } = await supabase
      .from("produtos")
      .select("estoque")
      .eq("id", productId)
      .single();
    assert.equal(stockError, null, stockError?.message);
    assert.equal(product.estoque, initialStock - requestedQuantity);

    const { data: orders, error: ordersError } = await supabase
      .from("pedidos")
      .select("id, itens_pedido(quantidade, produto_id)")
      .eq("membro_id", memberId);
    assert.equal(ordersError, null, ordersError?.message);
    assert.equal(orders.length, 1, "Deve existir apenas um pedido confirmado");
    assert.deepEqual(orders[0].itens_pedido, [
      { quantidade: requestedQuantity, produto_id: productId },
    ]);
  } finally {
    const { error: memberCleanupError } = await supabase
      .from("membros")
      .delete()
      .eq("id", memberId);
    const { error: productCleanupError } = await supabase
      .from("produtos")
      .delete()
      .eq("id", productId);
    const cleanupErrors = [memberCleanupError, productCleanupError].filter(Boolean);
    assert.deepEqual(
      cleanupErrors,
      [],
      cleanupErrors.map(({ message }) => message).join("; ")
    );
  }
});

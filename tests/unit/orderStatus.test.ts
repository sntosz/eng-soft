import assert from "node:assert/strict";
import test from "node:test";
import {
  ORDER_STATUS,
  ORDER_STATUS_FILTERS,
  ORDER_STATUS_VALUES,
} from "../../src/lib/orderStatus";

test("ORDER_STATUS cobre todos os valores do banco", () => {
  const constantValues = Object.values(ORDER_STATUS);
  assert.deepEqual(constantValues, [...ORDER_STATUS_VALUES]);
});

test("filtros incluem 'all' e todos os status", () => {
  const filterValues = ORDER_STATUS_FILTERS.map((f) => f.value);
  assert.deepEqual(filterValues, ["all", ...ORDER_STATUS_VALUES]);
});

test("status usados nas migrations SQL estão sincronizados", () => {
  // Literais usados em cancel_order_atomic e no CHECK do banco.
  assert.equal(ORDER_STATUS.PROCESSING, "Processando...");
  assert.equal(ORDER_STATUS.PAID, "Pago / Aguardando Retirada");
  assert.equal(ORDER_STATUS.CANCELED, "Cancelado");
});

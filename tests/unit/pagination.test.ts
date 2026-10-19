import assert from "node:assert/strict";
import test from "node:test";
import { parsePagination } from "../../src/lib/pagination";

const params = (query: string) => new URLSearchParams(query);

test("retorna padrão limit=100 offset=0 sem parâmetros", () => {
  assert.deepEqual(parsePagination(params("")), { limit: 100, offset: 0 });
});

test("respeita limit e offset válidos", () => {
  assert.deepEqual(parsePagination(params("limit=50&offset=200")), {
    limit: 50,
    offset: 200,
  });
});

test("limita o máximo de 200 itens por página", () => {
  assert.equal(parsePagination(params("limit=9999")).limit, 200);
});

test("limit menor que 1 vira 1", () => {
  assert.equal(parsePagination(params("limit=0")).limit, 1);
  assert.equal(parsePagination(params("limit=-5")).limit, 1);
});

test("offset negativo vira 0", () => {
  assert.equal(parsePagination(params("offset=-10")).offset, 0);
});

test("valores não numéricos caem no padrão", () => {
  assert.deepEqual(parsePagination(params("limit=abc&offset=xyz")), {
    limit: 100,
    offset: 0,
  });
});

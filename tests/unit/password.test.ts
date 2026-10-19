import assert from "node:assert/strict";
import test from "node:test";
import { isStrongPassword } from "../../src/lib/password";

test("rejeita senha com menos de 8 caracteres", () => {
  assert.equal(isStrongPassword("abc123"), false);
  assert.equal(isStrongPassword("a1"), false);
});

test("rejeita senha sem letra", () => {
  assert.equal(isStrongPassword("12345678"), false);
});

test("rejeita senha sem número", () => {
  assert.equal(isStrongPassword("abcdefgh"), false);
});

test("aceita senha com 8+ caracteres, letras e números", () => {
  assert.equal(isStrongPassword("senha123"), true);
  assert.equal(isStrongPassword("Engenharia2026"), true);
});

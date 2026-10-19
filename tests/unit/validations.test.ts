import assert from "node:assert/strict";
import test from "node:test";
import {
  adminMemberCreateSchema,
  adminMemberUpdateSchema,
  registerSchema,
  resetPasswordSchema,
} from "../../src/lib/validations";

const validRegister = {
  name: "Membro Teste",
  email: "membro@unigran.br",
  rgm: "12345678",
  password: "senha123",
  curso: "Engenharia de Software",
  ano_curso: "2026.1",
};

test("registerSchema aceita senha forte", () => {
  assert.equal(registerSchema.safeParse(validRegister).success, true);
});

test("registerSchema rejeita senhas fracas", () => {
  for (const password of ["123", "12345678", "abcdefgh", "abc12"]) {
    const result = registerSchema.safeParse({ ...validRegister, password });
    assert.equal(result.success, false, `senha '${password}' deveria ser rejeitada`);
  }
});

test("resetPasswordSchema exige código de 6 dígitos e senha forte", () => {
  const base = {
    email: "membro@unigran.br",
    code: "123456",
    newPassword: "novaSenha1",
    resetToken: "token",
  };
  assert.equal(resetPasswordSchema.safeParse(base).success, true);
  assert.equal(
    resetPasswordSchema.safeParse({ ...base, code: "12345" }).success,
    false
  );
  assert.equal(
    resetPasswordSchema.safeParse({ ...base, newPassword: "fraca" }).success,
    false
  );
});

const validMember = {
  nome: "Membro Teste",
  email: "membro@unigran.br",
  curso: "Engenharia de Software",
  ano_curso: "2026.1",
};

test("adminMemberCreateSchema exige senha forte", () => {
  assert.equal(
    adminMemberCreateSchema.safeParse({ ...validMember, password: "senha123" }).success,
    true
  );
  assert.equal(
    adminMemberCreateSchema.safeParse({ ...validMember, password: "123" }).success,
    false
  );
});

test("adminMemberUpdateSchema aceita ativo para soft-delete/reativação", () => {
  const base = { id: crypto.randomUUID(), ...validMember };
  const parsed = adminMemberUpdateSchema.safeParse({ ...base, ativo: false });
  assert.equal(parsed.success, true);
  assert.equal(parsed.success && parsed.data.ativo, false);
});

// Regra única de senha forte: mínimo 8 caracteres, com letra e número.
// Usada nas validações client-side; no backend o equivalente é o
// strongPasswordSchema em lib/validations.ts.
export function isStrongPassword(password: string): boolean {
  return password.length >= 8 && /[A-Za-z]/.test(password) && /\d/.test(password);
}

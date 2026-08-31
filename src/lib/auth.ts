import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "";

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

// Guard against missing hashes (prevents bcrypt throwing on undefined)
export async function comparePassword(password: string, hash?: string) {
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

export function signToken(payload: Record<string, any>) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET not set");
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  if (!JWT_SECRET) throw new Error("JWT_SECRET not set");
  return jwt.verify(token, JWT_SECRET);
}

export function generateOtpCode(): string {
  // Gera código numérico aleatório de 6 dígitos (ex: 123456)
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  return code;
}

export function hashOtpCode(code: string, email: string): string {
  const secret = process.env.JWT_SECRET || "default_jwt_secret";
  return crypto
    .createHmac("sha256", secret)
    .update(`${code.trim()}:${email.toLowerCase().trim()}`)
    .digest("hex");
}

export function signResetToken(payload: Record<string, any>, expiresIn = "15m") {
  if (!JWT_SECRET) throw new Error("JWT_SECRET not set");
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyResetToken(token: string): Record<string, any> {
  if (!JWT_SECRET) throw new Error("JWT_SECRET not set");
  return jwt.verify(token, JWT_SECRET) as Record<string, any>;
}

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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

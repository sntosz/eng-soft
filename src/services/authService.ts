import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { comparePassword, signToken } from "@/lib/auth";

// Tries English schema first, falls back to Portuguese if needed
export async function authenticate(email: string, password: string) {
  // try English table
  let res = await supabaseAdmin
    .from("members")
    .select("id,name,email,password_hash")
    .eq("email", email)
    .maybeSingle();

  if (res.error) throw new Error(res.error.message);
  if (res.data) {
    const ok = await comparePassword(password, (res.data as any).password_hash);
    if (!ok) return null;
    const token = signToken({ sub: res.data.id, email: res.data.email, name: res.data.name });
    return { user: { id: res.data.id, name: res.data.name, email: res.data.email }, token };
  }

  // fallback to Portuguese table
  res = await supabaseAdmin
    .from("membros")
    .select("id,nome,email,senha_hash")
    .eq("email", email)
    .maybeSingle();

  if (res.error) throw new Error(res.error.message);
  if (!res.data) return null;

  const ok = await comparePassword(password, (res.data as any).senha_hash);
  if (!ok) return null;

  const token = signToken({ sub: res.data.id, email: res.data.email, name: res.data.nome });
  return { user: { id: res.data.id, name: res.data.nome, email: res.data.email }, token };
}

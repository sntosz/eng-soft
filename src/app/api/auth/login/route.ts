import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { comparePassword, signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body || {};

    if (!email || !password) {
      return NextResponse.json({ error: "Email ou Senha vazios" }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("membros")
      .select("id,nome,email,curso,senha_hash")
      .eq("email", email)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    // senha_hash is the column in the database; guard missing field
    const hash = (data as any).senha_hash || (data as any).password_hash || null;
    const match = await comparePassword(password, hash);
    if (!match) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const token = signToken({ sub: data.id, email: data.email, nome: data.nome, curso: (data as any).curso });

    return NextResponse.json({ user: { id: data.id, nome: data.nome, email: data.email, curso: (data as any).curso }, token });
  } catch (err: any) {
    console.error("Auth login error:", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, curso } = body || {};

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing name, email or password" }, { status: 400 });
    }

    const senha_hash = await hashPassword(password);

    const { data, error } = await supabaseAdmin
      .from("membros")
      .insert({ nome: name, email, senha_hash, curso: curso })
      .select("id,nome,email,curso")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const token = signToken({ sub: data.id, email: data.email, nome: data.nome, curso: (data as any).curso });

    return NextResponse.json({ user: { id: data.id, nome: data.nome, email: data.email, curso: (data as any).curso }, token });
  } catch (err: any) {
    console.error("Auth register error:", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

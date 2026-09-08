import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hashPassword, signToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, curso, ano_curso } = body || {};

    if (!name || !email || !password || !curso || !ano_curso) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const senha_hash = await hashPassword(password);

    const { data, error } = await supabaseAdmin
      .from("membros")
      .insert({ nome: name, email, senha_hash, curso: curso, ano_turma: ano_curso, e_admin: false })
      .select("id,nome,email,curso,ano_turma,e_admin")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const ano = (data as any).ano_turma;
    const token = signToken({
      sub: data.id,
      email: data.email,
      nome: data.nome,
      curso: (data as any).curso,
      ano_curso: ano,
      e_admin: false,
    });

    const response = NextResponse.json({
      user: {
        id: data.id,
        nome: data.nome,
        email: data.email,
        curso: (data as any).curso,
        ano_curso: ano,
        e_admin: false,
      },
    });

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.error("Auth register error:", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

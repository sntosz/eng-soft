import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hashPassword, signToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const parseResult = registerSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || "Dados de cadastro inválidos";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, email, password, curso, ano_curso } = parseResult.data;

    const senha_hash = await hashPassword(password);

    const { data, error } = await supabaseAdmin
      .from("membros")
      .insert({ nome: name, email, senha_hash, curso: curso, ano_turma: ano_curso, e_admin: false })
      .select("id,nome,email,curso,ano_turma,e_admin")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Não foi possível criar a conta." }, { status: 500 });
    }

    const ano = data.ano_turma;
    const token = signToken({
      sub: data.id,
      email: data.email,
      nome: data.nome,
      curso: data.curso,
      ano_curso: ano,
      e_admin: false,
    });

    const response = NextResponse.json({
      user: {
        id: data.id,
        nome: data.nome,
        email: data.email,
        curso: data.curso,
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
  } catch (err: unknown) {
    console.error("Auth register error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao criar conta" },
      { status: 500 }
    );
  }
}

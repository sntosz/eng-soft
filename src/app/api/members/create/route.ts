import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hashPassword } from "@/lib/auth";
import { requireAdmin } from "@/lib/authServer";
import { adminMemberCreateSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const body = await req.json().catch(() => null);
    const parseResult = adminMemberCreateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Dados do membro inválidos" },
        { status: 400 }
      );
    }
    const { nome, email, curso, ano_curso, password } = parseResult.data;

    const senha_hash = await hashPassword(password);

    const { data, error } = await supabaseAdmin
      .from("membros")
      .insert({ nome, email, curso, ano_turma: ano_curso, senha_hash })
      .select("id,nome,email,curso,ano_turma")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Não foi possível criar o membro." }, { status: 500 });
    }

    const member = {
      id: data.id,
      nome: data.nome,
      email: data.email,
      curso: data.curso,
      ano_curso: data.ano_turma
    };

    return NextResponse.json({ member });
  } catch (err: unknown) {
    console.error("Error creating member:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao criar membro" },
      { status: 500 }
    );
  }
}

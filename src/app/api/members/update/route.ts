import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hashPassword } from "@/lib/auth";
import { requireAdmin } from "@/lib/authServer";
import { adminMemberUpdateSchema } from "@/lib/validations";

export async function PUT(req: Request) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const body = await req.json().catch(() => null);
    const parseResult = adminMemberUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Dados do membro inválidos" },
        { status: 400 }
      );
    }

    const { id, nome, email, curso, ano_curso, password } = parseResult.data;
    const updateData: { nome: string; email: string; curso: string; ano_turma: string; senha_hash?: string } = {
      nome,
      email,
      curso,
      ano_turma: ano_curso,
    };

    if (password) {
      updateData.senha_hash = await hashPassword(password);
    }

    const { data, error } = await supabaseAdmin
      .from("membros")
      .update(updateData)
      .eq("id", id)
      .select("id,nome,email,curso,ano_turma")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Membro não encontrado." }, { status: 404 });
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
    console.error("Error updating member:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao atualizar membro" },
      { status: 500 }
    );
  }
}

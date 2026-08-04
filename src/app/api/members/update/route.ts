import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hashPassword } from "@/lib/auth";
import { requireAdmin } from "@/lib/authServer";

export async function PUT(req: Request) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const body = await req.json();
    const { id, nome, email, curso, ano_curso, password } = body || {};

    if (!id || !nome || !email || !curso || !ano_curso) {
      return NextResponse.json(
        { error: "ID, nome, email, curso e ano do curso são obrigatórios" },
        { status: 400 }
      );
    }

    const updateData: any = { nome, email, curso, ano_turma: ano_curso };

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

    const member = {
      id: data.id,
      nome: data.nome,
      email: data.email,
      curso: data.curso,
      ano_curso: (data as any).ano_turma
    };

    return NextResponse.json({ member });
  } catch (err: any) {
    console.error("Error updating member:", err);
    return NextResponse.json(
      { error: err.message || String(err) },
      { status: 500 }
    );
  }
}

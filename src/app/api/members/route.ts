import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/authServer";

export async function GET() {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const { data, error } = await supabaseAdmin
      .from("membros")
      .select("id,nome,email,curso,ano_turma,e_admin")
      .order("nome", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const members = (data || []).map((member: any) => ({
      id: member.id,
      nome: member.nome,
      email: member.email,
      curso: member.curso,
      ano_curso: member.ano_turma,
      e_admin: member.e_admin === true
    }));

    return NextResponse.json({ members });
  } catch (err: any) {
    console.error("Error fetching members:", err.message, err);
    return NextResponse.json({ error: err.message || "Erro ao buscar membros" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const body = await req.json().catch(() => ({}));
    const { id } = body || {};

    if (!id) {
      return NextResponse.json({ error: "ID do membro obrigatório" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.from("membros").delete().eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting member:", err);
    return NextResponse.json({ error: err.message || "Erro ao excluir membro" }, { status: 500 });
  }
}

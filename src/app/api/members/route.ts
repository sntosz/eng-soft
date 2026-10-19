import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/authServer";
import { parsePagination } from "@/lib/pagination";

// GET /api/members -> Lista membros ativos (apenas admin)
// ?limit= & ?offset= para paginação; ?includeInactive=true inclui desativados
export async function GET(req: Request) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const { searchParams } = new URL(req.url);
    const { limit, offset } = parsePagination(searchParams);
    const includeInactive = searchParams.get("includeInactive") === "true";

    let query = supabaseAdmin
      .from("membros")
      .select("id,nome,email,curso,ano_turma,e_admin,ativo", { count: "exact" })
      .order("nome", { ascending: true })
      .range(offset, offset + limit - 1);

    if (!includeInactive) {
      query = query.eq("ativo", true);
    }

    const { data, count, error } = await query;

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
      e_admin: member.e_admin === true,
      ativo: member.ativo !== false
    }));

    return NextResponse.json({ members, total: count ?? 0, limit, offset });
  } catch (err: any) {
    console.error("Error fetching members:", err.message, err);
    return NextResponse.json({ error: err.message || "Erro ao buscar membros" }, { status: 500 });
  }
}

// DELETE /api/members -> Desativa o membro (soft delete)
// O registro e o histórico (pedidos, ingressos) são preservados; para
// reativar, use PUT /api/members/update com { ativo: true }.
export async function DELETE(req: Request) {
  try {
    const { user, response } = await requireAdmin();
    if (response) return response;

    const body = await req.json().catch(() => ({}));
    const { id } = body || {};

    if (!id) {
      return NextResponse.json({ error: "ID do membro obrigatório" }, { status: 400 });
    }

    if (id === user.id) {
      return NextResponse.json(
        { error: "Você não pode desativar a própria conta." },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("membros")
      .update({ ativo: false })
      .eq("id", id)
      .eq("ativo", true)
      .select("id")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json(
        { error: "Membro não encontrado ou já está desativado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error deleting member:", err);
    return NextResponse.json({ error: err.message || "Erro ao excluir membro" }, { status: 500 });
  }
}

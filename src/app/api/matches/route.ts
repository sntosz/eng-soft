import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/authServer";

export const dynamic = "force-dynamic";

// GET /api/matches -> Lista partidas (público)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("partidas")
      .select("*")
      .order("data_partida", { ascending: true });

    if (error) {
      console.error("Erro ao buscar partidas:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ matches: data || [] });
  } catch (err: any) {
    console.error("Erro na rota GET /api/matches:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao buscar partidas" },
      { status: 500 }
    );
  }
}

// POST /api/matches -> Cria nova partida (admin)
export async function POST(req: Request) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const body = await req.json();
    const {
      time_casa,
      time_visitante,
      data_partida,
      local_partida,
      vitoria_atletica,
      foto_casa,
      foto_visitante,
      tipo_confronto,
      tag_partida,
    } = body || {};

    if (!time_casa?.trim() || !time_visitante?.trim() || !data_partida) {
      return NextResponse.json(
        { error: "Times e data da partida são obrigatórios." },
        { status: 400 }
      );
    }

    const { data: match, error } = await supabaseAdmin
      .from("partidas")
      .insert({
        time_casa: time_casa.trim(),
        time_visitante: time_visitante.trim(),
        data_partida: new Date(data_partida).toISOString(),
        local_partida: local_partida?.trim() || "Arena Principal",
        vitoria_atletica: Boolean(vitoria_atletica),
        foto_casa: foto_casa || "",
        foto_visitante: foto_visitante || "",
        tipo_confronto: tipo_confronto || "Melhor de 3",
        tag_partida: tag_partida || "Amistoso",
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar partida:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      match,
      message: "Partida criada com sucesso!",
    });
  } catch (err: any) {
    console.error("Erro na rota POST /api/matches:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao criar partida" },
      { status: 500 }
    );
  }
}

// PUT /api/matches -> Atualiza partida existente (admin)
export async function PUT(req: Request) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const body = await req.json();
    const {
      id,
      time_casa,
      time_visitante,
      data_partida,
      local_partida,
      vitoria_atletica,
      foto_casa,
      foto_visitante,
      tipo_confronto,
      tag_partida,
      concluida,
    } = body || {};

    if (!id) {
      return NextResponse.json(
        { error: "ID da partida é obrigatório." },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, any> = {};

    if (time_casa !== undefined) updatePayload.time_casa = time_casa.trim();
    if (time_visitante !== undefined) updatePayload.time_visitante = time_visitante.trim();
    if (data_partida) updatePayload.data_partida = new Date(data_partida).toISOString();
    if (local_partida !== undefined) updatePayload.local_partida = local_partida.trim();
    if (vitoria_atletica !== undefined) updatePayload.vitoria_atletica = Boolean(vitoria_atletica);
    if (foto_casa !== undefined) updatePayload.foto_casa = foto_casa;
    if (foto_visitante !== undefined) updatePayload.foto_visitante = foto_visitante;
    if (tipo_confronto !== undefined) updatePayload.tipo_confronto = tipo_confronto;
    if (tag_partida !== undefined) updatePayload.tag_partida = tag_partida;
    if (concluida !== undefined) updatePayload.concluida = Boolean(concluida);

    const { data: match, error } = await supabaseAdmin
      .from("partidas")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar partida:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      match,
      message: "Partida atualizada com sucesso!",
    });
  } catch (err: any) {
    console.error("Erro na rota PUT /api/matches:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao atualizar partida" },
      { status: 500 }
    );
  }
}

// DELETE /api/matches -> Exclui partida (admin)
export async function DELETE(req: Request) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body?.id;
    }

    if (!id) {
      return NextResponse.json(
        { error: "ID da partida é obrigatório." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("partidas")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao excluir partida:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Partida excluída com sucesso!",
    });
  } catch (err: any) {
    console.error("Erro na rota DELETE /api/matches:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao excluir partida" },
      { status: 500 }
    );
  }
}

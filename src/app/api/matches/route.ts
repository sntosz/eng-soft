import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/authServer";
import { matchSchema, matchUpdateSchema, uuidSchema } from "@/lib/validations";

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
  } catch (err: unknown) {
    console.error("Erro na rota GET /api/matches:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao buscar partidas" },
      { status: 500 }
    );
  }
}

// POST /api/matches -> Cria nova partida (admin)
export async function POST(req: Request) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const rawBody = await req.json().catch(() => ({}));
    const parseResult = matchSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || "Dados de partida inválidos";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

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
    } = parseResult.data;

    const { data: match, error } = await supabaseAdmin
      .from("partidas")
      .insert({
        time_casa,
        time_visitante,
        data_partida: new Date(data_partida).toISOString(),
        local_partida,
        vitoria_atletica,
        foto_casa,
        foto_visitante,
        tipo_confronto,
        tag_partida,
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
  } catch (err: unknown) {
    console.error("Erro na rota POST /api/matches:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno ao criar partida" },
      { status: 500 }
    );
  }
}

// PUT /api/matches -> Atualiza partida existente (admin)
export async function PUT(req: Request) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const rawBody = await req.json().catch(() => null);
    const parseResult = matchUpdateSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || "Dados de atualização inválidos";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { id, ...updatePayload } = parseResult.data;

    if (updatePayload.data_partida) {
      updatePayload.data_partida = new Date(updatePayload.data_partida).toISOString();
    }

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
  } catch (err: unknown) {
    console.error("Erro na rota PUT /api/matches:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno ao atualizar partida" },
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
    const idResult = uuidSchema.safeParse(searchParams.get("id"));
    let id = idResult.success ? idResult.data : null;

    if (!id) {
      const body = await req.json().catch(() => null);
      const bodyIdResult = uuidSchema.safeParse(
        typeof body === "object" && body !== null && "id" in body ? body.id : null
      );
      id = bodyIdResult.success ? bodyIdResult.data : null;
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
  } catch (err: unknown) {
    console.error("Erro na rota DELETE /api/matches:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno ao excluir partida" },
      { status: 500 }
    );
  }
}

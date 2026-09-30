import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/authServer";
import { eventSchema, eventUpdateSchema, uuidSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// GET /api/events -> Lista eventos (público)
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("eventos")
      .select("*")
      .order("data_evento", { ascending: true });

    if (error) {
      console.error("Erro ao buscar eventos:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ events: data || [] });
  } catch (err: unknown) {
    console.error("Erro na rota GET /api/events:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao buscar eventos" },
      { status: 500 }
    );
  }
}

// POST /api/events -> Cria novo evento (admin)
export async function POST(req: Request) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const rawBody = await req.json().catch(() => ({}));
    const parseResult = eventSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || "Dados de evento inválidos";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const {
      nome,
      descricao,
      data_evento,
      local,
      imagem_url,
      preco,
    } = parseResult.data;

    const { data: event, error } = await supabaseAdmin
      .from("eventos")
      .insert({
        nome,
        descricao,
        data_evento: new Date(data_evento).toISOString(),
        local,
        imagem_url,
        preco,
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar evento:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      event,
      message: "Evento criado com sucesso!",
    });
  } catch (err: unknown) {
    console.error("Erro na rota POST /api/events:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno ao criar evento" },
      { status: 500 }
    );
  }
}

// PUT /api/events -> Atualiza evento existente (admin)
export async function PUT(req: Request) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const rawBody = await req.json().catch(() => null);
    const parseResult = eventUpdateSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || "Dados de atualização inválidos";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { id, ...updatePayload } = parseResult.data;

    if (updatePayload.data_evento) {
      updatePayload.data_evento = new Date(updatePayload.data_evento).toISOString();
    }

    const { data: event, error } = await supabaseAdmin
      .from("eventos")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Erro ao atualizar evento:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      event,
      message: "Evento atualizado com sucesso!",
    });
  } catch (err: unknown) {
    console.error("Erro na rota PUT /api/events:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno ao atualizar evento" },
      { status: 500 }
    );
  }
}

// DELETE /api/events -> Exclui evento (admin)
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
        { error: "ID do evento é obrigatório." },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from("eventos")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao excluir evento:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Evento excluído com sucesso!",
    });
  } catch (err: unknown) {
    console.error("Erro na rota DELETE /api/events:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro interno ao excluir evento" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/authServer";

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
  } catch (err: any) {
    console.error("Erro na rota GET /api/events:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao buscar eventos" },
      { status: 500 }
    );
  }
}

// POST /api/events -> Cria novo evento (admin)
export async function POST(req: Request) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const body = await req.json();
    const {
      nome,
      descricao,
      data_evento,
      local,
      imagem_url,
      preco,
    } = body || {};

    if (!nome?.trim() || !data_evento) {
      return NextResponse.json(
        { error: "Nome e data do evento são obrigatórios." },
        { status: 400 }
      );
    }

    const { data: event, error } = await supabaseAdmin
      .from("eventos")
      .insert({
        nome: nome.trim(),
        descricao: descricao?.trim() || "",
        data_evento: new Date(data_evento).toISOString(),
        local: local?.trim() || "Local a definir",
        imagem_url: imagem_url || "",
        preco: Number(preco) || 0,
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
  } catch (err: any) {
    console.error("Erro na rota POST /api/events:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao criar evento" },
      { status: 500 }
    );
  }
}

// PUT /api/events -> Atualiza evento existente (admin)
export async function PUT(req: Request) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const body = await req.json();
    const {
      id,
      nome,
      descricao,
      data_evento,
      local,
      imagem_url,
      preco,
    } = body || {};

    if (!id) {
      return NextResponse.json(
        { error: "ID do evento é obrigatório." },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, any> = {};

    if (nome !== undefined) updatePayload.nome = nome.trim();
    if (descricao !== undefined) updatePayload.descricao = descricao.trim();
    if (data_evento) updatePayload.data_evento = new Date(data_evento).toISOString();
    if (local !== undefined) updatePayload.local = local.trim();
    if (imagem_url !== undefined) updatePayload.imagem_url = imagem_url;
    if (preco !== undefined) updatePayload.preco = Number(preco) || 0;

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
  } catch (err: any) {
    console.error("Erro na rota PUT /api/events:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao atualizar evento" },
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
    let id = searchParams.get("id");

    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body?.id;
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
  } catch (err: any) {
    console.error("Erro na rota DELETE /api/events:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao excluir evento" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthUser } from "@/lib/authServer";
import { createTicketSchema, updateTicketStatusSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

// GET /api/tickets -> Lista ingressos (admin vê todos; membro vê apenas os próprios)
export async function GET() {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: "Você precisa estar autenticado." },
        { status: 401 }
      );
    }

    let query = supabaseAdmin
      .from("ingressos")
      .select(`
        id,
        membro_id,
        evento_id,
        quantidade,
        preco_unitario,
        total,
        status,
        criado_em,
        membros ( nome, email, curso ),
        eventos ( id, nome, data_evento, local, imagem_url )
      `)
      .order("criado_em", { ascending: false });

    if (!user.e_admin) {
      query = query.eq("membro_id", user.id);
    }

    const { data: ingressos, error } = await query;

    if (error) {
      console.error("Erro ao buscar ingressos:", error);
      return NextResponse.json(
        { error: "Erro ao carregar lista de ingressos." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ingressos: ingressos || [] });
  } catch (err: any) {
    console.error("Erro na rota GET /api/tickets:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno no servidor." },
      { status: 500 }
    );
  }
}

// POST /api/tickets -> Reserva ingressos para um evento
export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: "Faça login para reservar ingressos." },
        { status: 401 }
      );
    }

    const rawBody = await req.json().catch(() => ({}));
    const parseResult = createTicketSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || "Dados de reserva inválidos";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { evento_id, quantidade } = parseResult.data;

    const { data: evento, error: eventoError } = await supabaseAdmin
      .from("eventos")
      .select("id,nome,preco,data_evento")
      .eq("id", evento_id)
      .maybeSingle();

    if (eventoError) {
      console.error("Erro ao consultar evento:", eventoError);
      return NextResponse.json(
        { error: "Erro ao validar o evento." },
        { status: 500 }
      );
    }

    if (!evento) {
      return NextResponse.json(
        { error: "Evento não encontrado." },
        { status: 404 }
      );
    }

    const precoUnitario = Number(evento.preco) || 0;
    const total = precoUnitario * quantidade;

    const { data: ingresso, error } = await supabaseAdmin
      .from("ingressos")
      .insert({
        membro_id: user.id,
        evento_id,
        quantidade,
        preco_unitario: precoUnitario,
        total,
      })
      .select("*")
      .single();

    if (error) {
      console.error("Erro ao reservar ingresso:", error);
      return NextResponse.json(
        { error: "Erro ao reservar ingresso no banco de dados." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ingresso,
      message: "Ingresso(s) reservado(s) com sucesso!",
    });
  } catch (err: any) {
    console.error("Erro na rota POST /api/tickets:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao processar reserva." },
      { status: 500 }
    );
  }
}

// PUT /api/tickets -> Atualiza o status de uma reserva (Apenas Admin)
export async function PUT(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user || !user.e_admin) {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem atualizar o status." },
        { status: 403 }
      );
    }

    const rawBody = await req.json().catch(() => ({}));
    const parseResult = updateTicketStatusSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || "Dados de status inválidos";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { ingresso_id, status } = parseResult.data;

    const { data: ingressoAtualizado, error } = await supabaseAdmin
      .from("ingressos")
      .update({ status })
      .eq("id", ingresso_id)
      .select("*")
      .single();

    if (error || !ingressoAtualizado) {
      console.error("Erro ao atualizar status do ingresso:", error);
      return NextResponse.json(
        { error: "Não foi possível atualizar o status do ingresso." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      ingresso: ingressoAtualizado,
      message: "Status do ingresso atualizado com sucesso!",
    });
  } catch (err: any) {
    console.error("Erro na rota PUT /api/tickets:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao atualizar status." },
      { status: 500 }
    );
  }
}

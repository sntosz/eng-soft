import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthUser } from "@/lib/authServer";
import { createOrderSchema, updateOrderStatusSchema, cancelOrderSchema } from "@/lib/validations";
import { ORDER_STATUS } from "@/lib/orderStatus";

export const dynamic = "force-dynamic";

// GET /api/orders -> Lista pedidos (se admin, lista todos com informações do membro e produtos)
export async function GET(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: "Você precisa estar autenticado." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const rawLimit = Number.parseInt(searchParams.get("limit") ?? "", 10);
    const rawOffset = Number.parseInt(searchParams.get("offset") ?? "", 10);
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(rawLimit, 1), 200)
      : 100;
    const offset = Number.isFinite(rawOffset) ? Math.max(rawOffset, 0) : 0;

    let query = supabaseAdmin
      .from("pedidos")
      .select(`
        id,
        membro_id,
        status_pedido,
        total,
        criado_em,
        membros ( nome, email, curso, ano_turma ),
        itens_pedido (
          id,
          quantidade,
          preco_unitario,
          produtos ( id, nome, imagem_url )
        )
      `, { count: "exact" })
      .order("criado_em", { ascending: false })
      .range(offset, offset + limit - 1);

    // Se não for admin, filtra apenas os pedidos do próprio usuário
    if (!user.e_admin) {
      query = query.eq("membro_id", user.id);
    }

    const { data: pedidos, count, error } = await query;

    if (error) {
      console.error("Erro ao buscar pedidos:", error);
      return NextResponse.json(
        { error: "Erro ao carregar lista de pedidos." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      pedidos: pedidos || [],
      total: count ?? 0,
      limit,
      offset,
    });
  } catch (err: any) {
    console.error("Erro na rota GET /api/orders:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno no servidor." },
      { status: 500 }
    );
  }
}

// POST /api/orders -> Cria um novo pedido
export async function POST(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: "Faça login para realizar pedidos na loja." },
        { status: 401 }
      );
    }

    const rawBody = await req.json().catch(() => ({}));
    const parseResult = createOrderSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || "Dados de pedido inválidos";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { produto_id, quantidade } = parseResult.data;
    const { data, error } = await supabaseAdmin.rpc("create_order_atomic", {
      p_membro_id: user.id,
      p_produto_id: produto_id,
      p_quantidade: quantidade,
    });

    if (error) {
      if (error.code === "P0002") {
        return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
      }

      if (error.code === "P0001" && error.message === "INSUFFICIENT_STOCK") {
        return NextResponse.json(
          { error: "Estoque insuficiente para a quantidade solicitada." },
          { status: 409 }
        );
      }

      console.error("Erro ao criar pedido:", error);
      return NextResponse.json(
        { error: "Erro ao criar pedido no banco de dados." },
        { status: 500 }
      );
    }

    if (!data?.pedido || typeof data.novo_estoque !== "number") {
      console.error("A função create_order_atomic retornou uma resposta inválida.");
      return NextResponse.json(
        { error: "Erro ao criar pedido no banco de dados." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      pedido: data.pedido,
      novo_estoque: data.novo_estoque,
      message: "Pedido realizado com sucesso!",
    });
  } catch (err: any) {
    console.error("Erro na rota POST /api/orders:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao processar pedido." },
      { status: 500 }
    );
  }
}

// PUT /api/orders -> Atualiza o status de um pedido (Apenas Admin)
// Quando o admin cancela, usa cancel_order_atomic para repor estoque.
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
    const parseResult = updateOrderStatusSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || "Dados de status inválidos";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { pedido_id, status_pedido } = parseResult.data;

    // Se for cancelamento, usa a função atômica para repor estoque
    if (status_pedido === ORDER_STATUS.CANCELED) {
      const { data, error } = await supabaseAdmin.rpc("cancel_order_atomic", {
        p_pedido_id: pedido_id,
        // admin não precisa validar ownership, passa null
        p_membro_id: null,
      });

      if (error) {
        if (error.message === "ORDER_NOT_FOUND") {
          return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
        }
        if (error.message === "ORDER_NOT_CANCELABLE") {
          return NextResponse.json(
            { error: "Este pedido não pode mais ser cancelado (já foi pago, entregue ou cancelado)." },
            { status: 409 }
          );
        }
        console.error("Erro ao cancelar pedido (admin):", error);
        return NextResponse.json(
          { error: "Não foi possível cancelar o pedido." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        pedido: data?.pedido,
        message: "Pedido cancelado e estoque reposto com sucesso!",
      });
    }

    // Para outros status, faz update condicional: um pedido "Cancelado" é
    // final e não pode ser reativado (o estoque já foi reposto).
    const { data: pedidoAtualizado, error } = await supabaseAdmin
      .from("pedidos")
      .update({ status_pedido })
      .eq("id", pedido_id)
      .neq("status_pedido", ORDER_STATUS.CANCELED)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error("Erro ao atualizar status do pedido:", error);
      return NextResponse.json(
        { error: "Não foi possível atualizar o status do pedido." },
        { status: 500 }
      );
    }

    if (!pedidoAtualizado) {
      const { data: pedidoAtual } = await supabaseAdmin
        .from("pedidos")
        .select("status_pedido")
        .eq("id", pedido_id)
        .maybeSingle();

      if (!pedidoAtual) {
        return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
      }

      return NextResponse.json(
        { error: "Pedidos cancelados não podem ser reativados." },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      pedido: pedidoAtualizado,
      message: "Status do pedido atualizado com sucesso!",
    });
  } catch (err: any) {
    console.error("Erro na rota PUT /api/orders:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao atualizar status." },
      { status: 500 }
    );
  }
}

// PATCH /api/orders -> Cancelamento de pedido pelo próprio cliente
// Só permite cancelar pedidos com status "Processando..."
export async function PATCH(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json(
        { error: "Você precisa estar autenticado para cancelar pedidos." },
        { status: 401 }
      );
    }

    const rawBody = await req.json().catch(() => ({}));
    const parseResult = cancelOrderSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || "Dados inválidos";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { pedido_id } = parseResult.data;

    const { data, error } = await supabaseAdmin.rpc("cancel_order_atomic", {
      p_pedido_id: pedido_id,
      p_membro_id: user.id, // valida que o pedido pertence ao usuário
    });

    if (error) {
      if (error.message === "ORDER_NOT_FOUND") {
        return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
      }
      if (error.message === "ORDER_NOT_OWNED") {
        return NextResponse.json(
          { error: "Você não tem permissão para cancelar este pedido." },
          { status: 403 }
        );
      }
      if (error.message === "ORDER_NOT_CANCELABLE") {
        return NextResponse.json(
          { error: "Este pedido não pode mais ser cancelado. Apenas pedidos em processamento podem ser cancelados." },
          { status: 409 }
        );
      }

      console.error("Erro ao cancelar pedido:", error);
      return NextResponse.json(
        { error: "Não foi possível cancelar o pedido." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      pedido: data?.pedido,
      message: "Pedido cancelado com sucesso! O estoque foi reposto.",
    });
  } catch (err: any) {
    console.error("Erro na rota PATCH /api/orders:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao cancelar pedido." },
      { status: 500 }
    );
  }
}

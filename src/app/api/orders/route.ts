import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthUser } from "@/lib/authServer";

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
      `)
      .order("criado_em", { ascending: false });

    // Se não for admin, filtra apenas os pedidos do próprio usuário
    if (!user.e_admin) {
      query = query.eq("membro_id", user.id);
    }

    const { data: pedidos, error } = await query;

    if (error) {
      console.error("Erro ao buscar pedidos:", error);
      return NextResponse.json(
        { error: "Erro ao carregar lista de pedidos." },
        { status: 500 }
      );
    }

    return NextResponse.json({ pedidos: pedidos || [] });
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

    const body = await req.json();
    const { produto_id, quantidade = 1 } = body || {};

    if (!produto_id) {
      return NextResponse.json(
        { error: "ID do produto é obrigatório." },
        { status: 400 }
      );
    }

    const qtd = parseInt(quantidade, 10);
    if (isNaN(qtd) || qtd <= 0) {
      return NextResponse.json(
        { error: "A quantidade informada é inválida." },
        { status: 400 }
      );
    }

    // Busca o produto atualizado
    const { data: produto, error: prodErr } = await supabaseAdmin
      .from("produtos")
      .select("id, nome, preco, estoque")
      .eq("id", produto_id)
      .maybeSingle();

    if (prodErr || !produto) {
      return NextResponse.json(
        { error: "Produto não encontrado." },
        { status: 404 }
      );
    }

    if (produto.estoque < qtd) {
      return NextResponse.json(
        {
          error: `Estoque insuficiente. Restam apenas ${produto.estoque} unidades disponíveis.`,
        },
        { status: 400 }
      );
    }

    const valorUnitario = Number(produto.preco) || 0;
    const total = valorUnitario * qtd;

    // 1. Cria o registro do pedido
    const { data: pedido, error: pedErr } = await supabaseAdmin
      .from("pedidos")
      .insert({
        membro_id: user.id,
        status_pedido: "Processando...",
        total,
      })
      .select("id, membro_id, status_pedido, total, criado_em")
      .single();

    if (pedErr || !pedido) {
      console.error("Erro ao criar pedido:", pedErr);
      return NextResponse.json(
        { error: "Erro ao criar pedido no banco de dados." },
        { status: 500 }
      );
    }

    // 2. Insere os itens vinculados ao pedido
    const { error: itemErr } = await supabaseAdmin.from("itens_pedido").insert({
      pedido_id: pedido.id,
      produto_id: produto.id,
      quantidade: qtd,
      preco_unitario: valorUnitario,
    });

    if (itemErr) {
      console.error("Erro ao vincular item ao pedido:", itemErr);
    }

    // 3. Atualiza o estoque do produto
    const novoEstoque = Math.max(0, produto.estoque - qtd);
    await supabaseAdmin
      .from("produtos")
      .update({ estoque: novoEstoque })
      .eq("id", produto.id);

    return NextResponse.json({
      success: true,
      pedido,
      novo_estoque: novoEstoque,
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
export async function PUT(req: Request) {
  try {
    const user = await getAuthUser();
    if (!user || !user.e_admin) {
      return NextResponse.json(
        { error: "Acesso negado. Apenas administradores podem atualizar o status." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { pedido_id, status_pedido } = body || {};

    if (!pedido_id || !status_pedido) {
      return NextResponse.json(
        { error: "ID do pedido e novo status são obrigatórios." },
        { status: 400 }
      );
    }

    const { data: pedidoAtualizado, error } = await supabaseAdmin
      .from("pedidos")
      .update({ status_pedido })
      .eq("id", pedido_id)
      .select("*")
      .single();

    if (error || !pedidoAtualizado) {
      console.error("Erro ao atualizar status do pedido:", error);
      return NextResponse.json(
        { error: "Não foi possível atualizar o status do pedido." },
        { status: 500 }
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

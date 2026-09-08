import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getAuthUser } from "@/lib/authServer";

export const dynamic = "force-dynamic";

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
    console.error("Erro na rota /api/orders:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno ao processar pedido." },
      { status: 500 }
    );
  }
}

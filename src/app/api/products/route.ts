import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { mapProduct, parseProductPayload, removeProductImage } from "@/lib/products";
import { requireAdmin } from "@/lib/authServer";

export const dynamic = "force-dynamic";

// Vitrine é pública: visitante também vê os produtos.
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("produtos")
      .select("id,nome,descricao,preco,estoque,imagem_url,destaque")
      .order("destaque", { ascending: false })
      .order("nome", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ products: (data || []).map(mapProduct) });
  } catch (err: any) {
    console.error("Error fetching products:", err.message, err);
    return NextResponse.json(
      { error: err.message || "Erro ao buscar produtos" },
      { status: 500 }
    );
  }
}

// Atualizar produto existente (apenas admin)
export async function PUT(req: Request) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const body = await req.json();
    const { id, ...data } = body || {};

    if (!id) {
      return NextResponse.json({ error: "ID do produto é obrigatório" }, { status: 400 });
    }

    const { payload, error: validationError } = parseProductPayload(data);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { data: updated, error } = await supabaseAdmin
      .from("produtos")
      .update(payload)
      .eq("id", id)
      .select("id,nome,descricao,preco,estoque,imagem_url,destaque")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: mapProduct(updated) });
  } catch (err: any) {
    console.error("Error updating product:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao atualizar produto" },
      { status: 500 }
    );
  }
}

// Excluir produto existente (apenas admin)
export async function DELETE(req: Request) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID do produto é obrigatório" }, { status: 400 });
    }

    // Busca a imagem atual para limpeza do storage
    const { data: prod } = await supabaseAdmin
      .from("produtos")
      .select("imagem_url")
      .eq("id", id)
      .maybeSingle();

    if (prod?.imagem_url) {
      await removeProductImage(prod.imagem_url);
    }

    const { error } = await supabaseAdmin.from("produtos").delete().eq("id", id);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Produto excluído com sucesso" });
  } catch (err: any) {
    console.error("Error deleting product:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao excluir produto" },
      { status: 500 }
    );
  }
}

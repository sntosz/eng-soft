import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { mapProduct, removeProductImage } from "@/lib/products";
import { requireAdmin } from "@/lib/authServer";
import { productUpdateSchema, uuidSchema } from "@/lib/validations";

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
  } catch (err: unknown) {
    console.error("Error fetching products:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao buscar produtos" },
      { status: 500 }
    );
  }
}

// Atualizar produto existente (apenas admin)
export async function PUT(req: Request) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const body = await req.json().catch(() => null);
    const parseResult = productUpdateSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { error: parseResult.error.errors[0]?.message || "Dados do produto inválidos" },
        { status: 400 }
      );
    }
    const { id, ...payload } = parseResult.data;

    const { data: updated, error } = await supabaseAdmin
      .from("produtos")
      .update(payload)
      .eq("id", id)
      .select("id,nome,descricao,preco,estoque,imagem_url,destaque")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!updated) {
      return NextResponse.json({ error: "Produto não encontrado." }, { status: 404 });
    }

    return NextResponse.json({ product: mapProduct(updated) });
  } catch (err: unknown) {
    console.error("Error updating product:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao atualizar produto" },
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
    const idResult = uuidSchema.safeParse(searchParams.get("id"));
    const id = idResult.success ? idResult.data : null;

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
  } catch (err: unknown) {
    console.error("Error deleting product:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao excluir produto" },
      { status: 500 }
    );
  }
}

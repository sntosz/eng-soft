import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { mapProduct } from "@/lib/products";

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

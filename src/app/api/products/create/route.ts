import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/authServer";
import { mapProduct, parseProductPayload } from "@/lib/products";

export async function POST(req: Request) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const body = await req.json().catch(() => null);
    const parseResult = parseProductPayload(body);
    if (!parseResult.success) {
      return NextResponse.json({ error: parseResult.error }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("produtos")
      .insert(parseResult.payload)
      .select("id,nome,descricao,preco,estoque,imagem_url,destaque")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Não foi possível criar o produto." }, { status: 500 });
    }

    return NextResponse.json({ product: mapProduct(data) });
  } catch (err: unknown) {
    console.error("Error creating product:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erro ao criar produto" },
      { status: 500 }
    );
  }
}

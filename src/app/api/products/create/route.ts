import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/authServer";
import { mapProduct, parseProductPayload } from "@/lib/products";

export async function POST(req: Request) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const body = await req.json();
    const { payload, error: validationError } = parseProductPayload(body);

    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from("produtos")
      .insert(payload)
      .select("id,nome,descricao,preco,estoque,imagem_url,destaque")
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ product: mapProduct(data) });
  } catch (err: any) {
    console.error("Error creating product:", err);
    return NextResponse.json(
      { error: err.message || String(err) },
      { status: 500 }
    );
  }
}

import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { BUCKETS } from "@/lib/supabase";
import { Product } from "@/types";
import { productPayloadSchema } from "@/lib/validations";

export const PRODUCT_IMAGE_BUCKET = BUCKETS.PRODUTOS;


type ProductRow = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number | string;
  estoque: number | null;
  imagem_url: string | null;
  destaque: boolean | null;
  created_at?: string;
};

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    nome: row.nome,
    descricao: row.descricao,
    preco: Number(row.preco),
    estoque: row.estoque ?? 0,
    imagem_url: row.imagem_url,
    destaque: row.destaque === true
  };
}

/**
 * Extrai o path dentro do bucket a partir da URL pública.
 * Retorna null para URLs de outra origem (ex: imagem hospedada fora).
 */
export function storagePathFromPublicUrl(url?: string | null): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${PRODUCT_IMAGE_BUCKET}/`;
  const index = url.indexOf(marker);
  if (index === -1) return null;
  const path = url.slice(index + marker.length);
  return path || null;
}

/** Remove a imagem do bucket. Falha aqui não deve derrubar a operação principal. */
export async function removeProductImage(url?: string | null) {
  const path = storagePathFromPublicUrl(url);
  if (!path) return;

  const { error } = await supabaseAdmin.storage.from(PRODUCT_IMAGE_BUCKET).remove([path]);
  if (error) {
    console.error("Failed to remove product image:", path, error.message);
  }
}

export type ProductPayload = ReturnType<typeof productPayloadSchema.parse>;

/** Valida e normaliza o body de create/update. */
export function parseProductPayload(
  body: unknown
): { success: true; payload: ProductPayload } | { success: false; error: string } {
  const result = productPayloadSchema.safeParse(body);
  if (!result.success) {
    return { success: false, error: result.error.errors[0]?.message || "Dados do produto inválidos" };
  }

  return { success: true, payload: result.data };
}

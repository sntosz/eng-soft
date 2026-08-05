import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { BUCKETS } from "@/lib/supabase";
import { Product } from "@/types";

export const PRODUCT_IMAGE_BUCKET = BUCKETS.PRODUTOS;


export function mapProduct(row: any): Product {
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

export type ProductPayload = {
  nome: string;
  descricao: string | null;
  preco: number;
  estoque: number;
  imagem_url: string | null;
  destaque: boolean;
};

/** Valida e normaliza o body de create/update. */
export function parseProductPayload(
  body: any
): { payload: ProductPayload; error?: never } | { payload?: never; error: string } {
  const nome = typeof body?.nome === "string" ? body.nome.trim() : "";
  if (!nome) {
    return { error: "Nome é obrigatório" };
  }

  const preco = Number(body?.preco);
  if (!Number.isFinite(preco) || preco < 0) {
    return { error: "Preço deve ser um número maior ou igual a zero" };
  }

  const estoque = body?.estoque === "" || body?.estoque == null ? 0 : Number(body.estoque);
  if (!Number.isInteger(estoque) || estoque < 0) {
    return { error: "Estoque deve ser um número inteiro maior ou igual a zero" };
  }

  const descricao = typeof body?.descricao === "string" ? body.descricao.trim() : "";

  return {
    payload: {
      nome,
      descricao: descricao || null,
      preco,
      estoque,
      imagem_url: typeof body?.imagem_url === "string" && body.imagem_url ? body.imagem_url : null,
      destaque: body?.destaque === true
    }
  };
}

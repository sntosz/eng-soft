import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { requireAdmin } from "@/lib/authServer";
import { BUCKETS } from "@/lib/supabase";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp"
};

const MAX_SIZE_BYTES = 4 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    let bucketName: string;
    switch (type) {
      case "produto":
        bucketName = BUCKETS.PRODUTOS;
        break;
      case "partida":
        bucketName = BUCKETS.PARTIDAS;
        break;
      case "noticia":
        bucketName = BUCKETS.NOTICIAS;
        break;
      default:
        return NextResponse.json({ error: "Tipo de upload inválido" }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 });
    }

    const extension = ALLOWED_TYPES[file.type];
    if (!extension) {
      return NextResponse.json(
        { error: "Formato inválido. Envie JPG, PNG ou WEBP." },
        { status: 400 }
      );
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: "Imagem muito grande. O limite é 4MB." },
        { status: 400 }
      );
    }

    const path = `${crypto.randomUUID()}.${extension}`;

    const { error } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(path, file, { contentType: file.type });

    if (error) {
      console.error(`Storage upload error (${bucketName}):`, error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data } = supabaseAdmin.storage.from(bucketName).getPublicUrl(path);

    return NextResponse.json({ url: data.publicUrl, path, bucket: bucketName });
  } catch (err: any) {
    console.error("Error uploading image:", err);
    return NextResponse.json(
      { error: err.message || "Erro ao enviar imagem" },
      { status: 500 }
    );
  }
}

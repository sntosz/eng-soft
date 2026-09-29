import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hashPassword } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";

export async function POST(req: Request) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const parseResult = registerSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || "Dados de cadastro inválidos";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { name, email, rgm, password, curso, ano_curso } = parseResult.data;

    const { data, error } = await supabaseAdmin
      .from("solicitacoes_acesso")
      .insert({
        nome: name,
        email,
        rgm,
        curso,
        ano_turma: ano_curso,
        senha_hash: await hashPassword(password),
      })
      .select("id")
      .maybeSingle();

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json(
          { error: "Já existe uma solicitação pendente com esse e-mail ou RGM." },
          { status: 409 }
        );
      }
      console.error("Error creating member access request:", error);
      return NextResponse.json({ error: "Não foi possível enviar a solicitação." }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Não foi possível enviar a solicitação." }, { status: 500 });
    }

    return NextResponse.json(
      { success: true, message: "Solicitação enviada para análise da Atlética." },
      { status: 201 }
    );
  } catch (err: unknown) {
    console.error("Auth register error:", err);
    return NextResponse.json(
      { error: "Erro ao enviar solicitação de acesso." },
      { status: 500 }
    );
  }
}

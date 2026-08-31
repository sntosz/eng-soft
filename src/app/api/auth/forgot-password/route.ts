import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateOtpCode, hashOtpCode, signResetToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body || {};

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "Por favor, forneça um endereço de e-mail válido." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Busca o membro no banco
    const { data: member, error } = await supabaseAdmin
      .from("membros")
      .select("id,nome,email")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (error) {
      console.error("[Forgot Password] Erro ao consultar banco:", error);
      return NextResponse.json(
        { error: "Erro interno ao processar a solicitação." },
        { status: 500 }
      );
    }

    if (!member) {
      return NextResponse.json(
        { error: "Nenhuma conta encontrada com este endereço de e-mail." },
        { status: 404 }
      );
    }

    // Gera código de 6 dígitos e calcula hash HMAC
    const code = generateOtpCode();
    const codeHash = hashOtpCode(code, normalizedEmail);

    // Gera token JWT de sessão de recuperação (válido por 15 minutos)
    const resetToken = signResetToken(
      {
        sub: member.id,
        email: member.email,
        codeHash,
        type: "password_reset",
      },
      "15m"
    );

    // Envia o e-mail (ou faz log no console se em dev)
    await sendPasswordResetEmail({
      to: member.email,
      name: member.nome,
      code,
    });

    return NextResponse.json({
      success: true,
      message: "Código de verificação enviado para o seu e-mail.",
      resetToken,
      // Em ambiente de desenvolvimento, expõe o código para facilitar testes
      devCode: process.env.NODE_ENV !== "production" ? code : undefined,
    });
  } catch (err: any) {
    console.error("[Forgot Password] Erro inesperado:", err);
    return NextResponse.json(
      { error: err.message || "Ocorreu um erro ao enviar o código de recuperação." },
      { status: 500 }
    );
  }
}

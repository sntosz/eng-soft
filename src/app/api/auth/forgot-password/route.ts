import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { generateOtpCode, hashOtpCode, signResetToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";
import { forgotPasswordSchema } from "@/lib/validations";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const ipResult = rateLimit(`forgot:ip:${getClientIp(req)}`, 20, 15 * 60_000);
    if (!ipResult.allowed) return rateLimitResponse(ipResult.retryAfterSeconds);

    const rawBody = await req.json().catch(() => ({}));
    const parseResult = forgotPasswordSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || "E-mail inválido";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const normalizedEmail = parseResult.data.email;

    const emailResult = rateLimit(`forgot:email:${normalizedEmail}`, 5, 15 * 60_000);
    if (!emailResult.allowed) return rateLimitResponse(emailResult.retryAfterSeconds);

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

    const code = generateOtpCode();
    const codeHash = hashOtpCode(code, normalizedEmail);

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

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hashOtpCode, hashPassword, verifyResetToken } from "@/lib/auth";
import { resetPasswordSchema } from "@/lib/validations";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const parseResult = resetPasswordSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || "Dados de redefinição inválidos";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email: normalizedEmail, code, newPassword, resetToken } = parseResult.data;

    const ipResult = rateLimit(`reset:ip:${getClientIp(req)}`, 30, 15 * 60_000);
    if (!ipResult.allowed) return rateLimitResponse(ipResult.retryAfterSeconds);

    const emailResult = rateLimit(`reset:email:${normalizedEmail}`, 5, 15 * 60_000);
    if (!emailResult.allowed) return rateLimitResponse(emailResult.retryAfterSeconds);

    let payload: Record<string, any>;
    try {
      payload = verifyResetToken(resetToken);
    } catch (tokenErr: any) {
      console.warn("[Reset Password] Token inválido ou expirado:", tokenErr.message);
      return NextResponse.json(
        {
          error:
            "O código de verificação expirou ou a sessão é inválida. Solicite um novo código.",
        },
        { status: 400 }
      );
    }

    if (payload.type !== "password_reset" || payload.email?.toLowerCase() !== normalizedEmail) {
      return NextResponse.json(
        { error: "Dados de redefinição incompatíveis com a sessão." },
        { status: 400 }
      );
    }

    const providedCodeHash = hashOtpCode(code.trim(), normalizedEmail);
    if (providedCodeHash !== payload.codeHash) {
      return NextResponse.json(
        { error: "Código de verificação incorreto. Verifique os 6 dígitos digitados." },
        { status: 400 }
      );
    }

    const newHash = await hashPassword(newPassword);

    const { error: updateError } = await supabaseAdmin
      .from("membros")
      .update({ senha_hash: newHash })
      .eq("id", payload.sub);

    if (updateError) {
      console.error("[Reset Password] Erro ao atualizar senha no banco:", updateError);
      return NextResponse.json(
        { error: "Não foi possível atualizar a senha. Tente novamente." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Senha redefinida com sucesso! Agora você já pode fazer login.",
    });
  } catch (err: any) {
    console.error("[Reset Password] Erro inesperado:", err);
    return NextResponse.json(
      { error: err.message || "Ocorreu um erro ao redefinir a senha." },
      { status: 500 }
    );
  }
}

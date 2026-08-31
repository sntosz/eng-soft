import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { hashOtpCode, hashPassword, verifyResetToken } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, code, newPassword, resetToken } = body || {};

    if (!email || !code || !newPassword || !resetToken) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios." },
        { status: 400 }
      );
    }

    if (typeof code !== "string" || code.trim().length !== 6) {
      return NextResponse.json(
        { error: "O código de verificação deve ter 6 dígitos." },
        { status: 400 }
      );
    }

    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json(
        { error: "A nova senha deve ter pelo menos 6 caracteres." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Valida a assinatura e validade do token JWT
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

    // Verifica se o código numérico confere com o hash assinado
    const providedCodeHash = hashOtpCode(code.trim(), normalizedEmail);
    if (providedCodeHash !== payload.codeHash) {
      return NextResponse.json(
        { error: "Código de verificação incorreto. Verifique os 6 dígitos digitados." },
        { status: 400 }
      );
    }

    // Gera o novo hash da senha
    const newHash = await hashPassword(newPassword);

    // Atualiza a senha do membro no banco de dados
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

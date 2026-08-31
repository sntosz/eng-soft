interface SendOtpEmailParams {
  to: string;
  name: string;
  code: string;
}

export async function sendPasswordResetEmail({ to, name, code }: SendOtpEmailParams) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "A.A.A.E.S. <noreply@resend.dev>";

  if (resendApiKey) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject: `${code} é seu código de recuperação de senha - A.A.A.E.S.`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0c0d12; color: #f8fafc; padding: 40px 20px; border-radius: 12px; max-width: 520px; margin: 0 auto; border: 1px solid #27272a;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="font-size: 22px; font-weight: bold; color: #eab308; margin: 0; text-transform: uppercase; letter-spacing: 2px;">
                  A.A.A.E.S.
                </h1>
                <p style="font-size: 12px; color: #a1a1aa; margin: 4px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">
                  Atlética de Engenharia de Software
                </p>
              </div>

              <div style="background-color: #18181b; padding: 24px; border-radius: 8px; border: 1px solid #27272a; text-align: center;">
                <h2 style="font-size: 18px; font-weight: 600; margin-top: 0; color: #ffffff;">
                  Recuperação de Senha
                </h2>
                <p style="font-size: 14px; color: #d4d4d8; line-height: 1.5; margin-bottom: 20px;">
                  Olá, <strong>${name || "Membro"}</strong>! Recebemos uma solicitação para redefinir a senha da sua conta. Use o código de 6 dígitos abaixo:
                </p>

                <div style="background: linear-gradient(135deg, rgba(234,179,8,0.15) 0%, rgba(202,138,4,0.05) 100%); border: 2px dashed #eab308; border-radius: 8px; padding: 18px; margin: 20px 0; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #fbbf24;">
                  ${code}
                </div>

                <p style="font-size: 12px; color: #a1a1aa; margin-top: 16px;">
                  Este código é válido por <strong>15 minutos</strong>. Não compartilhe este código com ninguém.
                </p>
              </div>

              <div style="text-align: center; margin-top: 24px; font-size: 11px; color: #71717a;">
                <p style="margin: 0;">Se você não solicitou a redefinição de senha, ignore esta mensagem com segurança.</p>
                <p style="margin: 6px 0 0 0;">&copy; ${new Date().getFullYear()} A.A.A.E.S. &mdash; Código. Disciplina. Domínio.</p>
              </div>
            </div>
          `,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[Email Service] Falha ao enviar e-mail via Resend:", errorText);
      } else {
        return { success: true, provider: "resend" };
      }
    } catch (err) {
      console.error("[Email Service] Erro de conexão Resend:", err);
    }
  }

  // Fallback para desenvolvimento / ambiente sem Resend configurado
  console.log(`
┌──────────────────────────────────────────────────────────────┐
│ 🔐 [A.A.A.E.S. - CÓDIGO DE RECUPERAÇÃO DE SENHA]             │
├──────────────────────────────────────────────────────────────┤
│ Para:     ${to.padEnd(50)}│
│ Nome:     ${(name || "Membro").padEnd(50)}│
│ Código:   ${code.padEnd(50)}│
│ Validade: 15 minutos                                         │
└──────────────────────────────────────────────────────────────┘
  `);

  return { success: true, provider: "console" };
}

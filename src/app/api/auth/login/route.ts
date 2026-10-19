import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { comparePassword, signToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { getClientIp, rateLimit, rateLimitResponse } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    // Limite por IP: evita brute-force distribuído sobre várias contas
    const ipResult = rateLimit(`login:ip:${getClientIp(req)}`, 30, 5 * 60_000);
    if (!ipResult.allowed) return rateLimitResponse(ipResult.retryAfterSeconds);

    const rawBody = await req.json().catch(() => ({}));
    const parseResult = loginSchema.safeParse(rawBody);

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || "Dados inválidos";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { email, password } = parseResult.data;

    const accountResult = rateLimit(`login:email:${email}`, 10, 5 * 60_000);
    if (!accountResult.allowed) return rateLimitResponse(accountResult.retryAfterSeconds);

    const { data, error } = await supabaseAdmin
      .from("membros")
      .select("id,nome,email,curso,ano_turma,senha_hash,e_admin,ativo")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    if ((data as any).ativo === false) {
      return NextResponse.json(
        { error: "Esta conta está desativada. Fale com a diretoria." },
        { status: 403 }
      );
    }

    const hash = (data as any).senha_hash || (data as any).password_hash || null;
    const match = await comparePassword(password, hash);
    if (!match) {
      return NextResponse.json({ error: "Credenciais inválidas" }, { status: 401 });
    }

    const ano_curso = (data as any).ano_turma;
    const e_admin = (data as any).e_admin === true;
    const token = signToken({
      sub: data.id,
      email: data.email,
      nome: data.nome,
      curso: (data as any).curso,
      ano_curso,
      e_admin,
    });

    const response = NextResponse.json({
      user: {
        id: data.id,
        nome: data.nome,
        email: data.email,
        curso: (data as any).curso,
        ano_curso,
        e_admin,
      },
    });
    
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    console.error("Auth login error:", err);
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 });
  }
}

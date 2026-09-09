import { NextResponse } from "next/server";
import { comparePassword, hashPassword } from "@/lib/auth";
import { getAuthUser } from "@/lib/authServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getAuthUser();

  if (!user) {
    return NextResponse.json(
      { error: "Não autenticado" },
      {
        status: 401,
        headers: { "Cache-Control": "no-store, max-age=0" },
      }
    );
  }

  return NextResponse.json(
    { user },
    {
      headers: { "Cache-Control": "no-store, max-age=0" },
    }
  );
}

export async function PUT(req: Request) {
  try {
    const currentUser = await getAuthUser();
    if (!currentUser) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { nome, email, curso, currentPassword, newPassword } = body || {};

    const updateData: Record<string, string> = {};

    if (typeof nome === "string" && nome.trim()) {
      updateData.nome = nome.trim();
    }

    if (typeof email === "string" && email.trim()) {
      updateData.email = email.trim().toLowerCase();
    }

    if (typeof curso === "string" && curso.trim()) {
      updateData.curso = curso.trim();
    }

    if (typeof currentPassword === "string" || typeof newPassword === "string") {
      if (!currentPassword || !newPassword || String(newPassword).length < 6) {
        return NextResponse.json(
          { error: "Informe a senha atual e uma nova senha com pelo menos 6 caracteres." },
          { status: 400 }
        );
      }

      const { data: memberData, error: memberError } = await supabaseAdmin
        .from("membros")
        .select("senha_hash")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (memberError || !memberData) {
        return NextResponse.json({ error: "Não foi possível validar a senha atual." }, { status: 500 });
      }

      const passwordMatches = await comparePassword(String(currentPassword), memberData.senha_hash || "");
      if (!passwordMatches) {
        return NextResponse.json({ error: "A senha atual está incorreta." }, { status: 401 });
      }

      updateData.senha_hash = await hashPassword(String(newPassword));
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "Nenhuma alteração informada." }, { status: 400 });
    }

    if (updateData.email) {
      const { data: existingUser, error: emailCheckError } = await supabaseAdmin
        .from("membros")
        .select("id")
        .eq("email", updateData.email)
        .neq("id", currentUser.id)
        .maybeSingle();

      if (emailCheckError) {
        return NextResponse.json({ error: emailCheckError.message }, { status: 500 });
      }

      if (existingUser) {
        return NextResponse.json({ error: "Este e-mail já está em uso por outro membro." }, { status: 409 });
      }
    }

    const { error } = await supabaseAdmin
      .from("membros")
      .update(updateData)
      .eq("id", currentUser.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const refreshedUser = await getAuthUser();
    return NextResponse.json({
      success: true,
      user: refreshedUser,
    });
  } catch (err: any) {
    console.error("Error updating current user:", err);
    return NextResponse.json({ error: err.message || "Erro ao atualizar perfil" }, { status: 500 });
  }
}

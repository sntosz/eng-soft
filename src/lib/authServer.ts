import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export interface AuthUser {
  id: string;
  nome: string;
  email: string;
  curso: string;
  ano_curso: string;
  e_admin: boolean;
}

/**
 * Lê o cookie auth-token e recarrega o membro do banco.
 * O e_admin vem sempre do banco (e não do token) para que a permissão
 * possa ser revogada sem esperar o token expirar.
 */
export async function getAuthUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  if (!token) return null;

  let decoded: any;
  try {
    decoded = verifyToken(token);
  } catch {
    return null;
  }

  const { data, error } = await supabaseAdmin
    .from("membros")
    .select("id,nome,email,curso,ano_turma,e_admin")
    .eq("id", decoded.sub)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    nome: data.nome,
    email: data.email,
    curso: (data as any).curso,
    ano_curso: (data as any).ano_turma,
    e_admin: (data as any).e_admin === true,
  };
}

/**
 * Retorna { user } quando o requisitante é admin, ou { response } com o
 * erro pronto (401/403) para a rota devolver.
 */
export async function requireAdmin(): Promise<
  { user: AuthUser; response?: never } | { user?: never; response: NextResponse }
> {
  const user = await getAuthUser();

  if (!user) {
    return { response: NextResponse.json({ error: "Não autenticado" }, { status: 401 }) };
  }

  if (!user.e_admin) {
    return {
      response: NextResponse.json(
        { error: "Acesso restrito a administradores" },
        { status: 403 }
      ),
    };
  }

  return { user };
}

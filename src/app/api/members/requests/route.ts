import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/authServer";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { uuidSchema } from "@/lib/validations";

export async function GET() {
  try {
    const { response } = await requireAdmin();
    if (response) return response;

    const { data, error } = await supabaseAdmin
      .from("solicitacoes_acesso")
      .select("id,nome,email,rgm,curso,ano_turma,criado_em")
      .eq("status", "em_analise")
      .order("criado_em", { ascending: true });

    if (error) {
      console.error("Error fetching access requests:", error);
      return NextResponse.json({ error: "Não foi possível carregar as solicitações." }, { status: 500 });
    }

    return NextResponse.json({ requests: data || [] });
  } catch (error) {
    console.error("Error fetching access requests:", error);
    return NextResponse.json({ error: "Não foi possível carregar as solicitações." }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { user, response } = await requireAdmin();
    if (response) return response;

    const body = await req.json().catch(() => null);
    const idResult = uuidSchema.safeParse(body?.id);
    const action = body?.action;
    if (!idResult.success || (action !== "approve" && action !== "reject")) {
      return NextResponse.json({ error: "Ação ou solicitação inválida." }, { status: 400 });
    }

    if (action === "approve") {
      const { error } = await supabaseAdmin.rpc("approve_member_access_request", {
        p_request_id: idResult.data,
        p_reviewed_by: user.id,
      });

      if (error) {
        if (error.message.includes("REQUEST_NOT_PENDING")) {
          return NextResponse.json({ error: "A solicitação já foi analisada." }, { status: 409 });
        }
        if (error.code === "23505") {
          return NextResponse.json(
            { error: "E-mail ou RGM já está associado a uma conta. Revise os dados antes de aprovar." },
            { status: 409 }
          );
        }
        console.error("Error approving access request:", error);
        return NextResponse.json({ error: "Não foi possível aprovar a solicitação." }, { status: 500 });
      }

      return NextResponse.json({ success: true });
    }

    const { data, error } = await supabaseAdmin
      .from("solicitacoes_acesso")
      .update({
        status: "recusada",
        analisado_por: user.id,
        analisado_em: new Date().toISOString(),
        senha_hash: null,
      })
      .eq("id", idResult.data)
      .eq("status", "em_analise")
      .select("id")
      .maybeSingle();

    if (error) {
      console.error("Error rejecting access request:", error);
      return NextResponse.json({ error: "Não foi possível recusar a solicitação." }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "A solicitação já foi analisada." }, { status: 409 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reviewing access request:", error);
    return NextResponse.json({ error: "Não foi possível analisar a solicitação." }, { status: 500 });
  }
}

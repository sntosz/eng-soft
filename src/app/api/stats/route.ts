import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// GET /api/stats -> Contadores públicos da home (membros, vitórias, pedidos, eventos)
// Usa service role porque membros/pedidos não têm policy de SELECT para o client anônimo.
export async function GET() {
  try {
    const [
      { count: membersCount, error: membersError },
      { count: winsCount, error: winsError },
      { count: ordersCount, error: ordersError },
      { count: eventsCount, error: eventsError },
    ] = await Promise.all([
      supabaseAdmin.from("membros").select("*", { count: "exact", head: true }),
      supabaseAdmin
        .from("partidas")
        .select("*", { count: "exact", head: true })
        .eq("vitoria_atletica", true),
      supabaseAdmin.from("pedidos").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("eventos").select("*", { count: "exact", head: true }),
    ]);

    const firstError = membersError || winsError || ordersError || eventsError;
    if (firstError) {
      console.error("Erro ao buscar estatísticas:", firstError);
      return NextResponse.json(
        { error: "Erro ao carregar estatísticas." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      stats: {
        members: membersCount ?? 0,
        wins: winsCount ?? 0,
        orders: ordersCount ?? 0,
        events: eventsCount ?? 0,
      },
    });
  } catch (err: any) {
    console.error("Erro na rota GET /api/stats:", err);
    return NextResponse.json(
      { error: err.message || "Erro interno no servidor." },
      { status: 500 }
    );
  }
}

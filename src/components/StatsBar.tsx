"use client";

import { useEffect, useState } from "react";
import { Users, Trophy, ShoppingBag, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface StatsData {
  members: string;
  wins: string;
  orders: string;
  events: string;
}

const StatsBar = () => {
  const [stats, setStats] = useState<StatsData>({
    members: "—",
    wins: "—",
    orders: "—",
    events: "—",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const [
          { count: membersCount },
          { count: winsCount },
          { count: ordersCount },
          { count: eventsCount },
        ] = await Promise.all([
          supabase.from("membros").select("*", { count: "exact", head: true }),
          supabase
            .from("partidas")
            .select("*", { count: "exact", head: true })
            .eq("vitoria_atletica", true),
          supabase.from("pedidos").select("*", { count: "exact", head: true }),
          supabase.from("eventos").select("*", { count: "exact", head: true }),
        ]);

        if (mounted) {
          setStats({
            members: membersCount != null ? String(membersCount) : "0",
            wins: winsCount != null ? String(winsCount) : "0",
            orders: ordersCount != null ? String(ordersCount) : "0",
            events: eventsCount != null ? String(eventsCount) : "0",
          });
        }
      } catch (err) {
        console.error("Falha ao carregar estatísticas do Supabase:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const statItems = [
    { icon: Users, label: "Membros Associados", value: stats.members },
    { icon: Trophy, label: "Vitórias no Ano", value: stats.wins },
    { icon: ShoppingBag, label: "Pedidos Realizados", value: stats.orders },
    { icon: Calendar, label: "Eventos Oficiais", value: stats.events },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {statItems.map((s) => (
        <div
          key={s.label}
          className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 card-glow transition-all hover:border-primary/40"
        >
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <s.icon className="w-5 h-5 text-primary" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xl font-display font-bold text-foreground">
              {loading ? (
                <span className="inline-block w-8 h-5 bg-muted rounded animate-pulse" />
              ) : (
                s.value
              )}
            </p>
            <p className="text-xs text-muted-foreground truncate">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsBar;

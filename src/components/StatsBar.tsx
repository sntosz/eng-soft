import { useEffect, useState } from "react";
import { Users, Trophy, ShoppingBag } from "lucide-react";
import { supabase } from "@/lib/supabase";

const StatsBar = () => {
  const [stats, setStats] = useState({ members: "1,247", wins: "18", orders: "342" });

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const { count: membersCount, error: mErr } = await supabase.from("members").select("*", { count: "exact", head: true });
        const { count: ordersCount, error: oErr } = await supabase.from("orders").select("*", { count: "exact", head: true });
        const { count: matchesCount, error: maErr } = await supabase.from("matches").select("*", { count: "exact", head: true });

        if (mounted) {
          setStats((prev) => ({
            members: membersCount != null ? String(membersCount) : prev.members,
            wins: matchesCount != null ? String(matchesCount) : prev.wins,
            orders: ordersCount != null ? String(ordersCount) : prev.orders,
          }));
        }
      } catch (err) {
        console.error("Failed to load stats from Supabase:", err);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const statItems = [
    { icon: Users, label: "Members", value: stats.members },
    { icon: Trophy, label: "Season Wins", value: stats.wins },
    { icon: ShoppingBag, label: "Orders", value: stats.orders },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {statItems.map((s) => (
        <div key={s.label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <s.icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xl font-display font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsBar;

"use client";

import { useEffect, useState } from "react";
import { Users, Trophy, ShoppingBag, Calendar } from "lucide-react";
import { useI18n } from "@/contexts/I18nContext";
import { MessageKey } from "@/i18n/messages";

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
  const { t } = useI18n();

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const res = await fetch("/api/stats", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.error || "Erro ao carregar estatísticas.");
        }

        if (mounted) {
          setStats({
            members: String(data.stats?.members ?? 0),
            wins: String(data.stats?.wins ?? 0),
            orders: String(data.stats?.orders ?? 0),
            events: String(data.stats?.events ?? 0),
          });
        }
      } catch (err) {
        console.error("Falha ao carregar estatísticas:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const statItems: { icon: typeof Users; labelKey: MessageKey; value: string }[] = [
    { icon: Users, labelKey: "stats.members", value: stats.members },
    { icon: Trophy, labelKey: "stats.wins", value: stats.wins },
    { icon: ShoppingBag, labelKey: "stats.orders", value: stats.orders },
    { icon: Calendar, labelKey: "stats.events", value: stats.events },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {statItems.map((s) => (
        <div
          key={s.labelKey}
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
            <p className="text-xs text-muted-foreground truncate">{t(s.labelKey)}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsBar;

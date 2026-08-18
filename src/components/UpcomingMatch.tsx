import Image from "next/image";
import { useEffect, useState } from "react";
import { Calendar, MapPin, Loader2 } from "lucide-react";
import logoAaes from "@/assets/logo-aaaes.png";
import logoLaw from "@/assets/logo-law.png";
import { supabase } from "@/lib/supabase";
import { Match } from "@/types";

const UpcomingMatch = () => {
  const [match, setMatch] = useState<Match | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const now = new Date().toISOString();

        const { data, error } = await supabase
            .from("partidas")
            .select("*")
            .gt("data_partida", now)
            .order("data_partida", { ascending: true })
            .limit(1)
            .maybeSingle();

        if (error) {
          console.error("Erro retornado pelo Supabase:", error.message, error.details);
          return;
        }

        console.log("Resultado da consulta:", data);

        if (mounted) {
          setMatch(data);
        }
      } catch (err) {
        console.error("Falha inesperada ao carregar partida:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
        <div className="bg-card border border-border rounded-xl p-6 flex items-center justify-center min-h-[220px]">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
    );
  }

  const home = match?.time_casa || "Time da Casa";
  const away = match?.time_visitante || "Visitante";
  const dateLabel = match?.data_partida
      ? new Date(match.data_partida).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
      : "A definir";
  const location = match?.local_partida || "A definir";

  return (
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-display font-bold text-foreground">Próxima Partida</h4>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between py-4">
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center p-2 border-2 border-primary/30">
              <Image src={logoAaes} alt={home} width={48} height={48} />
            </div>
            <span className="text-sm font-semibold text-foreground">{home}</span>
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="font-display text-3xl font-bold text-primary">VS</span>
            <span className="text-xs text-muted-foreground">Best of 3</span>
          </div>

          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center p-2 border-2 border-border">
              <Image src={logoLaw} alt={away} width={48} height={48} />
            </div>
            <span className="text-sm font-semibold text-foreground">{away}</span>
          </div>
        </div>

        {/* Details */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          {dateLabel}
        </span>
          <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-primary" />
            {location}
        </span>
        </div>
      </div>
  );
};

export default UpcomingMatch;
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, MapPin, Loader2, Trophy, ArrowRight } from "lucide-react";
import logoAaes from "@/assets/logo-aaaes.png";
import logoLaw from "@/assets/logo-law.png";
import { supabase } from "@/lib/supabase";
import { Match } from "@/types";
import { isValidImageUrl } from "@/lib/utils";

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
          .gte("data_partida", now)
          .order("data_partida", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error("Erro ao buscar próxima partida no Supabase:", error);
          return;
        }

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

  if (!match) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 flex flex-col items-center justify-center min-h-[220px] text-center space-y-3 card-glow">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Trophy className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h4 className="font-display font-bold text-foreground">Sem Jogos Agendados</h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs">
            Nenhuma partida futura marcada no momento. Acompanhe os resultados e o histórico da atlética.
          </p>
        </div>
        <Link
          href="/matches"
          className="text-xs text-primary font-medium hover:underline flex items-center gap-1 pt-1"
        >
          Ver histórico de partidas <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    );
  }

  const home = match.time_casa || "Time da Casa";
  const away = match.time_visitante || "Visitante";
  const dateObj = new Date(match.data_partida);
  const dateLabel = dateObj.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const timeLabel = dateObj.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const location = match.local_partida || "Arena Principal";

  const hasCustomHomeLogo = isValidImageUrl(match.foto_casa);
  const hasCustomAwayLogo = isValidImageUrl(match.foto_visitante);

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4 card-glow">
      <div className="flex items-center justify-between">
        <h4 className="font-display font-bold text-foreground flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          Próxima Partida
        </h4>
        <Link
          href="/matches"
          className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
        >
          Ver todas <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="flex items-center justify-between py-2">
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center p-2 border-2 border-primary/40 overflow-hidden">
            <Image
              src={hasCustomHomeLogo ? match.foto_casa : logoAaes}
              alt={home}
              width={48}
              height={48}
              unoptimized={hasCustomHomeLogo}
              className="object-contain w-full h-full"
            />
          </div>
          <span className="text-sm font-semibold text-foreground text-center truncate max-w-[110px]">
            {home}
          </span>
        </div>

        <div className="flex flex-col items-center gap-1 px-3">
          <span className="font-display text-2xl md:text-3xl font-bold text-primary">VS</span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
            Confronto
          </span>
        </div>

        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center p-2 border-2 border-border overflow-hidden">
            <Image
              src={hasCustomAwayLogo ? match.foto_visitante : logoLaw}
              alt={away}
              width={48}
              height={48}
              unoptimized={hasCustomAwayLogo}
              className="object-contain w-full h-full"
            />
          </div>
          <span className="text-sm font-semibold text-foreground text-center truncate max-w-[110px]">
            {away}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          {dateLabel} às {timeLabel}
        </span>
        <span className="flex items-center gap-1.5 truncate max-w-[140px]">
          <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="truncate">{location}</span>
        </span>
      </div>
    </div>
  );
};

export default UpcomingMatch;
"use client";

import { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Trophy, Calendar, MapPin, Clock } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import logoSwe from "@/assets/logo-swe.png";
import logoLaw from "@/assets/logo-law.png";
import { Match } from "@/types";

const MatchesPage = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadMatches() {
      try {
        const { data, error: sbError } = await supabase
          .from("partidas")
          .select("*")
          .order("data_partida", { ascending: true });

        if (sbError) {
          throw sbError;
        }

        setMatches(data || []);
      } catch (err: any) {
        console.error("Erro ao buscar partidas:", err);
        setError(err.message || "Erro ao buscar partidas");
      } finally {
        setLoading(false);
      }
    }

    loadMatches();
  }, []);

  const now = new Date();
  const upcomingMatches = matches.filter(m => new Date(m.data_partida) >= now);
  const pastMatches = matches.filter(m => new Date(m.data_partida) < now).reverse();

  const MatchCard = ({ match, isPast }: { match: Match, isPast: boolean }) => {
    const home = match.time_casa || { short: "SWE", name: "Software Eng." };
    const away = match.time_fora || { short: "ADV", name: "Direito" };
    const date = new Date(match.data_partida);

    return (
      <div className={`bg-card border border-border rounded-xl p-6 transition-all ${!isPast && 'card-glow'}`}>
        <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" />
              {date.toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" />
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
              {match.local || "Arena Principal"}
            </span>
          </div>

          {isPast ? (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
              Finalizado
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider gold-gradient text-primary-foreground">
              Próximo Jogo
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center p-3 border-2 ${(match.placar_casa ?? 0) > (match.placar_fora ?? 0) ? 'border-primary' : 'border-border'} bg-muted`}>
               <Image src={logoSwe} alt={home.name} width={64} height={64} className="object-contain" />
            </div>
            <span className="font-display font-bold text-lg mt-2">{home.short}</span>
            <span className="text-xs text-muted-foreground text-center">{home.name}</span>
          </div>

          <div className="flex flex-col items-center gap-2 px-8">
            {isPast ? (
              <div className="flex items-center gap-4">
                <span className={`font-display text-4xl font-bold ${(match.placar_casa ?? 0) > (match.placar_fora ?? 0) ? 'text-primary' : 'text-foreground'}`}>
                  {match.placar_casa || 0}
                </span>
                <span className="text-muted-foreground text-xl">-</span>
                <span className={`font-display text-4xl font-bold ${(match.placar_fora ?? 0) > (match.placar_casa ?? 0) ? 'text-primary' : 'text-foreground'}`}>
                  {match.placar_fora || 0}
                </span>
              </div>
            ) : (
              <span className="font-display text-4xl font-bold text-primary">VS</span>
            )}
            <span className="text-xs text-muted-foreground uppercase tracking-widest mt-2">
              {match.campeonato || "Amistoso"}
            </span>
          </div>

          <div className="flex flex-col items-center gap-2 flex-1">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center p-3 border-2 ${(match.placar_fora ?? 0) > (match.placar_casa ?? 0) ? 'border-primary' : 'border-border'} bg-muted`}>
               <Image src={logoLaw} alt={away.name} width={64} height={64} className="object-contain opacity-80" />
            </div>
            <span className="font-display font-bold text-lg mt-2">{away.short}</span>
            <span className="text-xs text-muted-foreground text-center">{away.name}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 surface-glass border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              Partidas
            </h1>
            <p className="text-sm text-muted-foreground">
              Acompanhe o calendário e resultados dos jogos da atlética
            </p>
          </div>
        </header>

        <div className="p-6 max-w-5xl mx-auto space-y-12">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Carregando partidas...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-destructive">{error}</p>
            </div>
          ) : (
            <>
              {upcomingMatches.length > 0 && (
                <section>
                  <h2 className="font-display text-2xl font-bold mb-6 flex items-center gap-2">
                    <span className="w-2 h-8 gold-gradient rounded-full inline-block"></span>
                    Próximos Jogos
                  </h2>
                  <div className="space-y-6">
                    {upcomingMatches.map(match => (
                      <MatchCard key={match.id} match={match} isPast={false} />
                    ))}
                  </div>
                </section>
              )}

              {pastMatches.length > 0 && (
                <section>
                  <h2 className="font-display text-2xl font-bold mb-6 text-muted-foreground flex items-center gap-2">
                    <span className="w-2 h-8 bg-muted rounded-full inline-block"></span>
                    Resultados Anteriores
                  </h2>
                  <div className="space-y-6 opacity-90">
                    {pastMatches.map(match => (
                      <MatchCard key={match.id} match={match} isPast={true} />
                    ))}
                  </div>
                </section>
              )}

              {matches.length === 0 && (
                <div className="flex items-center justify-center py-12 border-2 border-dashed border-border rounded-xl">
                  <p className="text-muted-foreground">Nenhuma partida registrada no sistema.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default MatchesPage;

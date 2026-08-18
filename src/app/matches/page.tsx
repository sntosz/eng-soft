"use client";

import { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Trophy, Calendar, MapPin, Clock, Plus, Edit2, Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";
import logoSwe from "@/assets/logo-swe.png";
import logoLaw from "@/assets/logo-law.png";
import { Match } from "@/types";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { MatchModal } from "@/components/MatchModal";

const MatchesPage = () => {
  const { user } = useCurrentUser();
  const isAdmin = user?.e_admin === true;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMatches = async () => {
    try {
      setLoading(true);
      const { data, error: sbError } = await supabase
          .from("partidas")
          .select("*")
          .order("data_partida", { ascending: true });

      if (sbError) throw sbError;
      setMatches(data || []);
    } catch (err: any) {
      console.error("Erro ao buscar partidas:", err);
      setError(err.message || "Erro ao buscar partidas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();
  }, []);

  const handleCreate = () => {
    setSelectedMatch(null);
    setIsModalOpen(true);
  };

  const handleEdit = (m: Match) => {
    setSelectedMatch(m);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta partida?")) return;
    try {
      const { error } = await supabase.from("partidas").delete().eq("id", id);
      if (error) throw error;
      setMatches((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  const handleSubmit = async (data: Partial<Match>) => {
    try {
      const formattedData = {
        ...data,
        data_partida: data.data_partida
            ? new Date(data.data_partida).toISOString()
            : new Date().toISOString(),
      };

      if (data.id) {
        const { error } = await supabase
            .from("partidas")
            .update(formattedData)
            .eq("id", data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
            .from("partidas")
            .insert([formattedData]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      await loadMatches();
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    }
  };

  const now = new Date();
  const upcomingMatches = matches.filter((m) => new Date(m.data_partida) >= now);
  const pastMatches = matches
      .filter((m) => new Date(m.data_partida) < now)
      .reverse();

  const MatchCard = ({ match, isPast }: { match: Match; isPast: boolean }) => {
    const home = typeof match.time_casa === "string" ? match.time_casa : "Time da Casa";
    const away = typeof match.time_visitante === "string" ? match.time_visitante : "Visitante";
    const date = new Date(match.data_partida);
    const casaGanhou = Boolean(match.vitoria_atletica);

    return (
        <div
            className={`bg-card border border-border rounded-xl p-6 transition-all ${
                !isPast ? "card-glow" : ""
            }`}
        >
          <div className="flex items-center justify-between mb-4 border-b border-border pb-4">
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-primary" />
              {date.toLocaleDateString("pt-BR")}
            </span>
              <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" />
                {date.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
            </span>
              <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-primary" />
                {match.local_partida || "Arena Principal"}
            </span>
            </div>

            {isPast ? (
                <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        casaGanhou
                            ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                            : "bg-destructive/10 text-destructive border border-destructive/20"
                    }`}
                >
              {casaGanhou ? "Vitória da Casa" : "Derrota da Casa"}
            </span>
            ) : (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider gold-gradient text-primary-foreground">
              Próximo Jogo
            </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            {/* Time Casa */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center p-3 border-2 overflow-hidden bg-muted ${
                      isPast && casaGanhou ? "border-primary shadow-lg shadow-primary/20" : "border-border"
                  }`}
              >
                <Image
                    src={match.foto_casa || logoSwe}
                    alt={home}
                    width={64}
                    height={64}
                    className="object-contain w-full h-full"
                />
              </div>
              <span className="font-display font-bold text-base md:text-lg mt-2 text-center">
              {home}
            </span>
              {isPast && casaGanhou && (
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wide">
                Vencedor
              </span>
              )}
            </div>

            {/* VS ou Status */}
            <div className="flex flex-col items-center gap-1 px-4 md:px-8">
            <span className="font-display text-3xl md:text-4xl font-bold text-primary">
              VS
            </span>
              {isPast && (
                  <span className="text-[11px] text-muted-foreground uppercase tracking-widest font-medium">
                Encerrado
              </span>
              )}
            </div>

            {/* Time Fora */}
            <div className="flex flex-col items-center gap-2 flex-1">
              <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center p-3 border-2 overflow-hidden bg-muted ${
                      isPast && !casaGanhou ? "border-primary shadow-lg shadow-primary/20" : "border-border"
                  }`}
              >
                <Image
                    src={match.foto_visitante || logoLaw}
                    alt={away}
                    width={64}
                    height={64}
                    className="object-contain w-full h-full"
                />
              </div>
              <span className="font-display font-bold text-base md:text-lg mt-2 text-center">
              {away}
            </span>
              {isPast && !casaGanhou && (
                  <span className="text-[11px] font-bold text-primary uppercase tracking-wide">
                Vencedor
              </span>
              )}
            </div>
          </div>

          {isAdmin && (
              <div className="mt-4 pt-4 border-t border-border flex gap-2 justify-end">
                <button
                    onClick={() => handleEdit(match)}
                    className="border border-border px-3 py-1 rounded text-xs flex items-center gap-1 hover:bg-secondary transition-colors"
                >
                  <Edit2 className="w-3 h-3" /> Editar
                </button>
                <button
                    onClick={() => handleDelete(match.id)}
                    className="bg-destructive/10 text-destructive px-3 py-1 rounded text-xs flex items-center gap-1 hover:bg-destructive/20 transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Excluir
                </button>
              </div>
          )}
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
            {isAdmin && (
                <div className="flex justify-end mb-4">
                  <button
                      onClick={handleCreate}
                      className="gold-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" /> Nova Partida
                  </button>
                </div>
            )}

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
                          {upcomingMatches.map((m) => (
                              <MatchCard key={m.id} match={m} isPast={false} />
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
                          {pastMatches.map((m) => (
                              <MatchCard key={m.id} match={m} isPast={true} />
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

          <MatchModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSubmit={handleSubmit}
              initialData={selectedMatch || undefined}
          />
        </main>
      </div>
  );
};

export default MatchesPage;
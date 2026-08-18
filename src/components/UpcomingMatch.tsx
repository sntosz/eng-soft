import Image from "next/image";
import { useEffect, useState } from "react";
import { Calendar, MapPin } from "lucide-react";
import logoAaes from "@/assets/logo-aaaes.png";
import logoSwe from "@/assets/logo-swe.png";
import logoLaw from "@/assets/logo-law.png";
import { supabase } from "@/lib/supabase";
import { Match } from "@/types";

const UpcomingMatch = () => {
  const [match, setMatch] = useState<Match | null>(null);

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

        if (error) throw error;
        if (mounted && data) {
          setMatch(data);
        }
      } catch (err) {
        console.error("Failed to load upcoming match from Supabase:", err);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const home = match?.time_casa || { short: "SWE", name: "Software Eng." };
  const away = match?.time_visitante || { short: "LAW", name: "Law School" };
  const dateLabel = match?.data_partida ? new Date(match.data_partida).toLocaleString() : "A definir";
  const location = match?.local_partida || "a definir";

  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-display font-bold text-foreground">Próxima Partida</h4>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between py-4">
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center p-2 border-2 border-primary/30">
            <Image src={logoAaes} alt={home.name} width={48} height={48} />
          </div>
          <span className="text-sm font-semibold text-foreground">{home.short}</span>
          <span className="text-xs text-muted-foreground">{home.name}</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="font-display text-3xl font-bold text-primary">VS</span>
          <span className="text-xs text-muted-foreground">Best of 3</span>
        </div>

        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center p-2 border-2 border-border">
            <Image src={logoLaw} alt={away.name} width={48} height={48} />
          </div>
          <span className="text-sm font-semibold text-foreground">{away.short}</span>
          <span className="text-xs text-muted-foreground">{away.name}</span>
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

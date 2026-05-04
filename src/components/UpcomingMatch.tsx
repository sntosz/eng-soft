import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import logoSwe from "@/assets/logo-swe.png";
import logoLaw from "@/assets/logo-law.png";

const UpcomingMatch = () => {
  return (
    <div className="bg-card border border-border rounded-xl p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-display font-bold text-foreground">Upcoming Match</h4>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider gold-gradient text-primary-foreground">
          Rivalry
        </span>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between py-4">
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center p-2 border-2 border-primary/30">
            <Image src={logoSwe} alt="Software Engineering" width={48} height={48} />
          </div>
          <span className="text-sm font-semibold text-foreground">SWE</span>
          <span className="text-xs text-muted-foreground">Software Eng.</span>
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="font-display text-3xl font-bold text-primary">VS</span>
          <span className="text-xs text-muted-foreground">Best of 3</span>
        </div>

        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center p-2 border-2 border-border">
            <Image src={logoLaw} alt="Law School" width={48} height={48} />
          </div>
          <span className="text-sm font-semibold text-foreground">LAW</span>
          <span className="text-xs text-muted-foreground">Law School</span>
        </div>
      </div>

      {/* Details */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-primary" />
          Apr 15, 2026 · 7:00 PM
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          Main Arena
        </span>
      </div>
    </div>
  );
};

export default UpcomingMatch;

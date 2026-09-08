import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import jerseyImg from "@/assets/jersey-banner.jpg";

const JerseyBanner = () => {
  const currentYear = new Date().getFullYear();

  return (
    <div className="relative rounded-xl overflow-hidden border border-border group card-glow">
      <div className="relative w-full h-64 md:h-72">
        <Image
          src={jerseyImg}
          alt="Manto Oficial da Atlética"
          fill
          priority
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>

      {/* Overlay escuro com degradê suave */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">
            Lançamento Oficial
          </span>
          <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-1">
            Manto Oficial — Temporada {currentYear}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Edição Especial Limitada · Vista as cores da Engenharia de Software
          </p>
        </div>

        <Link
          href="/store"
          className="gold-gradient text-primary-foreground font-semibold px-6 py-3 rounded-lg flex items-center gap-2 text-sm hover:opacity-90 transition-opacity shrink-0 shadow-lg"
        >
          Conferir na Loja
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default JerseyBanner;

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import jerseyImg from "@/assets/jersey-banner.jpg";

const JerseyBanner = () => {
  return (
    <div className="relative rounded-xl overflow-hidden border border-border group">
      <div className="relative w-full h-64 md:h-72">
        <Image
          src={jerseyImg}
          alt="2026 Athletic Jersey"
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </div>
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end justify-between">
        <div>
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">New Release</span>
          <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-1">
            2026 Circuit Series Jersey
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Limited edition · Premium athletic fit</p>
        </div>
        <button className="gold-gradient text-primary-foreground font-semibold px-6 py-3 rounded-lg flex items-center gap-2 text-sm hover:opacity-90 transition-opacity shrink-0">
          Pre-order Now
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default JerseyBanner;

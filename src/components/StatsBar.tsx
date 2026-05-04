import { Users, Trophy, ShoppingBag, Flame } from "lucide-react";

const stats = [
  { icon: Users, label: "Members", value: "1,247" },
  { icon: Trophy, label: "Season Wins", value: "18" },
  { icon: ShoppingBag, label: "Orders", value: "342" }
];

const StatsBar = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
    {stats.map((s) => (
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

export default StatsBar;

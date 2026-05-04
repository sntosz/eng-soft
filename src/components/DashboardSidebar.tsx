import Image from "next/image";
import { Home, CreditCard, ShoppingBag, Trophy, Calendar, Settings, User, LogOut } from "lucide-react";
import logoSwe from "@/assets/logo-swe.png";

const navItems = [
  { icon: Home, label: "Dashboard", active: true },
  { icon: CreditCard, label: "Member ID" },
  { icon: ShoppingBag, label: "Merch Store" },
  { icon: Trophy, label: "Matches" },
  { icon: Calendar, label: "Events" },
  { icon: Settings, label: "Settings" },
];

const DashboardSidebar = () => {
  return (
    <aside className="w-20 lg:w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col items-center lg:items-stretch py-6 px-2 lg:px-4 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <Image src={logoSwe} alt="SWE Athletics" width={40} height={40} className="shrink-0" />
        <span className="hidden lg:block font-display font-bold text-lg text-foreground tracking-tight">
          A.A.A.E.S. <span className="gold-text">Atlética</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 w-full">
        {navItems.map((item) => (
          <button
            key={item.label}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              item.active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
          >
            <item.icon className="w-5 h-5 shrink-0 mx-auto lg:mx-0" />
            <span className="hidden lg:block">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Profile */}
      <div className="mt-auto pt-4 border-t border-sidebar-border w-full">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-foreground">Alex Chen</p>
            <p className="text-xs text-muted-foreground">SWE '26</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;

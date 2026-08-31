"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  CreditCard,
  ShoppingBag,
  Trophy,
  Calendar,
  Settings,
  User,
  LucideIcon,
} from "lucide-react";
import logoSwe from "@/assets/logo-aaaes.png";
import { NavLink } from "./NavLink";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  adminOnly?: boolean;
  authOnly?: boolean;
}

const navItems: NavItem[] = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Trophy, label: "Partidas", href: "/matches" },
  { icon: Calendar, label: "Eventos", href: "/events" },
  { icon: ShoppingBag, label: "Loja", href: "/store" },
  { icon: CreditCard, label: "Membros", href: "/members", adminOnly: true },
  { icon: Settings, label: "Configurações", href: "/settings", authOnly: true },
];

const DashboardSidebar = () => {
  const pathname = usePathname();
  const { user, isLoggedIn, loading } = useCurrentUser();

  const visibleNavItems = navItems.filter((item) => {
    if (item.adminOnly) return user?.e_admin === true;
    if (item.authOnly) return isLoggedIn;
    return true;
  });

  return (
    <aside className="w-20 lg:w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col items-center lg:items-stretch py-6 px-2 lg:px-4 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 px-2">
        <Image src={logoSwe} alt="A.A.A.E.S." width={40} height={40} className="shrink-0" />
        <span className="hidden lg:block font-display font-bold text-lg text-foreground tracking-tight">
          A.A.A.E.S. <span className="gold-text">Atlética</span>
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 w-full">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

          return (
            <NavLink
              key={item.href}
              href={item.href}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/10 text-primary font-semibold shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0 mx-auto lg:mx-0" />
              <span className="hidden lg:block">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Usuário logado */}
      {!loading && isLoggedIn && user && (
        <div className="mt-auto pt-4 border-t border-sidebar-border w-full">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="hidden lg:block overflow-hidden">
              <p className="text-sm font-medium text-foreground truncate">{user.nome}</p>
              <p className="text-xs text-muted-foreground truncate">
                {user.e_admin ? "Administrador" : user.curso}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default DashboardSidebar;


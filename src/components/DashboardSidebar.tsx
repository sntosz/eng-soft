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
  ClipboardCheck,
  LucideIcon,
} from "lucide-react";
import logoSwe from "@/assets/logo-aaaes.png";
import { NavLink } from "./NavLink";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useI18n } from "@/contexts/I18nContext";
import { MessageKey } from "@/i18n/messages";

interface NavItem {
  icon: LucideIcon;
  labelKey: MessageKey;
  href: string;
  adminOnly?: boolean;
  authOnly?: boolean;
}

const navItems: NavItem[] = [
  { icon: Home, labelKey: "nav.home", href: "/" },
  { icon: Trophy, labelKey: "nav.matches", href: "/matches" },
  { icon: Calendar, labelKey: "nav.events", href: "/events" },
  { icon: ShoppingBag, labelKey: "nav.store", href: "/store" },
  { icon: CreditCard, labelKey: "nav.members", href: "/members", adminOnly: true },
  { icon: ClipboardCheck, labelKey: "nav.requests", href: "/members/requests", adminOnly: true },
  { icon: Settings, labelKey: "nav.settings", href: "/settings", authOnly: true },
];

const DashboardSidebar = () => {
  const pathname = usePathname();
  const { user, isLoggedIn, loading } = useCurrentUser();
  const { t } = useI18n();

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
              <span className="hidden lg:block">{t(item.labelKey)}</span>
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
                {user.e_admin ? t("role.admin") : user.curso}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default DashboardSidebar;

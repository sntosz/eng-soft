"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LogIn, LogOut } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import JerseyBanner from "@/components/JerseyBanner";
import MemberIdCard from "@/components/MemberIdCard";
import StatsBar from "@/components/StatsBar";
import UpcomingMatch from "@/components/UpcomingMatch";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const HomePage = () => {
  const { user, isLoggedIn } = useCurrentUser();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 surface-glass border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            { isLoggedIn == true ? (
              <h1 className="font-display text-xl font-bold text-foreground">
                Bem-vindo de volta, <span className="gold-text">{user.nome}</span>
              </h1>) : (
                <h1 className="font-display text-xl font-bold text-foreground">
                  Seja bem-vindo, <span className="gold-text">Visitante</span>
                </h1>
            )
            }
            <p className="text-sm text-muted-foreground">Atlética Engenharia de Software — Temporada {new Date().getFullYear()}</p>
          </div>
          <div className="flex items-center gap-3">

            {isLoggedIn ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2 text-muted-foreground hover:text-foreground border"
                  aria-label="Sair"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button asChild size="sm" className="gap-2 gold-gradient text-primary-foreground hover:opacity-90">
                <Link href="/login" className="flex items-center gap-2">
                  <LogIn className="w-4 h-4" />
                  <span>Entrar</span>
                </Link>
              </Button>
            )}
          </div>
        </header>

        <div className="p-6 space-y-6 max-w-6xl">
          <StatsBar />

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3">
              <MemberIdCard />
            </div>
            <div className="lg:col-span-2">
              <UpcomingMatch />
            </div>
          </div>

          <JerseyBanner />
        </div>
      </main>
    </div>
  );
};

export default HomePage;

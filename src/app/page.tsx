"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogIn, LogOut, Search, Settings } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import JerseyBanner from "@/components/JerseyBanner";
import MemberIdCard from "@/components/MemberIdCard";
import StatsBar from "@/components/StatsBar";
import UpcomingMatch from "@/components/UpcomingMatch";
import { Button } from "@/components/ui/button";

const HomePage = () => {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setIsLoggedIn(localStorage.getItem("aaaes:isLoggedIn") === "true");
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("aaaes:isLoggedIn");
    setIsLoggedIn(false);
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 surface-glass border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              Welcome back, <span className="gold-text">Alex</span>
            </h1>
            <p className="text-sm text-muted-foreground">Software Engineering Athletics — Season 2025/26</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <Search className="w-4 h-4" />
            </button>
            <button className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full gold-gradient border-2 border-background" />
            </button>

            {isLoggedIn ? (
              <>
                <Button variant="secondary" size="sm" className="gap-2">
                  <Settings className="w-4 h-4" />
                  <span className="hidden sm:inline">Configurações</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2 text-muted-foreground hover:text-foreground"
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

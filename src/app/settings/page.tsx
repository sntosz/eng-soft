"use client";

import { useEffect, useState } from "react";
import { Bell, Globe, Monitor, Moon, Palette, Save, Settings as SettingsIcon, Shield, Sun, User } from "lucide-react";
import DashboardSidebar from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface ProfileState {
  name: string;
  email: string;
  curso: string;
  role: string;
}

interface SettingsState {
  appearance: {
    theme: string;
    animations: boolean;
    compactMode: boolean;
  };
  notifications: {
    push: boolean;
    weeklyEmail: boolean;
    gameReminders: boolean;
    teamUpdates: boolean;
  };
  locale: {
    language: string;
    timezone: string;
    currency: string;
  };
}

export default function SettingsPage() {
  const { user, loading, refreshUser } = useCurrentUser();
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [profile, setProfile] = useState<ProfileState>({
    name: "",
    email: "",
    curso: "",
    role: "",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [settings, setSettings] = useState<SettingsState>({
    appearance: {
      theme: "dark",
      animations: true,
      compactMode: false,
    },
    notifications: {
      push: true,
      weeklyEmail: false,
      gameReminders: true,
      teamUpdates: true,
    },
    locale: {
      language: "pt-BR",
      timezone: "america-sao-paulo",
      currency: "brl",
    },
  });

  useEffect(() => {
    if (!user) return;

    setProfile({
      name: user.nome || "",
      email: user.email || "",
      curso: user.curso || "",
      role: user.e_admin ? "Administrador" : "Membro",
    });
  }, [user]);

  const handleProfileChange = (key: keyof ProfileState, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSettingChange = (section: keyof SettingsState, key: string, value: unknown) => {
    setSettings((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value,
      },
    }));
    setHasUnsavedChanges(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: profile.name.trim(),
          email: profile.email.trim(),
          curso: profile.curso.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Não foi possível salvar o perfil.");
      }

      await refreshUser();
      setHasUnsavedChanges(false);
      toast.success("Perfil atualizado com sucesso.");
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar o perfil.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwords.currentPassword || !passwords.newPassword) {
      toast.error("Informe a senha atual e a nova senha.");
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast.error("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Não foi possível alterar a senha.");
      }

      setPasswords({ currentPassword: "", newPassword: "" });
      toast.success("Senha alterada com sucesso.");
    } catch (error: any) {
      toast.error(error.message || "Erro ao alterar a senha.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Carregando configurações...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 surface-glass border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <SettingsIcon className="w-5 h-5 text-primary" />
              Configurações
            </h1>
            <p className="text-sm text-muted-foreground">Ajuste suas preferências e dados do perfil.</p>
          </div>
        </header>

        <div className="p-6 max-w-6xl mx-auto space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Perfil
                </CardTitle>
                <CardDescription>Informações básicas do usuário autenticado.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(event) => handleProfileChange("name", event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(event) => handleProfileChange("email", event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="curso">Curso</Label>
                  <Input
                    id="curso"
                    value={profile.curso}
                    onChange={(event) => handleProfileChange("curso", event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Cargo</Label>
                  <Input id="role" value={profile.role} readOnly className="bg-secondary/40" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Segurança
                </CardTitle>
                <CardDescription>Altere sua senha atual e mantenha sua conta protegida.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="current-password">Senha atual</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={passwords.currentPassword}
                    onChange={(event) => setPasswords((prev) => ({ ...prev, currentPassword: event.target.value }))}
                    placeholder="Digite a senha atual"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="new-password">Nova senha</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwords.newPassword}
                    onChange={(event) => setPasswords((prev) => ({ ...prev, newPassword: event.target.value }))}
                    placeholder="Mínimo 6 caracteres"
                  />
                </div>
                <Button variant="outline" className="w-full" onClick={handleChangePassword} disabled={isChangingPassword}>
                  {isChangingPassword ? "Alterando senha..." : "Alterar senha"}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  Aparência
                </CardTitle>
                <CardDescription>Personalize a experiência visual da aplicação.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Label>Tema</Label>
                    <p className="text-sm text-muted-foreground">Escolha o tema da interface.</p>
                  </div>
                  <Select value={settings.appearance.theme} onValueChange={(value) => handleSettingChange("appearance", "theme", value)}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <span className="inline-flex items-center gap-2"><Sun className="w-4 h-4" />Claro</span>
                      </SelectItem>
                      <SelectItem value="dark">
                        <span className="inline-flex items-center gap-2"><Moon className="w-4 h-4" />Escuro</span>
                      </SelectItem>
                      <SelectItem value="system">
                        <span className="inline-flex items-center gap-2"><Monitor className="w-4 h-4" />Sistema</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Animações</Label>
                    <p className="text-sm text-muted-foreground">Ativar efeitos visuais.</p>
                  </div>
                  <Switch
                    checked={settings.appearance.animations}
                    onCheckedChange={(checked) => handleSettingChange("appearance", "animations", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Modo compacto</Label>
                    <p className="text-sm text-muted-foreground">Ajustar a densidade da interface.</p>
                  </div>
                  <Switch
                    checked={settings.appearance.compactMode}
                    onCheckedChange={(checked) => handleSettingChange("appearance", "compactMode", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Notificações
                </CardTitle>
                <CardDescription>Controle como receber avisos do sistema.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Push</Label>
                    <p className="text-sm text-muted-foreground">Receber notificações do navegador.</p>
                  </div>
                  <Switch checked={settings.notifications.push} onCheckedChange={(checked) => handleSettingChange("notifications", "push", checked)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Email semanal</Label>
                    <p className="text-sm text-muted-foreground">Resumo dos eventos e vitórias.</p>
                  </div>
                  <Switch checked={settings.notifications.weeklyEmail} onCheckedChange={(checked) => handleSettingChange("notifications", "weeklyEmail", checked)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Lembretes de partidas</Label>
                    <p className="text-sm text-muted-foreground">Avisos antes dos jogos.</p>
                  </div>
                  <Switch checked={settings.notifications.gameReminders} onCheckedChange={(checked) => handleSettingChange("notifications", "gameReminders", checked)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Atualizações da atlética</Label>
                    <p className="text-sm text-muted-foreground">Novidades e anúncios relevantes.</p>
                  </div>
                  <Switch checked={settings.notifications.teamUpdates} onCheckedChange={(checked) => handleSettingChange("notifications", "teamUpdates", checked)} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Idioma e região
                </CardTitle>
                <CardDescription>Configure idioma, fuso horário e moeda.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="grid gap-2">
                    <Label>Idioma</Label>
                    <Select value={settings.locale.language} onValueChange={(value) => handleSettingChange("locale", "language", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">Inglês (US)</SelectItem>
                        <SelectItem value="es-ES">Espanhol</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Fuso horário</Label>
                    <Select value={settings.locale.timezone} onValueChange={(value) => handleSettingChange("locale", "timezone", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="america-sao-paulo">America/São Paulo</SelectItem>
                        <SelectItem value="america-rio">America/Rio de Janeiro</SelectItem>
                        <SelectItem value="utc">UTC</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Moeda</Label>
                    <Select value={settings.locale.currency} onValueChange={(value) => handleSettingChange("locale", "currency", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brl">Real (BRL)</SelectItem>
                        <SelectItem value="usd">Dólar (USD)</SelectItem>
                        <SelectItem value="eur">Euro (EUR)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Button variant="outline" onClick={() => setHasUnsavedChanges(false)} disabled={!hasUnsavedChanges}>
              Cancelar
            </Button>
            <Button className="gold-gradient text-primary-foreground" onClick={handleSaveProfile} disabled={isSavingProfile || !hasUnsavedChanges}>
              {isSavingProfile ? "Salvando..." : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar alterações
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Globe, KeyRound, Monitor, Moon, Palette, Save, Settings as SettingsIcon, Shield, Sun, User } from "lucide-react";
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
import { useI18n } from "@/contexts/I18nContext";
import { LANGUAGES, Language } from "@/i18n/messages";

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
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading, refreshUser } = useCurrentUser();
  const { language, setLanguage, t } = useI18n();
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [name, setName] = useState("");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
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
  });

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }

    setName(user.nome || "");
  }, [user, loading, router]);

  const handleNameChange = (value: string) => {
    setName(value);
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
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setIsSavingProfile(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: name.trim() }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || t("settings.toast.saveError"));
      }

      await refreshUser();
      setHasUnsavedChanges(false);
      toast.success(t("settings.toast.saved"));
    } catch (error: any) {
      toast.error(error.message || t("settings.toast.saveError"));
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleChangePassword = () => {
    toast.info(t("settings.security.changePasswordSoon"));
  };

  if (loading && !user) {
    return (
      <div className="flex min-h-screen bg-background">
        <DashboardSidebar />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">{t("settings.loading")}</p>
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
              {t("settings.title")}
            </h1>
            <p className="text-sm text-muted-foreground">{t("settings.subtitle")}</p>
          </div>
        </header>

        <div className="p-6 max-w-6xl mx-auto space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  {t("settings.profile.title")}
                </CardTitle>
                <CardDescription>{t("settings.profile.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">{t("settings.profile.name")}</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(event) => handleNameChange(event.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">{t("settings.profile.email")}</Label>
                  <Input id="email" type="email" value={user?.email || ""} readOnly className="bg-secondary/40" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="curso">{t("settings.profile.course")}</Label>
                  <Input id="curso" value={user?.curso || ""} readOnly className="bg-secondary/40" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">{t("settings.profile.role")}</Label>
                  <Input
                    id="role"
                    value={user?.e_admin ? t("role.admin") : t("role.member")}
                    readOnly
                    className="bg-secondary/40"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  {t("settings.security.title")}
                </CardTitle>
                <CardDescription>{t("settings.security.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  {t("settings.security.changePasswordHint")}
                </p>
                <Button variant="outline" className="w-full" onClick={handleChangePassword}>
                  <KeyRound className="w-4 h-4 mr-2" />
                  {t("settings.security.changePassword")}
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  {t("settings.appearance.title")}
                </CardTitle>
                <CardDescription>{t("settings.appearance.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <Label>{t("settings.appearance.theme")}</Label>
                    <p className="text-sm text-muted-foreground">{t("settings.appearance.themeHint")}</p>
                  </div>
                  <Select value={settings.appearance.theme} onValueChange={(value) => handleSettingChange("appearance", "theme", value)}>
                    <SelectTrigger className="w-36">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <span className="inline-flex items-center gap-2"><Sun className="w-4 h-4" />{t("settings.appearance.theme.light")}</span>
                      </SelectItem>
                      <SelectItem value="dark">
                        <span className="inline-flex items-center gap-2"><Moon className="w-4 h-4" />{t("settings.appearance.theme.dark")}</span>
                      </SelectItem>
                      <SelectItem value="system">
                        <span className="inline-flex items-center gap-2"><Monitor className="w-4 h-4" />{t("settings.appearance.theme.system")}</span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t("settings.appearance.animations")}</Label>
                    <p className="text-sm text-muted-foreground">{t("settings.appearance.animationsHint")}</p>
                  </div>
                  <Switch
                    checked={settings.appearance.animations}
                    onCheckedChange={(checked) => handleSettingChange("appearance", "animations", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t("settings.appearance.compact")}</Label>
                    <p className="text-sm text-muted-foreground">{t("settings.appearance.compactHint")}</p>
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
                  {t("settings.notifications.title")}
                </CardTitle>
                <CardDescription>{t("settings.notifications.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t("settings.notifications.push")}</Label>
                    <p className="text-sm text-muted-foreground">{t("settings.notifications.pushHint")}</p>
                  </div>
                  <Switch checked={settings.notifications.push} onCheckedChange={(checked) => handleSettingChange("notifications", "push", checked)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t("settings.notifications.weeklyEmail")}</Label>
                    <p className="text-sm text-muted-foreground">{t("settings.notifications.weeklyEmailHint")}</p>
                  </div>
                  <Switch checked={settings.notifications.weeklyEmail} onCheckedChange={(checked) => handleSettingChange("notifications", "weeklyEmail", checked)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t("settings.notifications.gameReminders")}</Label>
                    <p className="text-sm text-muted-foreground">{t("settings.notifications.gameRemindersHint")}</p>
                  </div>
                  <Switch checked={settings.notifications.gameReminders} onCheckedChange={(checked) => handleSettingChange("notifications", "gameReminders", checked)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>{t("settings.notifications.teamUpdates")}</Label>
                    <p className="text-sm text-muted-foreground">{t("settings.notifications.teamUpdatesHint")}</p>
                  </div>
                  <Switch checked={settings.notifications.teamUpdates} onCheckedChange={(checked) => handleSettingChange("notifications", "teamUpdates", checked)} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  {t("settings.locale.title")}
                </CardTitle>
                <CardDescription>{t("settings.locale.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2 md:max-w-xs">
                  <Label>{t("settings.locale.language")}</Label>
                  <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-border">
            <Button
              variant="outline"
              onClick={() => {
                setName(user?.nome || "");
                setHasUnsavedChanges(false);
              }}
              disabled={!hasUnsavedChanges}
            >
              {t("settings.cancel")}
            </Button>
            <Button className="gold-gradient text-primary-foreground" onClick={handleSaveProfile} disabled={isSavingProfile || !hasUnsavedChanges}>
              {isSavingProfile ? t("settings.saving") : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t("settings.save")}
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

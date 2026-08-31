"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  User,
  Bell,
  Palette,
  Shield,
  Globe,
  Moon,
  Sun,
  Monitor,
  Save,
  Settings as SettingsIcon,
  CheckCircle,
  AlertCircle
} from "lucide-react"

interface SettingsState {
  profile: {
    name: string
    email: string
    position: string
  }
  appearance: {
    theme: string
    animations: boolean
    compactMode: boolean
  }
  notifications: {
    push: boolean
    weeklyEmail: boolean
    gameReminders: boolean
    teamUpdates: boolean
  }
  privacy: {
    publicProfile: boolean
    publicStats: boolean
  }
  locale: {
    language: string
    timezone: string
    currency: string
  }
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const [settings, setSettings] = useState<SettingsState>({
    profile: {
      name: "",
      email: "",
      position: ""
    },
    appearance: {
      theme: "dark",
      animations: true,
      compactMode: false
    },
    notifications: {
      push: true,
      weeklyEmail: false,
      gameReminders: true,
      teamUpdates: true
    },
    privacy: {
      publicProfile: true,
      publicStats: true
    },
    locale: {
      language: "pt-BR",
      timezone: "america-sao-paulo",
      currency: "brl"
    }
  })

  const handleSettingChange = (section: keyof SettingsState, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }))
    setHasUnsavedChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setHasUnsavedChanges(false)
      toast({
        title: "Configurações salvas",
        description: "Suas preferências foram atualizadas com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar suas configurações.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-primary">Configurações</h1>
            <p className="text-muted-foreground">Gerencie suas preferências e configurações do sistema</p>
          </div>
        </div>
        {hasUnsavedChanges && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Alterações não salvas
          </Badge>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Perfil */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Perfil
            </CardTitle>
            <CardDescription>
              Informações pessoais e preferências do usuário
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                placeholder="Seu nome completo"
                value={settings.profile.name}
                onChange={(e) => handleSettingChange('profile', 'name', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={settings.profile.email}
                onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="position">Posição</Label>
              <Select
                value={settings.profile.position}
                onValueChange={(value) => handleSettingChange('profile', 'position', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione sua posição" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="goleiro">Goleiro</SelectItem>
                  <SelectItem value="zagueiro">Zagueiro</SelectItem>
                  <SelectItem value="lateral">Lateral</SelectItem>
                  <SelectItem value="meio-campo">Meio-campo</SelectItem>
                  <SelectItem value="atacante">Atacante</SelectItem>
                  <SelectItem value="tecnico">Técnico</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Aparência */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-primary" />
              Aparência
            </CardTitle>
            <CardDescription>
              Personalize a aparência da aplicação
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Tema</Label>
                <p className="text-sm text-muted-foreground">Escolha o tema da aplicação</p>
              </div>
              <Select
                value={settings.appearance.theme}
                onValueChange={(value) => handleSettingChange('appearance', 'theme', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="w-4 h-4" />
                      Claro
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="w-4 h-4" />
                      Escuro
                    </div>
                  </SelectItem>
                  <SelectItem value="system">
                    <div className="flex items-center gap-2">
                      <Monitor className="w-4 h-4" />
                      Sistema
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Animações</Label>
                <p className="text-sm text-muted-foreground">Ativar animações visuais</p>
              </div>
              <Switch
                checked={settings.appearance.animations}
                onCheckedChange={(checked) => handleSettingChange('appearance', 'animations', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modo compacto</Label>
                <p className="text-sm text-muted-foreground">Interface mais compacta</p>
              </div>
              <Switch
                checked={settings.appearance.compactMode}
                onCheckedChange={(checked) => handleSettingChange('appearance', 'compactMode', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notificações */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Notificações
            </CardTitle>
            <CardDescription>
              Configure como deseja receber notificações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações push</Label>
                <p className="text-sm text-muted-foreground">Receber notificações no navegador</p>
              </div>
              <Switch
                checked={settings.notifications.push}
                onCheckedChange={(checked) => handleSettingChange('notifications', 'push', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email semanal</Label>
                <p className="text-sm text-muted-foreground">Relatório semanal por email</p>
              </div>
              <Switch
                checked={settings.notifications.weeklyEmail}
                onCheckedChange={(checked) => handleSettingChange('notifications', 'weeklyEmail', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Lembretes de jogos</Label>
                <p className="text-sm text-muted-foreground">Notificações antes dos jogos</p>
              </div>
              <Switch
                checked={settings.notifications.gameReminders}
                onCheckedChange={(checked) => handleSettingChange('notifications', 'gameReminders', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Atualizações do time</Label>
                <p className="text-sm text-muted-foreground">Mudanças no elenco e escalação</p>
              </div>
              <Switch
                checked={settings.notifications.teamUpdates}
                onCheckedChange={(checked) => handleSettingChange('notifications', 'teamUpdates', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacidade e Segurança */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Privacidade e Segurança
            </CardTitle>
            <CardDescription>
              Controle sua privacidade e segurança
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Separator />
            <div className="grid gap-2">
              <Label htmlFor="current-password">Senha atual</Label>
              <Input id="current-password" type="password" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="new-password">Nova senha</Label>
              <Input id="new-password" type="password" />
            </div>
            <Button variant="outline" className="w-full">
              Alterar senha
            </Button>
          </CardContent>
        </Card>

        {/* Idioma e Região */}
        <Card className="border-border md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Idioma e Região
            </CardTitle>
            <CardDescription>
              Configure idioma e preferências regionais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-2">
                <Label>Idioma</Label>
                <Select
                  value={settings.locale.language}
                  onValueChange={(value) => handleSettingChange('locale', 'language', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="es-ES">Español</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Fuso horário</Label>
                <Select
                  value={settings.locale.timezone}
                  onValueChange={(value) => handleSettingChange('locale', 'timezone', value)}
                >
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
                <Select
                  value={settings.locale.currency}
                  onValueChange={(value) => handleSettingChange('locale', 'currency', value)}
                >
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

      {/* Ações */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button variant="outline" disabled={isSaving}>
          Cancelar
        </Button>
        <Button
          className="bg-primary hover:bg-primary/90"
          onClick={handleSave}
          disabled={isSaving || !hasUnsavedChanges}
        >
          {isSaving ? (
            <>
              <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              Salvar alterações
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
"use client";

import { useEffect, useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/contexts/I18nContext";

interface MemberFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MemberData) => Promise<void>;
  initialData?: MemberData;
  isLoading?: boolean;
}



export interface MemberData {
  id?: string;
  nome: string;
  email: string;
  curso: string;
  ano_curso: string;
  password?: string;
}

export function MemberModal({ isOpen, onClose, onSubmit, initialData, isLoading }: MemberFormProps) {
  const { t } = useI18n();
  const [formData, setFormData] = useState<MemberData>({
    nome: "",
    email: "",
    curso: "",
    ano_curso: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ nome: "", email: "", curso: "", ano_curso: "", password: "" });
    }
    setError("");
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.nome || !formData.email || !formData.curso || !formData.ano_curso) {
      setError(t("memberModal.errorRequired"));
      return;
    }

    if (!initialData && !formData.password) {
      setError(t("memberModal.errorPassword"));
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || t("memberModal.error"));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">
            {initialData ? t("memberModal.edit") : t("memberModal.new")}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("memberModal.name")}</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              placeholder={t("memberModal.namePlaceholder")}
              className="w-full px-3 py-2 rounded-lg border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("memberModal.email")}</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="email@example.com"
              className="w-full px-3 py-2 rounded-lg border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("memberModal.course")}</label>
            <input
              type="text"
              value={formData.curso}
              onChange={(e) =>
                setFormData({ ...formData, curso: e.target.value })
              }
              placeholder={t("memberModal.coursePlaceholder")}
              className="w-full px-3 py-2 rounded-lg border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">{t("memberModal.year")}</label>
            <input
              type="text"
              value={formData.ano_curso}
              onChange={(e) =>
                setFormData({ ...formData, ano_curso: e.target.value })
              }
              placeholder={t("memberModal.yearPlaceholder")}
              className="w-full px-3 py-2 rounded-lg border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {initialData ? t("memberModal.passwordEdit") : t("memberModal.password")}
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={formData.password || ""}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                placeholder={initialData ? "•••••••••" : "Sua senha"}
                className="w-full px-3 py-2 pr-10 rounded-lg border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 gold-gradient text-primary-foreground hover:opacity-90"
            >
              {isLoading ? t("common.saving") : initialData ? t("memberModal.update") : t("memberModal.create")}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

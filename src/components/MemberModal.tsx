"use client";

import { useEffect, useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      setError("Nome, email, curso e ano do curso são obrigatórios");
      return;
    }

    if (!initialData && !formData.password) {
      setError("Senha é obrigatória para novos membros");
      return;
    }

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar membro");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold text-foreground">
            {initialData ? "Editar Membro" : "Novo Membro"}
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
            <label className="text-sm font-medium text-foreground">Nome</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) =>
                setFormData({ ...formData, nome: e.target.value })
              }
              placeholder="Nome completo"
              className="w-full px-3 py-2 rounded-lg border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Email</label>
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
            <label className="text-sm font-medium text-foreground">Curso</label>
            <input
              type="text"
              value={formData.curso}
              onChange={(e) =>
                setFormData({ ...formData, curso: e.target.value })
              }
              placeholder="ex: Engenharia de Software"
              className="w-full px-3 py-2 rounded-lg border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Ano do Curso</label>
            <input
              type="text"
              value={formData.ano_curso}
              onChange={(e) =>
                setFormData({ ...formData, ano_curso: e.target.value })
              }
              placeholder="ex: 1º ano"
              className="w-full px-3 py-2 rounded-lg border border-border bg-secondary/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              {initialData ? "Senha (deixe em branco para manter)" : "Senha"}
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
              {isLoading ? "Salvando..." : initialData ? "Atualizar" : "Criar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

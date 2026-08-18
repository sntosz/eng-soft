"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Match } from "@/types";

interface MatchFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Match>) => Promise<void>;
  initialData?: Match;
}

// Interface auxiliar para o formato do formulário local
interface MatchFormState {
  time_casa: string
  time_visitante: string;
  data_partida: string;
  local_partida: string;
}

export function MatchModal({ isOpen, onClose, onSubmit, initialData }: MatchFormProps) {
  // 2. Use a interface do formulário no generics do useState
  const [formData, setFormData] = useState<MatchFormState>({
    time_casa: "SWE",
    time_visitante: "",
    data_partida: new Date().toISOString().slice(0, 16),
    local_partida: "",
  });

  useEffect(() => {
    if (initialData) {
      const formattedDate = initialData.data_partida
          ? new Date(initialData.data_partida).toISOString().slice(0, 16)
          : "";

      // Se initialData.time_casa já vier formatado do backend, mantém;
      // caso contrário, ajusta para o estado do formulário
      setFormData({
        ...initialData,
        time_casa: initialData.time_casa ?? "Unigran Capital",
        time_visitante: initialData.time_visitante ?? "Unigran",
        data_partida: formattedDate,
        local_partida: initialData.local_partida ?? "",
      });
    } else {
      setFormData({
        time_casa: "Unigran Capital",
        time_visitante: "Unigran",
        data_partida: new Date().toISOString().slice(0, 16),
        local_partida: "",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const timeCasaStr = typeof formData.time_casa === "object"
        ? `${formData.time_casa.name} (${formData.time_casa.short})`.trim()
        : formData.time_casa;

    const timeVisitanteStr = typeof formData.time_visitante === "object"
        ? `${formData.time_visitante.name} (${formData.time_visitante.short})`.trim()
        : formData.time_visitante;

    const payload: Partial<Match> = {
      ...formData,
      time_casa: timeCasaStr,
      time_visitante: timeVisitanteStr,
    };

    await onSubmit(payload);
  };

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
        {/* 2. Envolvendo o modal em uma tag <form> com onSubmit */}
        <form
            onSubmit={handleSubmit}
            className="bg-card w-full max-w-lg rounded-xl border border-border shadow-lg overflow-hidden flex flex-col max-h-[90vh]"
        >
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-display font-bold text-lg">
              {initialData ? "Editar Partida" : "Nova Partida"}
            </h2>
            <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-4 overflow-y-auto space-y-4">
            <div className="grid grid-cols-2 gap-4 border p-3 rounded-lg border-border">
              <div>
                <label className="text-sm font-medium mb-1 block text-primary">
                  Time Casa (Sigla)
                </label>
                <input
                    type="text"
                    value={formData.time_casa?.short || ""}
                    onChange={(e) =>
                        setFormData({
                          ...formData,
                          time_casa: { ...formData.time_casa!, short: e.target.value },
                        })
                    }
                    className="w-full px-3 py-2 rounded-md border bg-secondary/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-primary">
                  Time Casa (Nome)
                </label>
                <input
                    type="text"
                    value={formData.time_casa?.name || ""}
                    onChange={(e) =>
                        setFormData({
                          ...formData,
                          time_casa: { ...formData.time_casa!, name: e.target.value },
                        })
                    }
                    className="w-full px-3 py-2 rounded-md border bg-secondary/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border p-3 rounded-lg border-border">
              <div>
                <label className="text-sm font-medium mb-1 block text-destructive">
                  Time Fora (Sigla)
                </label>
                <input
                    type="text"
                    value={formData.time_visitante?.short || ""}
                    onChange={(e) =>
                        setFormData({
                          ...formData,
                          time_visitante: { ...formData.time_visitante!, short: e.target.value },
                        })
                    }
                    className="w-full px-3 py-2 rounded-md border bg-secondary/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block text-destructive">
                  Time Fora (Nome)
                </label>
                <input
                    type="text"
                    value={formData.time_visitante?.name || ""}
                    onChange={(e) =>
                        setFormData({
                          ...formData,
                          time_visitante: { ...formData.time_visitante!, name: e.target.value },
                        })
                    }
                    className="w-full px-3 py-2 rounded-md border bg-secondary/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Data e Hora</label>
                <input
                    type="datetime-local"
                    value={formData.data_partida || ""}
                    onChange={(e) =>
                        setFormData({ ...formData, data_partida: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-md border bg-secondary/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Local</label>
                <input
                    type="text"
                    value={formData.local_partida || ""}
                    onChange={(e) =>
                        setFormData({ ...formData, local_partida: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-md border bg-secondary/50"
                />
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-border flex justify-end gap-2">
            {/* 3. Definindo type="button" no cancelar para ele NÃO submeter */}
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            {/* 4. Definindo type="submit" no salvar */}
            <Button type="submit" className="gold-gradient text-primary-foreground">
              Salvar
            </Button>
          </div>
        </form>
      </div>
  );
}
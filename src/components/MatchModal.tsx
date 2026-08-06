import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Match, Team } from "@/types";

interface MatchFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Match>) => Promise<void>;
  initialData?: Match;
}

export function MatchModal({ isOpen, onClose, onSubmit, initialData }: MatchFormProps) {
  const [formData, setFormData] = useState<Partial<Match>>({
    time_casa: { short: "SWE", name: "Software Eng." },
    time_fora: { short: "", name: "" },
    placar_casa: 0,
    placar_fora: 0,
    data_partida: new Date().toISOString().slice(0, 16),
    local: "",
    campeonato: "",
  });

  useEffect(() => {
    if (initialData) {
      const formattedDate = initialData.data_partida ? new Date(initialData.data_partida).toISOString().slice(0, 16) : "";
      setFormData({ ...initialData, data_partida: formattedDate });
    } else {
      setFormData({
        time_casa: { short: "SWE", name: "Software Eng." },
        time_fora: { short: "", name: "" },
        placar_casa: 0,
        placar_fora: 0,
        data_partida: new Date().toISOString().slice(0, 16),
        local: "",
        campeonato: "",
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card w-full max-w-lg rounded-xl border border-border shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-display font-bold text-lg">
            {initialData ? "Editar Partida" : "Nova Partida"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-4 overflow-y-auto space-y-4">
          <div className="grid grid-cols-2 gap-4 border p-3 rounded-lg border-border">
            <div>
              <label className="text-sm font-medium mb-1 block text-primary">Time Casa (Sigla)</label>
              <input
                type="text"
                value={formData.time_casa?.short || ""}
                onChange={(e) => setFormData({ ...formData, time_casa: { ...formData.time_casa!, short: e.target.value } })}
                className="w-full px-3 py-2 rounded-md border bg-secondary/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-primary">Time Casa (Nome)</label>
              <input
                type="text"
                value={formData.time_casa?.name || ""}
                onChange={(e) => setFormData({ ...formData, time_casa: { ...formData.time_casa!, name: e.target.value } })}
                className="w-full px-3 py-2 rounded-md border bg-secondary/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-primary">Placar Casa</label>
              <input
                type="number"
                value={formData.placar_casa || 0}
                onChange={(e) => setFormData({ ...formData, placar_casa: parseInt(e.target.value, 10) })}
                className="w-full px-3 py-2 rounded-md border bg-secondary/50"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 border p-3 rounded-lg border-border">
            <div>
              <label className="text-sm font-medium mb-1 block text-destructive">Time Fora (Sigla)</label>
              <input
                type="text"
                value={formData.time_fora?.short || ""}
                onChange={(e) => setFormData({ ...formData, time_fora: { ...formData.time_fora!, short: e.target.value } })}
                className="w-full px-3 py-2 rounded-md border bg-secondary/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block text-destructive">Time Fora (Nome)</label>
              <input
                type="text"
                value={formData.time_fora?.name || ""}
                onChange={(e) => setFormData({ ...formData, time_fora: { ...formData.time_fora!, name: e.target.value } })}
                className="w-full px-3 py-2 rounded-md border bg-secondary/50"
              />
            </div>
             <div>
              <label className="text-sm font-medium mb-1 block text-destructive">Placar Fora</label>
              <input
                type="number"
                value={formData.placar_fora || 0}
                onChange={(e) => setFormData({ ...formData, placar_fora: parseInt(e.target.value, 10) })}
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
                onChange={(e) => setFormData({ ...formData, data_partida: e.target.value })}
                className="w-full px-3 py-2 rounded-md border bg-secondary/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Local</label>
              <input
                type="text"
                value={formData.local || ""}
                onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                className="w-full px-3 py-2 rounded-md border bg-secondary/50"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Campeonato</label>
            <input
              type="text"
              value={formData.campeonato || ""}
              onChange={(e) => setFormData({ ...formData, campeonato: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-secondary/50"
            />
          </div>
        </div>
        <div className="p-4 border-t border-border flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => onSubmit(formData)} className="gold-gradient text-primary-foreground">
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}

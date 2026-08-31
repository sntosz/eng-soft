"use client";

import { useEffect, useState } from "react";
import { X, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Match } from "@/types";
import { uploadImage } from "@/lib/upload";

interface MatchFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Match>) => Promise<void>;
  initialData?: Match;
}

interface MatchFormState {
  time_casa: string;
  time_visitante: string;
  data_partida: string;
  local_partida: string;
  vitoria_atletica: boolean;
  foto_casa: string;
  foto_visitante: string;
}

const formatToLocalDateTimeInput = (dateStr?: string) => {
  if (!dateStr) {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  }
  const date = new Date(dateStr);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

export function MatchModal({ isOpen, onClose, onSubmit, initialData }: MatchFormProps) {
  const [formData, setFormData] = useState<MatchFormState>({
    time_casa: "",
    time_visitante: "",
    data_partida: formatToLocalDateTimeInput(),
    local_partida: "",
    vitoria_atletica: false,
    foto_casa: "",
    foto_visitante: "",
  });

  const [fileCasa, setFileCasa] = useState<File | null>(null);
  const [fileVisitante, setFileVisitante] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        time_casa: initialData.time_casa || "",
        time_visitante: initialData.time_visitante || "",
        data_partida: formatToLocalDateTimeInput(initialData.data_partida),
        local_partida: initialData.local_partida || "",
        vitoria_atletica: Boolean(initialData.vitoria_atletica),
        foto_casa: initialData.foto_casa || "",
        foto_visitante: initialData.foto_visitante || "",
      });
    } else {
      setFormData({
        time_casa: "AAAES",
        time_visitante: "",
        data_partida: formatToLocalDateTimeInput(),
        local_partida: "Arena Principal",
        vitoria_atletica: false,
        foto_casa: "",
        foto_visitante: "",
      });
    }
    setFileCasa(null);
    setFileVisitante(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let urlCasa = formData.foto_casa;
      let urlVisitante = formData.foto_visitante;

      // Realiza o upload pelo seu endpoint caso novos arquivos tenham sido selecionados
      if (fileCasa) {
        urlCasa = await uploadImage(fileCasa, "partida");
      }

      if (fileVisitante) {
        urlVisitante = await uploadImage(fileVisitante, "partida");
      }

      const payload: Partial<Match> = {
        ...(initialData?.id ? { id: initialData.id } : {}),
        time_casa: formData.time_casa.trim(),
        time_visitante: formData.time_visitante.trim(),
        data_partida: new Date(formData.data_partida).toISOString(),
        local_partida: formData.local_partida.trim(),
        vitoria_atletica: formData.vitoria_atletica,
        foto_casa: urlCasa,
        foto_visitante: urlVisitante,
      };

      await onSubmit(payload);
    } catch (err: any) {
      alert(err.message || "Erro ao salvar a partida");
    } finally {
      setSubmitting(false);
    }
  };

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
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
            <div className="p-3 border border-border rounded-lg space-y-2">
              <label className="text-sm font-medium block text-primary">Time da Casa</label>
              <input
                  type="text"
                  required
                  value={formData.time_casa}
                  onChange={(e) => setFormData({ ...formData, time_casa: e.target.value })}
                  placeholder="Ex: AAAES"
                  className="w-full px-3 py-2 rounded-md border border-border bg-secondary/50"
              />
              <div className="flex items-center gap-2 pt-1">
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    id="fileCasa"
                    className="hidden"
                    onChange={(e) => setFileCasa(e.target.files?.[0] || null)}
                />
                <label
                    htmlFor="fileCasa"
                    className="cursor-pointer text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border hover:bg-secondary transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {fileCasa ? fileCasa.name : "Selecionar Logo"}
                </label>
                {(fileCasa || formData.foto_casa) && (
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {fileCasa ? "Pronto para envio" : "Imagem já cadastrada"}
                </span>
                )}
              </div>
            </div>

            <div className="p-3 border border-border rounded-lg space-y-2">
              <label className="text-sm font-medium block text-destructive">Time Visitante</label>
              <input
                  type="text"
                  required
                  value={formData.time_visitante}
                  onChange={(e) => setFormData({ ...formData, time_visitante: e.target.value })}
                  placeholder="Ex: LAW"
                  className="w-full px-3 py-2 rounded-md border border-border bg-secondary/50"
              />
              <div className="flex items-center gap-2 pt-1">
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    id="fileVisitante"
                    className="hidden"
                    onChange={(e) => setFileVisitante(e.target.files?.[0] || null)}
                />
                <label
                    htmlFor="fileVisitante"
                    className="cursor-pointer text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border hover:bg-secondary transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {fileVisitante ? fileVisitante.name : "Selecionar Logo"}
                </label>
                {(fileVisitante || formData.foto_visitante) && (
                    <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                  {fileVisitante ? "Pronto para envio" : "Imagem já cadastrada"}
                </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Data e Hora</label>
                <input
                    type="datetime-local"
                    required
                    value={formData.data_partida}
                    onChange={(e) => setFormData({ ...formData, data_partida: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-border bg-secondary/50"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Local</label>
                <input
                    type="text"
                    required
                    value={formData.local_partida}
                    onChange={(e) => setFormData({ ...formData, local_partida: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-border bg-secondary/50"
                />
              </div>
            </div>

            <div className="border-t border-border pt-4">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                    type="checkbox"
                    checked={formData.vitoria_atletica}
                    onChange={(e) => setFormData({ ...formData, vitoria_atletica: e.target.checked })}
                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary bg-secondary/50 cursor-pointer"
                />
                <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  Vitória do time da casa ({formData.time_casa || "Casa"})
                </span>
                  <span className="text-xs text-muted-foreground">
                  Marque se a partida já encerrou com vitória da casa
                </span>
                </div>
              </label>
            </div>
          </div>

          <div className="p-4 border-t border-border flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button
                type="submit"
                disabled={submitting}
                className="gold-gradient text-primary-foreground flex items-center gap-2"
            >
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitting ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </div>
  );
}
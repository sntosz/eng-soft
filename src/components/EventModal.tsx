"use client";

import { useEffect, useState } from "react";
import { X, Upload, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Event } from "@/types";
import { isValidImageUrl } from "@/lib/utils";
import { uploadImage } from "@/lib/upload";
import { toast } from "@/components/ui/sonner";

interface EventFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Event>) => Promise<void>;
  initialData?: Event;
}

export function EventModal({ isOpen, onClose, onSubmit, initialData }: EventFormProps) {
  const [formData, setFormData] = useState<Partial<Event>>({
    nome: "",
    descricao: "",
    data_evento: new Date().toISOString().slice(0, 16),
    local: "",
    imagem_url: "",
    preco: 0,
  });

  const [fileEvent, setFileEvent] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      const formattedDate = initialData.data_evento
        ? new Date(initialData.data_evento).toISOString().slice(0, 16)
        : "";
      setFormData({ ...initialData, data_evento: formattedDate });
    } else {
      setFormData({
        nome: "",
        descricao: "",
        data_evento: new Date().toISOString().slice(0, 16),
        local: "",
        imagem_url: "",
        preco: 0,
      });
    }
    setFileEvent(null);
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!formData.nome?.trim()) {
      toast.error("Preencha o nome do evento.");
      return;
    }

    try {
      setSubmitting(true);

      let finalImageUrl = formData.imagem_url?.trim() || "";

      if (fileEvent) {
        finalImageUrl = await uploadImage(fileEvent, "evento");
      }

      if (finalImageUrl && !isValidImageUrl(finalImageUrl)) {
        toast.error("Selecione uma imagem válida para o evento.");
        return;
      }

      await onSubmit({
        ...formData,
        nome: formData.nome?.trim(),
        local: formData.local?.trim(),
        imagem_url: finalImageUrl,
      });
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar evento");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card w-full max-w-lg rounded-xl border border-border shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h2 className="font-display font-bold text-lg">
              {initialData ? "Editar Evento" : "Novo Evento"}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Nome do Evento *</label>
            <input
              type="text"
              required
              value={formData.nome || ""}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              placeholder="Ex: Choppada da Engenharia"
              className="w-full px-3 py-2 rounded-md border border-border bg-secondary/50 text-foreground"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Descrição</label>
            <textarea
              rows={3}
              value={formData.descricao || ""}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              placeholder="Detalhes sobre atrações, horários e atrações do evento..."
              className="w-full px-3 py-2 rounded-md border border-border bg-secondary/50 text-foreground"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Data e Hora *</label>
              <input
                type="datetime-local"
                required
                value={formData.data_evento || ""}
                onChange={(e) => setFormData({ ...formData, data_evento: e.target.value })}
                className="w-full px-3 py-2 rounded-md border border-border bg-secondary/50 text-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.preco || 0}
                onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-md border border-border bg-secondary/50 text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Local</label>
            <input
              type="text"
              value={formData.local || ""}
              onChange={(e) => setFormData({ ...formData, local: e.target.value })}
              placeholder="Ex: Arena Unigran Capital"
              className="w-full px-3 py-2 rounded-md border border-border bg-secondary/50 text-foreground"
            />
          </div>

          <div className="space-y-2 pt-1 border-t border-border">
            <label className="text-sm font-medium block">Imagem de Divulgação</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                id="fileEvent"
                className="hidden"
                onChange={(e) => setFileEvent(e.target.files?.[0] || null)}
              />
              <label
                htmlFor="fileEvent"
                className="cursor-pointer text-xs flex items-center gap-1.5 px-3 py-2 rounded-md border border-border hover:bg-secondary transition-colors"
              >
                <Upload className="w-3.5 h-3.5" />
                {fileEvent ? fileEvent.name : "Fazer Upload de Foto"}
              </label>

              {(fileEvent || formData.imagem_url) && (
                <span className="text-xs text-muted-foreground truncate max-w-[240px]">
                  {fileEvent ? "Foto pronta para envio" : "Imagem já vinculada"}
                </span>
              )}
            </div>

          </div>
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-2 bg-muted/20">
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={submitting}
            className="gold-gradient text-primary-foreground flex items-center gap-2 font-semibold"
          >
            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {submitting ? "Salvando..." : "Salvar Evento"}
          </Button>
        </div>
      </div>
    </div>
  );
}

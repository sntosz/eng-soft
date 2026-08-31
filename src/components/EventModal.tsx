import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Event } from "@/types";
import { isValidImageUrl } from "@/lib/utils";

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

  useEffect(() => {
    if (initialData) {
      const formattedDate = initialData.data_evento ? new Date(initialData.data_evento).toISOString().slice(0, 16) : "";
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
  }, [initialData, isOpen]);

  const handleSave = async () => {
    if (!formData.nome?.trim()) {
      alert("Por favor, preencha o nome do evento.");
      return;
    }

    const trimmedUrl = formData.imagem_url?.trim() || "";
    if (trimmedUrl && !isValidImageUrl(trimmedUrl)) {
      alert("Por favor, insira uma URL válida para a imagem (começando com http:// ou https://) ou deixe o campo em branco.");
      return;
    }

    await onSubmit({
      ...formData,
      imagem_url: trimmedUrl,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-display font-bold text-lg">
            {initialData ? "Editar Evento" : "Novo Evento"}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="p-4 overflow-y-auto space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Nome do Evento</label>
            <input
              type="text"
              value={formData.nome || ""}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-secondary/50"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Descrição</label>
            <textarea
              value={formData.descricao || ""}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-secondary/50"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Data e Hora</label>
              <input
                type="datetime-local"
                value={formData.data_evento || ""}
                onChange={(e) => setFormData({ ...formData, data_evento: e.target.value })}
                className="w-full px-3 py-2 rounded-md border bg-secondary/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.preco || 0}
                onChange={(e) => setFormData({ ...formData, preco: parseFloat(e.target.value) })}
                className="w-full px-3 py-2 rounded-md border bg-secondary/50"
              />
            </div>
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
          <div>
            <label className="text-sm font-medium mb-1 block">URL da Imagem</label>
            <input
              type="text"
              placeholder="https://exemplo.com/imagem.jpg"
              value={formData.imagem_url || ""}
              onChange={(e) => setFormData({ ...formData, imagem_url: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-secondary/50"
            />
          </div>
        </div>
        <div className="p-4 border-t border-border flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} className="gold-gradient text-primary-foreground">
            Salvar
          </Button>
        </div>
      </div>
    </div>
  );
}

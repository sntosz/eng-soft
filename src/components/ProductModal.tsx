"use client";

import { useEffect, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Product } from "@/types";
import { uploadImage } from "@/lib/upload";

interface ProductFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Product>) => Promise<void>;
    initialData?: Product;
}

export function ProductModal({ isOpen, onClose, onSubmit, initialData }: ProductFormProps) {
    const [formData, setFormData] = useState<Partial<Product>>({
        nome: "",
        descricao: "",
        preco: 0,
        estoque: 0,
        imagem_url: "",
        destaque: false,
    });

    const [fileProduct, setFileProduct] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const formatCurrency = (val?: number) => {
        if (val === undefined || val === null || isNaN(val)) return "0,00";
        return new Intl.NumberFormat("pt-BR", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(val);
    };

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        } else {
            setFormData({ nome: "", descricao: "", preco: 0, estoque: 0, imagem_url: "", destaque: false });
        }
        setFileProduct(null);
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    const handleSave = async () => {
        try {
            setSubmitting(true);

            let finalImageUrl = formData.imagem_url;

            // Executa o upload do arquivo se um novo arquivo foi selecionado
            if (fileProduct) {
                finalImageUrl = await uploadImage(fileProduct, "produto");
            }

            const payload: Partial<Product> = {
                ...formData,
                imagem_url: finalImageUrl || null,
            };

            await onSubmit(payload);
        } catch (err: any) {
            alert(err.message || "Erro ao fazer upload ou salvar produto");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div className="bg-card w-full max-w-md rounded-xl border border-border shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="font-display font-bold text-lg">
                        {initialData ? "Editar Produto" : "Novo Produto"}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="p-4 overflow-y-auto space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Nome</label>
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
                            <label className="text-sm font-medium mb-1 block">Preço (R$)</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                value={formatCurrency(formData.preco)}
                                onChange={(e) => {
                                    const onlyDigits = e.target.value.replace(/\D/g, "");
                                    const numericValue = parseFloat(onlyDigits || "0") / 100;
                                    setFormData({ ...formData, preco: numericValue });
                                }}
                                className="w-full px-3 py-2 rounded-md border bg-secondary/50"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Estoque</label>
                            <input
                                type="number"
                                value={formData.estoque || 0}
                                onChange={(e) => setFormData({ ...formData, estoque: parseInt(e.target.value, 10) || 0 })}
                                className="w-full px-3 py-2 rounded-md border bg-secondary/50"
                            />
                        </div>
                    </div>

                    <div>
                        <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            id="fileProduct"
                            className="hidden"
                            onChange={(e) => setFileProduct(e.target.files?.[0] || null)}
                        />
                        <label
                            htmlFor="fileProduct"
                            className="cursor-pointer text-xs flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border hover:bg-secondary transition-colors"
                        >
                            <Upload className="w-3.5 h-3.5" />
                            {fileProduct ? fileProduct.name : "Selecionar Imagem"}
                        </label>
                        {(fileProduct || formData.imagem_url) && (
                            <span className="text-xs text-muted-foreground truncate max-w-[200px] block mt-1">
                {fileProduct ? "Pronto para envio" : "Imagem já cadastrada"}
              </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.destaque || false}
                            onChange={(e) => setFormData({ ...formData, destaque: e.target.checked })}
                            id="destaque"
                            className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-secondary/50 cursor-pointer"
                        />
                        <label htmlFor="destaque" className="text-sm font-medium cursor-pointer">
                            Produto em Destaque
                        </label>
                    </div>
                </div>

                <div className="p-4 border-t border-border flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose} disabled={submitting}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={submitting}
                        className="gold-gradient text-primary-foreground flex items-center gap-2"
                    >
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        {submitting ? "Salvando..." : "Salvar"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
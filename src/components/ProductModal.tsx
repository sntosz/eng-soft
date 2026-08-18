"use client";

import {useEffect, useState} from "react";
import {X} from "lucide-react";
import {Button} from "@/components/ui/button";
import {Product} from "@/types";

interface ProductFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Product>) => Promise<void>;
    initialData?: Product;
}

export function ProductModal({isOpen, onClose, onSubmit, initialData}: ProductFormProps) {
    const [formData, setFormData] = useState<Partial<Product>>({
        nome: "",
        descricao: "",
        preco: 0,
        estoque: 0,
        imagem_url: "",
        destaque: false,
    });

    // Helper para formatar o valor do estado em moeda brasileira (ex: 12.34 -> "12,34")
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
            setFormData({nome: "", descricao: "", preco: 0, estoque: 0, imagem_url: "", destaque: false});
        }
    }, [initialData, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <div
                className="bg-card w-full max-w-md rounded-xl border border-border shadow-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="font-display font-bold text-lg">
                        {initialData ? "Editar Produto" : "Novo Produto"}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                        <X className="w-4 h-4"/>
                    </Button>
                </div>
                <div className="p-4 overflow-y-auto space-y-4">
                    <div>
                        <label className="text-sm font-medium mb-1 block">Nome</label>
                        <input
                            type="text"
                            value={formData.nome || ""}
                            onChange={(e) => setFormData({...formData, nome: e.target.value})}
                            className="w-full px-3 py-2 rounded-md border bg-secondary/50"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">Descrição</label>
                        <textarea
                            value={formData.descricao || ""}
                            onChange={(e) => setFormData({...formData, descricao: e.target.value})}
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
                                    setFormData({...formData, preco: numericValue});
                                }}
                                className="w-full px-3 py-2 rounded-md border bg-secondary/50"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-medium mb-1 block">Estoque</label>
                            <input
                                type="number"
                                value={formData.estoque || 0}
                                onChange={(e) => setFormData({...formData, estoque: parseInt(e.target.value, 10) || 0})}
                                className="w-full px-3 py-2 rounded-md border bg-secondary/50"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-medium mb-1 block">URL da Imagem</label>
                        <input
                            type="text"
                            value={formData.imagem_url || ""}
                            onChange={(e) => setFormData({...formData, imagem_url: e.target.value})}
                            className="w-full px-3 py-2 rounded-md border bg-secondary/50"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.destaque || false}
                            onChange={(e) => setFormData({...formData, destaque: e.target.checked})}
                            id="destaque"
                        />
                        <label htmlFor="destaque" className="text-sm font-medium">Produto em Destaque</label>
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
"use client";

import {useEffect, useState} from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import Image from "next/image";
import {useCurrentUser} from "@/hooks/useCurrentUser";
import {ProductModal} from "@/components/ProductModal";
import {ShoppingBag, Package, Plus, Edit2, Trash2} from "lucide-react";
import {Product} from "@/types";
import {supabase} from "@/lib/supabase";

export default function StorePage() {
    const {user} = useCurrentUser();
    const isAdmin = user?.e_admin === true;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadProducts = async () => {
        try {
            setLoading(true);
            setError("");

            const {data, error: sbError} = await supabase
                .from("produtos")
                .select("*")
                .order("destaque", {ascending: false, nullsFirst: false})
                .order("nome", {ascending: true});

            if (sbError) {
                console.error("Erro retornado pelo Supabase:", sbError);
                throw sbError;
            }

            console.log("Produtos carregados:", data);
            setProducts(data || []);
        } catch (err: any) {
            console.error("Erro ao buscar produtos:", err);
            setError(err.message || "Erro ao buscar produtos");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const handleCreate = () => {
        setSelectedProduct(null);
        setIsModalOpen(true);
    };

    const handleEdit = (p: Product) => {
        setSelectedProduct(p);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este produto?")) return;
        try {
            const {error} = await supabase.from("produtos").delete().eq("id", id);
            if (error) throw error;
            setProducts((prev) => prev.filter((p) => p.id !== id));
        } catch (err: any) {
            alert("Erro ao excluir: " + err.message);
        }
    };

    const handleSubmit = async (data: Partial<Product>) => {
        try {
            if (data.id) {
                const {error} = await supabase.from("produtos").update(data).eq("id", data.id);
                if (error) throw error;
            } else {
                const {error} = await supabase.from("produtos").insert([data]);
                if (error) throw error;
            }
            setIsModalOpen(false);
            await loadProducts();
        } catch (err: any) {
            alert("Erro ao salvar: " + err.message);
        }
    };

    return (
        <div className="flex min-h-screen bg-background">
            <DashboardSidebar/>

            <main className="flex-1 overflow-y-auto">
                <header
                    className="sticky top-0 z-10 surface-glass border-b border-border px-6 py-4 flex items-center justify-between">
                    <div>
                        <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-primary"/>
                            Loja Oficial
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Produtos exclusivos da Atlética Engenharia de Software
                        </p>
                    </div>
                </header>

                <div className="p-6 max-w-7xl mx-auto">
                    {isAdmin && (
                        <div className="mb-6 flex justify-end">
                            <button
                                onClick={handleCreate}
                                className="gold-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4"/> Novo Produto
                            </button>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-muted-foreground">Carregando produtos...</p>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-destructive">{error}</p>
                        </div>
                    ) : products.length === 0 ? (
                        <div
                            className="flex items-center justify-center py-12 border-2 border-dashed border-border rounded-xl">
                            <p className="text-muted-foreground">Nenhum produto disponível na loja no momento.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {products.map((product) => {
                                const precoNumerico = Number(product.preco) || 0;
                                const precoFormatado = precoNumerico.toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                });
                                const estoque = Number(product.estoque) || 0;

                                return (
                                    <div
                                        key={product.id}
                                        className="bg-card border border-border rounded-xl overflow-hidden flex flex-col group card-glow"
                                    >
                                        <div
                                            className="h-52 bg-white relative flex items-center justify-center overflow-hidden border-b border-border/50">
                                            {product.imagem_url ? (
                                                <Image
                                                    src={product.imagem_url}
                                                    alt={product.nome || "Produto"}
                                                    fill
                                                    unoptimized
                                                    sizes="(max-width: 768px) 100vw, 350px"
                                                    className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                                                />
                                            ) : (
                                                <Package className="w-12 h-12 text-zinc-400"/>
                                            )}

                                            {product.destaque && (
                                                <div
                                                    className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-md shadow-md z-10">
                                                    Destaque
                                                </div>
                                            )}

                                            {estoque === 0 && (
                                                <div
                                                    className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-10">
                                                  <span
                                                      className="bg-destructive text-destructive-foreground font-bold px-4 py-2 rounded-lg transform -rotate-12 shadow-lg">
                                                    ESGOTADO
                                                  </span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex justify-between items-start mb-2 gap-2">
                                                <h3 className="font-display font-bold text-lg text-foreground line-clamp-2">
                                                    {product.nome}
                                                </h3>
                                                <span className="font-bold text-primary whitespace-nowrap">
                          {precoFormatado}
                        </span>
                                            </div>

                                            {product.descricao && (
                                                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                                                    {product.descricao}
                                                </p>
                                            )}

                                            <div
                                                className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {estoque > 0 ? `${estoque} em estoque` : "Sem estoque"}
                        </span>
                                                <button
                                                    disabled={estoque === 0}
                                                    className="gold-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Comprar
                                                </button>
                                            </div>

                                            {isAdmin && (
                                                <div className="mt-3 pt-3 border-t border-border flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className="flex-1 border border-border px-2 py-1 rounded text-xs flex items-center justify-center gap-1 hover:bg-secondary transition-colors"
                                                    >
                                                        <Edit2 className="w-3 h-3"/> Editar
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(product.id)}
                                                        className="flex-1 bg-destructive/10 text-destructive px-2 py-1 rounded text-xs flex items-center justify-center gap-1 hover:bg-destructive/20 transition-colors"
                                                    >
                                                        <Trash2 className="w-3 h-3"/> Excluir
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <ProductModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleSubmit}
                    initialData={selectedProduct || undefined}
                />
            </main>
        </div>
    );
}
"use client";

import { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import Image from "next/image";
import { ShoppingBag, Package } from "lucide-react";
import { Product } from "@/types";
import { supabase } from "@/lib/supabase";

const StorePage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const { data, error: sbError } = await supabase
          .from("produtos")
          .select("*")
          .order("destaque", { ascending: false })
          .order("nome", { ascending: true });

        if (sbError) {
          throw sbError;
        }

        setProducts(data || []);
      } catch (err: any) {
        setError(err.message || "Erro ao buscar produtos");
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 surface-glass border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Loja Oficial
            </h1>
            <p className="text-sm text-muted-foreground">
              Produtos exclusivos da Atlética Engenharia de Software
            </p>
          </div>
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Carregando produtos...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-destructive">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Nenhum produto disponível na loja no momento.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-card border border-border rounded-xl overflow-hidden flex flex-col group card-glow">
                  <div className="h-48 bg-muted relative flex items-center justify-center overflow-hidden">
                    {product.imagem_url ? (
                      <Image width={600} height={400}
                        src={product.imagem_url}
                        alt={product.nome}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <Package className="w-12 h-12 text-muted-foreground/30" />
                    )}

                    {product.destaque && (
                      <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded">
                        Destaque
                      </div>
                    )}
                    {product.estoque === 0 && (
                      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex items-center justify-center">
                        <span className="bg-destructive text-destructive-foreground font-bold px-4 py-2 rounded-lg transform -rotate-12">
                          ESGOTADO
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-display font-bold text-lg text-foreground line-clamp-2">
                        {product.nome}
                      </h3>
                      <span className="font-bold text-primary ml-4 whitespace-nowrap">
                        R$ {product.preco.toFixed(2)}
                      </span>
                    </div>

                    {product.descricao && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                        {product.descricao}
                      </p>
                    )}

                    <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {product.estoque > 0 ? `${product.estoque} em estoque` : "Sem estoque"}
                      </span>
                      <button
                        disabled={product.estoque === 0}
                        className="gold-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Comprar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default StorePage;

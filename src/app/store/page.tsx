"use client";

import { useEffect, useState } from "react";
import DashboardSidebar from "@/components/DashboardSidebar";
import Image from "next/image";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { ProductModal } from "@/components/ProductModal";
import { CheckoutModal } from "@/components/CheckoutModal";
import { ShoppingBag, Package, Plus, Edit2, Trash2, ClipboardList, CheckCircle, Clock, AlertTriangle, RefreshCw } from "lucide-react";
import { Product } from "@/types";
import { supabase } from "@/lib/supabase";
import { isValidImageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function StorePage() {
  const { user } = useCurrentUser();
  const isAdmin = user?.e_admin === true;

  const [activeTab, setActiveTab] = useState<"produtos" | "pedidos">("produtos");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Estados do fluxo de compra (Checkout)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [productForCheckout, setProductForCheckout] = useState<Product | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [error, setError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error: sbError } = await supabase
        .from("produtos")
        .select("*")
        .order("destaque", { ascending: false, nullsFirst: false })
        .order("nome", { ascending: true });

      if (sbError) {
        console.error("Erro retornado pelo Supabase:", sbError);
        throw sbError;
      }

      setProducts(data || []);
    } catch (err: any) {
      console.error("Erro ao buscar produtos:", err);
      setError(err.message || "Erro ao buscar produtos");
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await fetch("/api/orders");
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Erro ao carregar pedidos.");

      setOrders(data.pedidos || []);
    } catch (err: any) {
      console.error("Erro ao carregar pedidos:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (activeTab === "pedidos" && isAdmin) {
      loadOrders();
    }
  }, [activeTab, isAdmin]);

  const handleCreate = () => {
    setSelectedProduct(null);
    setIsModalOpen(true);
  };

  const handleEdit = (p: Product) => {
    setSelectedProduct(p);
    setIsModalOpen(true);
  };

  const handleBuy = (p: Product) => {
    setProductForCheckout(p);
    setIsCheckoutOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este produto?")) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao excluir produto");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert("Erro ao excluir: " + err.message);
    }
  };

  const handleSubmit = async (data: Partial<Product>) => {
    try {
      if (data.id) {
        const res = await fetch("/api/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const resJson = await res.json();
        if (!res.ok) throw new Error(resJson.error || "Erro ao atualizar produto");
      } else {
        const res = await fetch("/api/products/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        const resJson = await res.json();
        if (!res.ok) throw new Error(resJson.error || "Erro ao criar produto");
      }
      setIsModalOpen(false);
      await loadProducts();
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    }
  };

  const handleUpdateOrderStatus = async (pedidoId: string, novoStatus: string) => {
    try {
      setUpdatingOrderId(pedidoId);
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pedido_id: pedidoId,
          status_pedido: novoStatus,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Não foi possível atualizar o status.");
      }

      setOrders((prev) =>
        prev.map((ord) =>
          ord.id === pedidoId ? { ...ord, status_pedido: novoStatus } : ord
        )
      );
    } catch (err: any) {
      alert("Erro ao alterar status: " + err.message);
    } finally {
      setUpdatingOrderId(null);
    }
  };

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

          {isAdmin && (
            <div className="flex bg-muted p-1 rounded-xl border border-border">
              <button
                onClick={() => setActiveTab("produtos")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === "produtos"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Produtos
              </button>
              <button
                onClick={() => setActiveTab("pedidos")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === "pedidos"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5 text-primary" />
                Gerenciar Pedidos
              </button>
            </div>
          )}
        </header>

        <div className="p-6 max-w-7xl mx-auto">
          {activeTab === "produtos" ? (
            <>
              {isAdmin && (
                <div className="mb-6 flex justify-end">
                  <button
                    onClick={handleCreate}
                    className="gold-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 flex items-center gap-2 shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Novo Produto
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
                <div className="flex items-center justify-center py-12 border-2 border-dashed border-border rounded-xl">
                  <p className="text-muted-foreground">
                    Nenhum produto disponível na loja no momento.
                  </p>
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
                        className="bg-card border border-border rounded-xl overflow-hidden flex flex-col group card-glow transition-all hover:border-primary/40"
                      >
                        <div className="h-52 bg-white relative flex items-center justify-center overflow-hidden border-b border-border/50">
                          {isValidImageUrl(product.imagem_url) ? (
                            <Image
                              src={product.imagem_url!}
                              alt={product.nome || "Produto"}
                              fill
                              unoptimized
                              sizes="(max-width: 768px) 100vw, 350px"
                              className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <Package className="w-12 h-12 text-zinc-400" />
                          )}

                          {product.destaque && (
                            <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-md shadow-md z-10">
                              Destaque
                            </div>
                          )}

                          {estoque === 0 && (
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-10">
                              <span className="bg-destructive text-destructive-foreground font-bold px-4 py-2 rounded-lg transform -rotate-12 shadow-lg">
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

                          <div className="mt-auto pt-4 border-t border-border flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {estoque > 0 ? `${estoque} em estoque` : "Sem estoque"}
                            </span>
                            <button
                              disabled={estoque === 0}
                              onClick={() => handleBuy(product)}
                              className="gold-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
                                <Edit2 className="w-3 h-3" /> Editar
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="flex-1 bg-destructive/10 text-destructive px-2 py-1 rounded text-xs flex items-center justify-center gap-1 hover:bg-destructive/20 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" /> Excluir
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            /* Painel de Controle de Status dos Pedidos (Admin) */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold font-display flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-primary" />
                    Gerenciamento de Pedidos
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Acompanhe e altere o status dos pedidos efetuados pelos membros.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadOrders}
                  disabled={loadingOrders}
                  className="flex items-center gap-2 text-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? "animate-spin" : ""}`} />
                  Atualizar Lista
                </Button>
              </div>

              {loadingOrders ? (
                <div className="text-center py-12 text-muted-foreground">
                  Carregando pedidos do sistema...
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-xl text-muted-foreground">
                  Nenhum pedido registrado no momento.
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((pedido) => {
                    const dataFormatada = pedido.criado_em
                      ? new Date(pedido.criado_em).toLocaleDateString("pt-BR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—";

                    const totalFormatado = (Number(pedido.total) || 0).toLocaleString(
                      "pt-BR",
                      { style: "currency", currency: "BRL" }
                    );

                    const membroNome = pedido.membros?.nome || "Membro não identificado";
                    const membroEmail = pedido.membros?.email || "—";
                    const membroCurso = pedido.membros?.curso || "";

                    return (
                      <div
                        key={pedido.id}
                        className="p-5 rounded-2xl bg-card border border-border shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-xs font-bold bg-muted px-2.5 py-1 rounded-md text-foreground">
                              #{pedido.id.slice(0, 8)}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {dataFormatada}
                            </span>
                          </div>

                          <div>
                            <p className="font-semibold text-foreground text-base">
                              {membroNome}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {membroEmail} {membroCurso ? `· ${membroCurso}` : ""}
                            </p>
                          </div>

                          {pedido.itens_pedido && pedido.itens_pedido.length > 0 && (
                            <div className="text-xs text-muted-foreground pt-1">
                              <strong>Itens:</strong>{" "}
                              {pedido.itens_pedido.map((it: any) => (
                                <span key={it.id} className="mr-2">
                                  {it.quantidade}x {it.produtos?.nome || "Produto"}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-border">
                          <div className="text-left md:text-right">
                            <span className="text-xs text-muted-foreground block">
                              Total do Pedido
                            </span>
                            <span className="font-display font-bold text-lg text-primary">
                              {totalFormatado}
                            </span>
                          </div>

                          {/* Seletor do Status do Pedido */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-muted-foreground">
                              Status:
                            </span>
                            <select
                              value={pedido.status_pedido || "Processando..."}
                              disabled={updatingOrderId === pedido.id}
                              onChange={(e) =>
                                handleUpdateOrderStatus(pedido.id, e.target.value)
                              }
                              className="bg-background border border-border rounded-lg text-xs font-semibold px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary text-foreground cursor-pointer"
                            >
                              <option value="Processando...">⏳ Processando...</option>
                              <option value="Pago / Aguardando Retirada">
                                🟢 Pago / Aguardando Retirada
                              </option>
                              <option value="Entregue">✅ Entregue</option>
                              <option value="Cancelado">❌ Cancelado</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal de Criação / Edição de Produto (Admin) */}
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmit}
          initialData={selectedProduct || undefined}
        />

        {/* Modal de Confirmação de Pedido / Compra */}
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          product={productForCheckout}
          onSuccess={(novoEstoque) => {
            if (productForCheckout) {
              setProducts((prev) =>
                prev.map((p) =>
                  p.id === productForCheckout.id
                    ? { ...p, estoque: novoEstoque }
                    : p
                )
              );
            }
          }}
        />
      </main>
    </div>
  );
}

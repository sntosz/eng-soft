"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Package, CheckCircle2, Clock, LogIn, Shield, ArrowRight } from "lucide-react";
import logoAAES from "@/assets/logo-aaaes.png";
import { supabase } from "@/lib/supabase";
import { Order } from "@/types";
import { useCurrentUser } from "@/hooks/useCurrentUser";

const MemberIdCard = () => {
  const { user, isLoggedIn, loading: authLoading } = useCurrentUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUserOrders() {
      if (!user?.id) {
        setOrders([]);
        return;
      }

      try {
        setLoadingOrders(true);
        const { data, error } = await supabase
          .from("pedidos")
          .select(`
            id,
            membro_id,
            status_pedido,
            total,
            criado_em,
            itens_pedido (
              quantidade,
              preco_unitario,
              produtos (
                nome
              )
            )
          `)
          .eq("membro_id", user.id)
          .order("criado_em", { ascending: false })
          .limit(5);

        if (error) {
          console.error("Erro ao buscar pedidos do membro:", error.message || error);
          return;
        }

        if (mounted && data) {
          setOrders(data as unknown as Order[]);
        }
      } catch (err) {
        console.error("Falha ao carregar pedidos:", err);
      } finally {
        if (mounted) setLoadingOrders(false);
      }
    }

    if (isLoggedIn && user?.id) {
      loadUserOrders();
    } else {
      setOrders([]);
    }

    return () => {
      mounted = false;
    };
  }, [isLoggedIn, user?.id]);

  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden card-glow">
      <div className="gold-gradient px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src={logoAAES} alt="A.A.A.E.S." width={32} height={32} />
          <span className="font-display font-bold text-primary-foreground text-sm tracking-widest uppercase">
            Carteirinha Digital de Membro
          </span>
        </div>
        {isLoggedIn && user?.id && (
          <span className="text-[11px] font-mono font-semibold bg-black/20 text-primary-foreground px-2 py-0.5 rounded">
            #{user.id.slice(0, 8).toUpperCase()}
          </span>
        )}
      </div>

      <div className="p-6 space-y-5">
        {authLoading ? (
          <div className="space-y-3 animate-pulse">
            <div className="h-6 bg-muted rounded w-1/2" />

            <div className="h-4 bg-muted rounded w-1/3" />
            <div className="h-5 bg-muted rounded w-1/4" />
          </div>
        ) : isLoggedIn && user ? (
          <div>
            <h3 className="font-display text-2xl font-bold text-foreground">
              {user.nome}
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              {user.curso} {user.ano_curso ? `· Turma ${user.ano_curso}` : ""}
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/15 text-primary">
                {user.e_admin ? (
                  <>
                    <Shield className="w-3 h-3" /> Administrador
                  </>
                ) : (
                  "Membro Ativo"
                )}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                Temporada {currentYear}
              </span>
            </div>
          </div>
        ) : (
          <div>
            <h3 className="font-display text-2xl font-bold text-foreground">
              Carteirinha do Associado
            </h3>
            <p className="text-muted-foreground text-sm mt-1">
              Acesso exclusivo para membros da Atlética de Engenharia de Software
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-muted-foreground">
                Acesso Visitante
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                Temporada {currentYear}
              </span>
            </div>
          </div>
        )}

        {/* Seção de Pedidos ou CTA de Login */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">Pedidos Ativos</h4>
            </div>
            {isLoggedIn && (
              <Link
                href="/store"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Loja Oficial <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>

          {!isLoggedIn ? (
            <div className="p-4 rounded-lg bg-muted/40 border border-border text-center space-y-3">
              <p className="text-xs text-muted-foreground">
                Faça login para acessar sua carteirinha de associado e acompanhar seus pedidos da loja.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 gold-gradient text-primary-foreground text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                <LogIn className="w-3.5 h-3.5" />
                Entrar com Conta de Membro
              </Link>
            </div>
          ) : loadingOrders ? (
            <div className="space-y-2">
              <div className="h-11 bg-muted/50 rounded-lg animate-pulse" />
              <div className="h-11 bg-muted/50 rounded-lg animate-pulse" />
            </div>
          ) : orders.length === 0 ? (
            <div className="px-4 py-5 rounded-lg bg-muted/30 border border-dashed border-border text-center space-y-2">
              <p className="text-xs text-muted-foreground">
                Você não possui nenhum pedido em andamento no momento.
              </p>
              <Link
                href="/store"
                className="inline-block text-xs text-primary font-medium hover:underline"
              >
                Ver produtos na loja oficial →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {orders.map((order: Order) => {
                const orderProductName =
                  order.itens_pedido && order.itens_pedido.length > 0
                    ? order.itens_pedido
                        .map((it) => {
                          const prod = Array.isArray(it.produtos)
                            ? it.produtos[0]
                            : it.produtos;
                          return `${prod?.nome || "Item"}${
                            it.quantidade > 1 ? ` (x${it.quantidade})` : ""
                          }`;
                        })
                        .join(", ")
                    : order.nome || `Pedido #${order.id.slice(0, 6).toUpperCase()}`;

                const isReady =
                  order.pronto ||
                  order.status_pedido === "pronto" ||
                  order.status_pedido === "entregue" ||
                  order.status_pedido === "concluido";

                const statusText =
                  order.status ||
                  (order.status_pedido === "pronto"
                    ? "Pronto para Retirada"
                    : order.status_pedido === "entregue"
                    ? "Entregue"
                    : order.status_pedido === "cancelado"
                    ? "Cancelado"
                    : "Em Preparação");

                return (
                  <div
                    key={order.id}
                    className="flex items-center justify-between px-4 py-3 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="flex flex-col max-w-[65%]">
                      <span className="text-sm text-foreground font-medium truncate">
                        {orderProductName}
                      </span>
                      {order.total != null && (
                        <span className="text-[11px] text-muted-foreground">
                          {Number(order.total).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </span>
                      )}
                    </div>
                    <span
                      className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                        isReady
                          ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/20"
                          : "bg-secondary text-muted-foreground"
                      }`}
                    >
                      {isReady ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      {statusText}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberIdCard;

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Package, CheckCircle2, Clock, LogIn, Shield, ArrowRight, XCircle } from "lucide-react";
import logoAAES from "@/assets/logo-aaaes.png";
import { Order } from "@/types";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useI18n } from "@/contexts/I18nContext";
import { toast } from "@/components/ui/sonner";

const MemberIdCard = () => {
  const { user, isLoggedIn, loading: authLoading } = useCurrentUser();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [cancelingOrderId, setCancelingOrderId] = useState<string | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    let mounted = true;

    async function loadUserOrders() {
      if (!user?.id) {
        setOrders([]);
        return;
      }

      try {
        setLoadingOrders(true);
        const res = await fetch("/api/orders", { cache: "no-store" });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          console.error("Erro ao buscar pedidos do membro:", data.error);
          return;
        }

        if (mounted && data.pedidos) {
          setOrders((data.pedidos as Order[]).slice(0, 5));
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

  const handleCancelOrder = (pedidoId: string) => {
    toast(t("store.cancelConfirm"), {
      action: {
        label: t("common.confirm"),
        onClick: async () => {
          try {
            setCancelingOrderId(pedidoId);
            const res = await fetch("/api/orders", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ pedido_id: pedidoId }),
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || t("store.errorCancel"));

            setOrders((prev) =>
              prev.map((ord) =>
                ord.id === pedidoId
                  ? { ...ord, status_pedido: "Cancelado" }
                  : ord
              )
            );
            toast.success(t("store.orderCanceled"));
          } catch (err: any) {
            toast.error(err.message || t("store.errorCancel"));
          } finally {
            setCancelingOrderId(null);
          }
        },
      },
    });
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden card-glow">
      <div className="gold-gradient px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src={logoAAES} alt="A.A.A.E.S." width={32} height={32} />
          <span className="font-display font-bold text-primary-foreground text-sm tracking-widest uppercase">
            {t("card.title")}
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
                    <Shield className="w-3 h-3" /> {t("role.admin")}
                  </>
                ) : (
                  t("card.memberActive")
                )}
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                {t("card.season", { year: currentYear })}
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
                {t("card.season", { year: currentYear })}
              </span>
            </div>
          </div>
        )}

        {/* Seção de Pedidos ou CTA de Login */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-primary" />
              <h4 className="text-sm font-semibold text-foreground">{t("card.orders")}</h4>
            </div>
            {isLoggedIn && (
              <div className="flex items-center gap-3">
                <Link
                  href="/orders"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  {t("card.viewAll")} <ArrowRight className="w-3 h-3" />
                </Link>
                <Link
                  href="/store"
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  {t("card.store")} <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {!isLoggedIn ? (
            <div className="p-4 rounded-lg bg-muted/40 border border-border text-center space-y-3">
              <p className="text-xs text-muted-foreground">
                {t("card.loginHint")}
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 gold-gradient text-primary-foreground text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                <LogIn className="w-3.5 h-3.5" />
                {t("card.loginCta")}
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
                {t("card.emptyOrders")}
              </p>
              <Link
                href="/store"
                className="inline-block text-xs text-primary font-medium hover:underline"
              >
                {t("card.viewStore")}
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
                  order.status_pedido === "Pago / Aguardando Retirada" ||
                  order.status_pedido === "Entregue";

                const isCanceled = order.status_pedido === "Cancelado";

                const statusText =
                  order.status_pedido === "Pago / Aguardando Retirada"
                    ? t("card.status.ready")
                    : order.status_pedido === "Entregue"
                    ? t("card.status.delivered")
                    : order.status_pedido === "Cancelado"
                    ? t("store.status.canceled")
                    : t("card.status.preparing");

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
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span
                        className={`flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${
                          isCanceled
                            ? "bg-destructive/15 text-destructive border border-destructive/20"
                            : isReady
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
                      {order.status_pedido === "Processando..." && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancelingOrderId === order.id}
                          className="flex items-center gap-1 text-[11px] font-medium text-destructive hover:underline disabled:opacity-50"
                        >
                          <XCircle className="w-3 h-3" />
                          {t("store.cancelOrder")}
                        </button>
                      )}
                    </div>
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

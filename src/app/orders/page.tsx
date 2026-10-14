"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DashboardSidebar from "@/components/DashboardSidebar";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { useOrders } from "@/hooks/useOrders";
import { useI18n } from "@/contexts/I18nContext";
import {
  ClipboardList,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MessageKey } from "@/i18n/messages";

type StatusFilter =
  | "all"
  | "Processando..."
  | "Pago / Aguardando Retirada"
  | "Entregue"
  | "Cancelado";

const PAGE_SIZE = 3;

const STATUS_FILTERS: { value: StatusFilter; labelKey: MessageKey }[] = [
  { value: "all", labelKey: "store.filterAll" },
  { value: "Processando...", labelKey: "store.filterProcessing" },
  { value: "Pago / Aguardando Retirada", labelKey: "store.filterPaid" },
  { value: "Entregue", labelKey: "store.filterDelivered" },
  { value: "Cancelado", labelKey: "store.filterCanceled" },
];

export default function OrdersPage() {
  const { t } = useI18n();
  const { user, isLoggedIn, loading: authLoading } = useCurrentUser();

  const {
    orders,
    totalOrders,
    loading,
    loadOrders,
    cancelingOrderId,
    confirmCancelOrder,
  } = useOrders(PAGE_SIZE);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  useEffect(() => {
    if (isLoggedIn && user?.id) {
      loadOrders();
    }
  }, [isLoggedIn, user?.id]);

  const filteredOrders = useMemo(
    () =>
      statusFilter === "all"
        ? orders
        : orders.filter((o) => o.status_pedido === statusFilter),
    [orders, statusFilter]
  );

  const statusLabel = (status?: string) =>
    status === "Pago / Aguardando Retirada"
      ? t("card.status.ready")
      : status === "Entregue"
      ? t("card.status.delivered")
      : status === "Cancelado"
      ? t("store.status.canceled")
      : t("store.status.processing");

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 surface-glass border-b border-border px-6 py-4">
          <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-primary" />
            {t("store.myOrdersPanel")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {t("store.myOrdersSubtitle")}
          </p>
        </header>

        <div className="p-6 max-w-5xl mx-auto space-y-6">
          {!authLoading && !isLoggedIn ? (
            <div className="p-8 rounded-xl bg-muted/40 border border-border text-center space-y-4">
              <p className="text-sm text-muted-foreground">
                {t("store.loginToSeeOrders")}
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 gold-gradient text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
              >
                <LogIn className="w-4 h-4" />
                {t("common.login")}
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  {STATUS_FILTERS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setStatusFilter(f.value)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        statusFilter === f.value
                          ? "bg-primary/15 text-primary border-primary/30"
                          : "bg-muted text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {t(f.labelKey)}
                    </button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadOrders()}
                  disabled={loading}
                  className="flex items-center gap-2 text-xs"
                >
                  <RefreshCw
                    className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
                  />
                  {t("store.refresh")}
                </Button>
              </div>

              {authLoading || loading ? (
                <div className="text-center py-12 text-muted-foreground">
                  {t("store.loadingOrders")}
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border rounded-xl text-muted-foreground">
                  {orders.length === 0
                    ? t("store.noOrdersYet")
                    : t("store.emptyOrders")}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredOrders.map((pedido) => {
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

                    const isProcessing = pedido.status_pedido === "Processando...";
                    const isCanceled = pedido.status_pedido === "Cancelado";
                    const isReady =
                      pedido.status_pedido === "Pago / Aguardando Retirada" ||
                      pedido.status_pedido === "Entregue";

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

                          {pedido.itens_pedido && pedido.itens_pedido.length > 0 && (
                            <div className="text-sm text-foreground pt-1">
                              {pedido.itens_pedido.map((it) => {
                                const prod = Array.isArray(it.produtos)
                                  ? it.produtos[0]
                                  : it.produtos;
                                return (
                                  <span key={it.id} className="mr-3">
                                    {it.quantidade}x {prod?.nome || "Produto"}
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col md:items-end gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-border">
                          <div className="flex items-center gap-3">
                            <span className="font-display font-bold text-lg text-primary">
                              {totalFormatado}
                            </span>
                            <span
                              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                                isCanceled
                                  ? "bg-destructive/15 text-destructive border border-destructive/20"
                                  : isReady
                                  ? "bg-emerald-500/15 text-emerald-500 border border-emerald-500/20"
                                  : "bg-secondary text-muted-foreground"
                              }`}
                            >
                              {isCanceled ? (
                                <XCircle className="w-3.5 h-3.5" />
                              ) : isReady ? (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              ) : (
                                <Clock className="w-3.5 h-3.5" />
                              )}
                              {statusLabel(pedido.status_pedido)}
                            </span>
                          </div>

                          {isProcessing && (
                            <button
                              onClick={() => confirmCancelOrder(pedido.id)}
                              disabled={cancelingOrderId === pedido.id}
                              className="self-start md:self-end bg-destructive/10 text-destructive px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-destructive/20 transition-colors disabled:opacity-50"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              {cancelingOrderId === pedido.id
                                ? t("common.processing")
                                : t("store.cancelOrder")}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {orders.length < totalOrders && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadOrders(orders.length)}
                    disabled={loading}
                    className="text-xs"
                  >
                    {t("store.loadMore")}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

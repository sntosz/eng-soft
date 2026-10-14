"use client";

import { useCallback, useState } from "react";
import { Order } from "@/types";
import { useI18n } from "@/contexts/I18nContext";
import { toast } from "@/components/ui/sonner";

export function useOrders(pageSize = 20) {
  const { t } = useI18n();
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(false);
  const [cancelingOrderId, setCancelingOrderId] = useState<string | null>(null);

  const loadOrders = useCallback(
    async (offset = 0) => {
      try {
        setLoading(true);
        const res = await fetch(
          `/api/orders?limit=${pageSize}&offset=${offset}`,
          { cache: "no-store" }
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || t("store.errorLoadOrders"));

        setOrders((prev) =>
          offset === 0 ? data.pedidos || [] : [...prev, ...(data.pedidos || [])]
        );
        setTotalOrders(data.total ?? 0);
      } catch (err: any) {
        console.error("Erro ao carregar pedidos:", err);
        toast.error(err.message || t("store.errorLoadOrders"));
      } finally {
        setLoading(false);
      }
    },
    [pageSize, t]
  );

  const cancelOrder = useCallback(
    async (pedidoId: string) => {
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
            ord.id === pedidoId ? { ...ord, status_pedido: "Cancelado" } : ord
          )
        );
        toast.success(t("store.orderCanceled"));
      } catch (err: any) {
        toast.error(err.message || t("store.errorCancel"));
      } finally {
        setCancelingOrderId(null);
      }
    },
    [t]
  );

  const confirmCancelOrder = useCallback(
    (pedidoId: string) => {
      toast(t("store.cancelConfirm"), {
        action: {
          label: t("common.confirm"),
          onClick: () => cancelOrder(pedidoId),
        },
      });
    },
    [cancelOrder, t]
  );

  return {
    orders,
    setOrders,
    totalOrders,
    loading,
    loadOrders,
    cancelingOrderId,
    confirmCancelOrder,
  };
}

import type { MessageKey } from "@/i18n/messages";

// Fonte única dos status de pedido (valores gravados no banco).
// As migrations SQL usam esses mesmos literais — mantenha-os em sincronia.
export const ORDER_STATUS_VALUES = [
  "Processando...",
  "Pago / Aguardando Retirada",
  "Entregue",
  "Cancelado",
] as const;

export type OrderStatus = (typeof ORDER_STATUS_VALUES)[number];

export const ORDER_STATUS = {
  PROCESSING: "Processando...",
  PAID: "Pago / Aguardando Retirada",
  DELIVERED: "Entregue",
  CANCELED: "Cancelado",
} as const satisfies Record<string, OrderStatus>;

export type OrderStatusFilter = "all" | OrderStatus;

export const ORDER_STATUS_FILTERS: {
  value: OrderStatusFilter;
  labelKey: MessageKey;
}[] = [
  { value: "all", labelKey: "store.filterAll" },
  { value: ORDER_STATUS.PROCESSING, labelKey: "store.filterProcessing" },
  { value: ORDER_STATUS.PAID, labelKey: "store.filterPaid" },
  { value: ORDER_STATUS.DELIVERED, labelKey: "store.filterDelivered" },
  { value: ORDER_STATUS.CANCELED, labelKey: "store.filterCanceled" },
];

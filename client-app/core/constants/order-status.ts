// sync with platform order statuses and settings.data.json -> orders_statuses
export const OrderStatusCode = {
  CANCELLED: "Cancelled",
  NEW: "New",
  PROCESSING: "Processing",
  PENDING: "Pending",
  COMPLETED: "Completed",
  PAYMENT_REQUIRED: "Payment required",
  READY_FOR_PICKUP: "Ready for pickup",
} as const;

export type OrderStatusCodeType = (typeof OrderStatusCode)[keyof typeof OrderStatusCode];

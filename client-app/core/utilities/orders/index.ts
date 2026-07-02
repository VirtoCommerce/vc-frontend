import type { CustomerOrderType, MoneyType, OrderTotalType } from "@/core/api/graphql/types";

// Totals to show in the Total column/cell: the primary-currency total first, then the rest.
// Falls back to the order's single total when per-currency totals are unavailable.
export function getDisplayTotals(order: CustomerOrderType): MoneyType[] {
  const totals = order.orderTotals?.filter((total): total is OrderTotalType => !!total) ?? [];

  if (!totals.length) {
    return order.total ? [order.total] : [];
  }

  totals.sort((a, b) => Number(b.isDefaultTotalCurrency) - Number(a.isDefaultTotalCurrency));

  return totals.map((total) => total.total);
}

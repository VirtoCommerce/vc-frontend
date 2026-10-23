import { globals } from "@/core/globals";
import type { Composer } from "vue-i18n";

type TranslateType = Composer["t"];

export function formatMoney(amount: number | null | undefined, currency: string | null | undefined): string {
  const value = amount ?? 0;
  try {
    return new Intl.NumberFormat(globals.cultureName || undefined, {
      style: "currency",
      currency: currency || "USD",
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency ?? ""}`.trim();
  }
}

export function intervalLabel(
  t: TranslateType,
  unit: string | null | undefined,
  count: number | null | undefined,
): string {
  const normalizedUnit = (unit || "Month").toLowerCase();
  const normalizedCount = count && count > 0 ? count : 1;
  return t(`product_subscriptions.intervals.${normalizedUnit}`, { count: normalizedCount }, normalizedCount);
}

export function discountLabel(
  t: TranslateType,
  discountType: string | null | undefined,
  discountValue: number | null | undefined,
  currency?: string | null,
): string | undefined {
  if (!discountValue || discountType === "None") {
    return undefined;
  }

  return discountType === "Percent"
    ? t("product_subscriptions.discount.percent", { value: discountValue })
    : t("product_subscriptions.discount.amount", { value: formatMoney(discountValue, currency) });
}

export function applyDiscount(
  price: number,
  discountType: string | null | undefined,
  discountValue: number | null | undefined,
): number {
  if (!discountValue || discountType === "None") {
    return price;
  }

  if (discountType === "Percent") {
    const discount = Math.round(price * Math.min(Math.max(discountValue, 0), 100)) / 100;
    return Math.max(0, Math.round((price - discount) * 100) / 100);
  }

  return Math.max(0, price - Math.min(price, discountValue));
}

export function intervalKey(unit: string, count: number): string {
  return `${unit}:${count}`;
}

export function parseIntervalKey(key: string): { unit: string; count: number } {
  const [unit, count] = key.split(":");
  return { unit, count: Number(count) || 1 };
}

const STATUS_COLORS: Record<string, VcMainColorType> = {
  Active: "success",
  PendingActivation: "info",
  Paused: "neutral",
  PastDue: "danger",
  Cancelled: "neutral",
  Scheduled: "info",
  Notified: "info",
  ReviewRequired: "warning",
  Ordered: "info",
  PaymentActionRequired: "warning",
  RetryScheduled: "warning",
  Authorized: "success",
  Completed: "success",
  Failed: "danger",
  Skipped: "neutral",
};

export function statusColor(status: string | null | undefined): VcMainColorType {
  return (status && STATUS_COLORS[status]) || "neutral";
}

export function toDateInputValue(date: string | Date | null | undefined): string | undefined {
  if (!date) {
    return undefined;
  }

  const value = new Date(date);
  if (Number.isNaN(value.getTime())) {
    return undefined;
  }

  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${value.getFullYear()}-${month}-${day}`;
}

export function cardLabel(brand?: string | null, last4?: string | null): string {
  return `${brand || "Card"} •••• ${last4 ?? "????"}`;
}

export function errorMessage(error: unknown, fallback: string): string {
  const graphQLErrors = (error as { graphQLErrors?: { message?: string }[] })?.graphQLErrors;
  if (graphQLErrors?.length && graphQLErrors[0]?.message) {
    return graphQLErrors[0].message;
  }

  return fallback;
}

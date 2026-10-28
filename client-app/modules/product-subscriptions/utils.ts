import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { SubscriptionDiscountType, SubscriptionIntervalUnit } from "./api/graphql/types";
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
  // Translation keys are the lower-case unit: "MONTH" -> intervals.month.
  const normalizedUnit = (unit || SubscriptionIntervalUnit.Month).toLowerCase();
  const normalizedCount = count && count > 0 ? count : 1;
  return t(`product_subscriptions.intervals.${normalizedUnit}`, { count: normalizedCount }, normalizedCount);
}

export function discountLabel(
  t: TranslateType,
  discountType: SubscriptionDiscountType | null | undefined,
  discountValue: number | null | undefined,
  currency?: string | null,
): string | undefined {
  if (!discountValue || discountType === SubscriptionDiscountType.None) {
    return undefined;
  }

  return discountType === SubscriptionDiscountType.Percent
    ? t("product_subscriptions.discount.percent", { value: discountValue })
    : t("product_subscriptions.discount.amount", { value: formatMoney(discountValue, currency) });
}

export function applyDiscount(
  price: number,
  discountType: SubscriptionDiscountType | null | undefined,
  discountValue: number | null | undefined,
): number {
  if (!discountValue || discountType === SubscriptionDiscountType.None) {
    return price;
  }

  if (discountType === SubscriptionDiscountType.Percent) {
    const discount = Math.round(price * Math.min(Math.max(discountValue, 0), 100)) / 100;
    return Math.max(0, Math.round((price - discount) * 100) / 100);
  }

  return Math.max(0, price - Math.min(price, discountValue));
}

export function intervalKey(unit: SubscriptionIntervalUnit, count: number): string {
  return `${unit}:${count}`;
}

export function parseIntervalKey(key: string): { unit: SubscriptionIntervalUnit; count: number } {
  const [unit, count] = key.split(":");
  return { unit: unit as SubscriptionIntervalUnit, count: Number(count) || 1 };
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

/** The date's UTC day as a date input value ("YYYY-MM-DD"): the server counts delivery days in UTC. */
export function toDateInputValue(date: string | Date | null | undefined): string | undefined {
  if (!date) {
    return undefined;
  }

  const value = new Date(date);
  if (Number.isNaN(value.getTime())) {
    return undefined;
  }

  const month = String(value.getUTCMonth() + 1).padStart(2, "0");
  const day = String(value.getUTCDate()).padStart(2, "0");
  return `${value.getUTCFullYear()}-${month}-${day}`;
}

export function cardLabel(brand?: string | null, last4?: string | null): string {
  return `${brand || "Card"} •••• ${last4 ?? "????"}`;
}

/**
 * What a shopper is told when a subscription action fails: a translated message. The server's own message is in English
 * and meant for logs, so it is logged here instead of shown.
 */
export function subscriptionErrorMessage(
  error: unknown,
  t: TranslateType,
  key = "product_subscriptions.errors.generic",
): string {
  Logger.warn("product-subscriptions", error);
  return t(key);
}

/**
 * Whether the shopper must be told that the cart's subscriptions need a payment method that can save a card: the cart
 * has subscription lines and the store offers no such method for it, so the payment list is empty.
 */
export function needsCardPaymentMethodNotice(
  hasSubscriptionItems: boolean,
  paymentMethods: unknown[] | null | undefined,
): boolean {
  return hasSubscriptionItems && !paymentMethods?.length;
}

/**
 * Whether accepted terms no longer need the card saved, once the cart has no subscription lines left: the lines that
 * were subscribed are still in the cart, so the shopper turned them one-time or left them out of checkout. Lines that
 * left the cart were ordered, and the order's payment still needs the card saved with the consent.
 */
export function shouldWithdrawCardSaving(
  previousLineIds: string[],
  cartItems: { id: string }[] | null | undefined,
): boolean {
  const lineIds = new Set((cartItems ?? []).map((item) => item.id));
  return previousLineIds.some((id) => lineIds.has(id));
}

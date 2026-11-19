import { Logger } from "@/core/utilities";
import { SubscriptionDiscountType, SubscriptionIntervalUnit } from "./api/graphql/types";
import type { Composer } from "vue-i18n";

/** The server's error code for an action the store has turned off in its "Customer actions" settings. */
const ACTION_DISABLED_ERROR_CODE = "SUBSCRIPTION_ACTION_DISABLED";

type TranslateType = Composer["t"];

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

/** The frequency without "Every", for a picker labelled "Get it every": "1 month", "2 weeks". */
export function intervalShortLabel(
  t: TranslateType,
  unit: string | null | undefined,
  count: number | null | undefined,
): string {
  const normalizedUnit = (unit || SubscriptionIntervalUnit.Month).toLowerCase();
  const normalizedCount = count && count > 0 ? count : 1;
  return t(`product_subscriptions.intervals_short.${normalizedUnit}`, { count: normalizedCount }, normalizedCount);
}

/** `from` moved forward by one delivery interval: an estimate, the real date is set when the order is placed. */
export function addInterval(from: Date, unit: SubscriptionIntervalUnit, count: number): Date {
  const result = new Date(from);
  switch (unit) {
    case SubscriptionIntervalUnit.Day:
      result.setDate(result.getDate() + count);
      break;
    case SubscriptionIntervalUnit.Week:
      result.setDate(result.getDate() + 7 * count);
      break;
    case SubscriptionIntervalUnit.Year:
      result.setFullYear(result.getFullYear() + count);
      break;
    default:
      result.setMonth(result.getMonth() + count);
  }
  return result;
}

/**
 * "Save 10%" or "Save $5.00". A fixed-amount discount is shown with the amount the server formatted in the record's
 * currency (`formattedAmount`); without it there is nothing correct to show, so no label.
 */
export function discountLabel(
  t: TranslateType,
  discountType: SubscriptionDiscountType | null | undefined,
  discountValue: number | null | undefined,
  formattedAmount?: string | null,
): string | undefined {
  if (!discountValue || discountType === SubscriptionDiscountType.None) {
    return undefined;
  }

  if (discountType === SubscriptionDiscountType.Percent) {
    return t("product_subscriptions.discount.percent", { value: discountValue });
  }

  return formattedAmount ? t("product_subscriptions.discount.amount", { value: formattedAmount }) : undefined;
}

/** The element id of a subscription on Account › Subscriptions; a link from an order scrolls to it. */
export function subscriptionAnchorId(subscriptionId: string): string {
  return `subscription-${subscriptionId}`;
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

type PageType<T> = { totalCount?: number | null; items?: T[] | null } | null | undefined;

/** Every item of a paged list: asks for the next page with `after` until `totalCount` items are read. */
export async function fetchAllPages<T>(
  fetchPage: (page: { first: number; after: string }) => Promise<PageType<T>>,
  pageSize: number,
): Promise<T[]> {
  const items: T[] = [];
  let totalCount = 0;

  do {
    // Each page starts where the previous one ended, so the requests can't run in parallel.
    const page = await fetchPage({ first: pageSize, after: String(items.length) });
    const pageItems = page?.items ?? [];
    if (!pageItems.length) {
      break;
    }

    items.push(...pageItems);
    totalCount = page?.totalCount ?? 0;
  } while (items.length < totalCount);

  return items;
}

/**
 * What a shopper is told when a subscription action fails: a translated message. The error's own message is in English
 * and meant for logs, so it is logged here instead of shown. (A renewal's own problem comes as a code and is translated
 * by `useRenewalReasons`.)
 */
export function subscriptionErrorMessage(
  error: unknown,
  t: TranslateType,
  key = "product_subscriptions.errors.generic",
): string {
  Logger.warn("product-subscriptions", error);
  // The store turned this action off for customers after the page was loaded: say so instead of "try again".
  const { graphQLErrors = [] } = (error ?? {}) as { graphQLErrors?: { extensions?: { code?: unknown } }[] };
  if (graphQLErrors.some((x) => x.extensions?.code === ACTION_DISABLED_ERROR_CODE)) {
    return t("product_subscriptions.errors.action_disabled");
  }
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
 * Price of one item with the subscription discount, as the server computes it: a percent off, or a fixed amount off
 * (never below zero), rounded to cents. Used for a configured product, whose price comes from the chosen options.
 */
export function subscriptionUnitPrice(
  price: number,
  discountType: SubscriptionDiscountType | null | undefined,
  discountValue: number | null | undefined,
): number {
  const result = discountedPrice(price, discountType, discountValue ?? 0);
  return Math.round(Math.max(0, result) * 100) / 100;
}

function discountedPrice(
  price: number,
  discountType: SubscriptionDiscountType | null | undefined,
  value: number,
): number {
  if (discountType === SubscriptionDiscountType.Percent) {
    return price * (1 - value / 100);
  }

  if (discountType === SubscriptionDiscountType.FixedAmount) {
    return price - value;
  }

  return price;
}

/** One choice of a configuration, from the subscription's stored copy or from a cart line. */
export type ConfigurationChoiceType = Partial<{
  name: string | null;
  productName: string | null;
  quantity: number | null;
  customText: string | null;
  files: Array<Partial<{ name: string | null }> | null> | null;
}>;

/** The value of one choice: "Fanta Mango × 6", “Thank you!” or the file names. */
export function configurationChoiceText(choice: ConfigurationChoiceType): string {
  if (choice.productName) {
    return choice.quantity && choice.quantity > 1 ? `${choice.productName} × ${choice.quantity}` : choice.productName;
  }

  if (choice.customText) {
    return `“${choice.customText}”`;
  }

  return (choice.files ?? [])
    .map((file) => file?.name)
    .filter(Boolean)
    .join(", ");
}

/** A configuration in one short line: "Fanta Mango × 6 · “Thank you!” · logo.png". */
export function configurationSummary(choices: ConfigurationChoiceType[] | null | undefined): string {
  return (choices ?? []).map(configurationChoiceText).filter(Boolean).join(" · ");
}

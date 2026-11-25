import { Logger } from "@/core/utilities";
import { SubscriptionIntervalUnit } from "./api/graphql/types";
import type { Composer } from "vue-i18n";

/** The server's error code for an action the store has turned off in its "Customer actions" settings. */
const ACTION_DISABLED_ERROR_CODE = "SUBSCRIPTION_ACTION_DISABLED";
// A subscription action the server refused; the reasons a shopper can be told come with a code.
const SUBSCRIPTION_ERROR_CODE = "SUBSCRIPTION_ERROR";
const KNOWN_REASONS = new Set(["PRODUCT_IN_CART_MORE_THAN_ONCE", "NO_OWN_PRICE"]);

type SubscriptionGraphQLErrorType = {
  extensions?: { code?: unknown; reason?: unknown; data?: { reason?: unknown } };
};

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

/**
 * `from` moved forward by one delivery interval, in UTC as the server counts, with the day clamped to the month's length
 * (Jan 31 → Feb 28): an estimate, the real date is set when the order is placed.
 */
export function addInterval(from: Date, unit: SubscriptionIntervalUnit, count: number): Date {
  const result = new Date(from);
  switch (unit) {
    case SubscriptionIntervalUnit.Day:
      result.setUTCDate(result.getUTCDate() + count);
      return result;
    case SubscriptionIntervalUnit.Week:
      result.setUTCDate(result.getUTCDate() + 7 * count);
      return result;
    case SubscriptionIntervalUnit.Year:
      return addMonths(result, 12 * count);
    default:
      return addMonths(result, count);
  }
}

function addMonths(from: Date, count: number): Date {
  const result = new Date(from);
  const day = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + count);
  const daysInMonth = new Date(Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)).getUTCDate();
  result.setUTCDate(Math.min(day, daysInMonth));
  return result;
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
  const { graphQLErrors = [] } = (error ?? {}) as { graphQLErrors?: SubscriptionGraphQLErrorType[] };
  // The store turned this action off for customers after the page was loaded: say so instead of "try again".
  if (graphQLErrors.some((x) => x.extensions?.code === ACTION_DISABLED_ERROR_CODE)) {
    return t("product_subscriptions.errors.action_disabled");
  }

  const refusal = graphQLErrors.find((x) => x.extensions?.code === SUBSCRIPTION_ERROR_CODE);
  const reason = refusal?.extensions?.data?.reason ?? refusal?.extensions?.reason;
  if (typeof reason === "string" && KNOWN_REASONS.has(reason)) {
    return t(`product_subscriptions.errors.reasons.${reason}`);
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

/** One choice of a configuration, from the subscription's stored copy or from a cart line. */
export type ConfigurationChoiceType = Partial<{
  name: string | null;
  productName: string | null;
  quantity: number | null;
  customText: string | null;
  files: Array<Partial<{ name: string | null }> | null> | null;
}>;

/** The value of one choice: "Fanta Mango × 6", “Thank you!” or the file names. */
function configurationChoiceText(t: TranslateType, choice: ConfigurationChoiceType): string {
  if (choice.productName) {
    return choice.quantity && choice.quantity > 1
      ? t("product_subscriptions.configuration.product_quantity", {
          name: choice.productName,
          quantity: choice.quantity,
        })
      : choice.productName;
  }

  if (choice.customText) {
    return t("product_subscriptions.configuration.custom_text", { text: choice.customText });
  }

  return (choice.files ?? [])
    .map((file) => file?.name)
    .filter(Boolean)
    .join(t("product_subscriptions.configuration.files_separator"));
}

/** A configuration in one short line: "Fanta Mango × 6 · “Thank you!” · logo.png". */
export function configurationSummary(t: TranslateType, choices: ConfigurationChoiceType[] | null | undefined): string {
  return (choices ?? [])
    .map((choice) => configurationChoiceText(t, choice))
    .filter(Boolean)
    .join(t("product_subscriptions.configuration.separator"));
}

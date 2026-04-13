import { Logger, toCSV } from "@/core/utilities";
import { canUseDOM, DEBUG_PREFIX } from "./constants";
import type { ConfiguredPriceType } from "./types";
import type {
  Breadcrumb,
  LineItemType,
  OrderLineItemType,
  Product,
  VariationType,
  DiscountType,
  OrderDiscountType,
} from "@/core/api/graphql/types";
import type { CamelToSnake } from "@/core/types/utility";
import type { AnalyticsEventNameType } from "client-app/core/types/analytics";

type CustomEventNamesType = Exclude<CamelToSnake<AnalyticsEventNameType>, Gtag.EventNames>;
type EventParamsType = Gtag.ControlParams & Gtag.EventParams & Gtag.CustomParams;

export function sendEvent(eventName: Gtag.EventNames | CustomEventNamesType, eventParams?: EventParamsType): void {
  if (canUseDOM && window.gtag) {
    window.gtag("event", eventName, eventParams);
  } else {
    Logger.debug(DEBUG_PREFIX, eventName, eventParams);
  }
}

export function productToGtagItem(
  item: Product | VariationType,
  index?: number,
  priceOverride?: ConfiguredPriceType,
): Gtag.Item {
  const categories: Record<string, string> =
    item && typeof item === "object" && "breadcrumbs" in item ? getCategories(item.breadcrumbs) : {};

  const listPrice = priceOverride?.list ?? item.price?.list?.amount;
  const discount = priceOverride
    ? Math.max(priceOverride.list - priceOverride.actual, 0) || undefined
    : item.price?.discountAmount?.amount;

  return {
    index,
    item_id: item.code,
    item_name: item.name,
    affiliation: item.vendor?.name,
    price: listPrice,
    discount,
    quantity: item.availabilityData?.availableQuantity,
    ...categories,
  };
}

export function lineItemToGtagItem(
  item: LineItemType | OrderLineItemType,
  index?: number,
): Gtag.Item & { promotions: string | undefined } {
  const categories: Record<string, string> = getCategories(item.product?.breadcrumbs);

  return {
    index,
    item_id: item.sku,
    item_name: item.name,
    affiliation: item.vendor?.name,
    currency: item.placedPrice?.currency?.code,
    discount: item.discountAmount?.amount || item.discountTotal?.amount,
    price: item && typeof item === "object" && "price" in item ? item.price?.amount : item.listPrice?.amount,
    quantity: item.quantity,
    promotion_id: item.discounts?.[0]?.promotionId,
    promotion_name:
      item.discounts?.[0] && typeof item.discounts[0] === "object" && "promotionName" in item.discounts[0]
        ? item.discounts?.[0]?.promotionName
        : undefined,
    promotions: !item.discounts?.length
      ? undefined
      : toCSV(
          item.discounts
            ?.map((promotion: DiscountType | OrderDiscountType) =>
              "promotionName" in promotion ? promotion.promotionName : undefined,
            )
            ?.filter(Boolean) as string[],
        ),
    ...categories,
  };
}

function getCategories(breadcrumbs: Breadcrumb[] = []): Record<string, string> {
  const categories: Record<string, string> = {};

  breadcrumbs
    .filter((breadcrumb) => breadcrumb.typeName !== "CatalogProduct")
    .slice(0, 5) // first five, according to the documentation
    .forEach((breadcrumb, i) => {
      const number = i + 1;
      categories[`item_category${number > 1 ? number : ""}`] = breadcrumb.title;
    });

  return categories;
}

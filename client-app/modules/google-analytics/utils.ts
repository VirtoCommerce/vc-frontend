import { Logger } from "@/core/utilities";
import { canUseDOM, DEBUG_PREFIX } from "./constants";
import type { CustomEventNamesType, EventParamsType } from "./types";
import type {
  Breadcrumb,
  LineItemType,
  OrderLineItemType,
  Product,
  VariationType,
  DiscountType,
  OrderDiscountType,
} from "@/core/api/graphql/types";

export function productToGtagItem(item: Product | VariationType, index?: number): Gtag.Item {
  const categories: Record<string, string> = "breadcrumbs" in item ? getCategories(item.breadcrumbs) : {};

  return {
    index,
    item_id: item.code,
    item_name: item.name,
    affiliation: item.vendor?.name,
    price: item.price?.list?.amount,
    discount: item.price?.discountAmount?.amount,
    quantity: item.availabilityData?.availableQuantity,
    ...categories,
  };
}

export function lineItemToGtagItem(
  item: LineItemType | OrderLineItemType,
  index?: number,
): Gtag.Item & { promotions: string } {
  const categories: Record<string, string> = getCategories(item.product?.breadcrumbs);

  return {
    index,
    item_id: item.sku,
    item_name: item.name,
    affiliation: item.vendor?.name || "?",
    currency: item.placedPrice.currency.code,
    discount: item.discountAmount?.amount || item.discountTotal?.amount,
    price: "price" in item ? item.price.amount : item.listPrice.amount,
    quantity: item.quantity,
    promotion_id: item.discounts?.[0]?.promotionId,
    promotion_name:
      item.discounts && "promotionName" in item.discounts[0] ? item.discounts?.[0]?.promotionName : undefined,
    promotions: item.discounts
      ?.map((promotion: DiscountType | OrderDiscountType) =>
        "promotionName" in promotion ? promotion.promotionName : undefined,
      )
      .filter(Boolean)
      .join(", ")
      .trim(),
    ...categories,
  };
}

export function getCategories(breadcrumbs: Breadcrumb[] = []): Record<string, string> {
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

export function sendEvent(eventName: Gtag.EventNames | CustomEventNamesType, eventParams?: EventParamsType): void {
  if (canUseDOM && window.gtag) {
    window.gtag("event", eventName, eventParams);
  } else {
    Logger.debug(DEBUG_PREFIX, eventName, eventParams);
  }
}

import { useThemeContext } from "@/core/composables/useThemeContext";
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

export type ProductToGtagItemContextType = {
  itemListId?: string;
  itemListName?: string;
  currency?: string;
};

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
  priceOverrideOrContext?: ConfiguredPriceType | ProductToGtagItemContextType,
  context?: ProductToGtagItemContextType,
): Gtag.Item {
  // 3rd arg used to be ConfiguredPriceType — preserved for external extendEvents consumers.
  const isPriceOverride =
    !!priceOverrideOrContext &&
    typeof priceOverrideOrContext === "object" &&
    ("list" in priceOverrideOrContext || "actual" in priceOverrideOrContext);
  let priceOverride: ConfiguredPriceType | undefined;
  let ctx: ProductToGtagItemContextType | undefined;
  if (isPriceOverride) {
    priceOverride = priceOverrideOrContext;
    ctx = context;
  } else {
    ctx = priceOverrideOrContext;
  }

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
    item_brand: getProductBrand(item),
    affiliation: item.vendor?.name ?? getStoreNameAffiliation(),
    currency: ctx?.currency,
    item_list_id: ctx?.itemListId,
    item_list_name: ctx?.itemListName,
    price: listPrice,
    discount,
    ...categories,
  };
}

// useThemeContext() throws if accessed before theme state init — guarded.
function getStoreNameAffiliation(): string | undefined {
  try {
    const { themeContext } = useThemeContext();
    return themeContext.value.storeName || undefined;
  } catch {
    return undefined;
  }
}

function getProductBrand(item: Product | VariationType): string | undefined {
  if ("brand" in item && item.brand?.name) {
    return item.brand.name;
  }
  if ("brandName" in item && item.brandName) {
    return item.brandName;
  }

  const brandProperty = item.properties?.find((property) => property.name?.toLowerCase() === "brand");
  if (brandProperty?.value !== undefined && brandProperty.value !== null) {
    return String(brandProperty.value);
  }

  return undefined;
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

function getCategories(breadcrumbs: Breadcrumb[] | null | undefined): Record<string, string> {
  const categories: Record<string, string> = {};

  (breadcrumbs ?? [])
    .filter((breadcrumb) => breadcrumb.typeName !== "CatalogProduct")
    .slice(0, 5) // first five, according to the documentation
    .forEach((breadcrumb, i) => {
      const number = i + 1;
      categories[`item_category${number > 1 ? number : ""}`] = breadcrumb.title;
    });

  return categories;
}

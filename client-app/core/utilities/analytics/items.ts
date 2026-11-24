import { useThemeContext } from "@/core/composables/useThemeContext";
import { toCSV } from "@/core/utilities/common";
import type {
  Breadcrumb,
  DiscountType,
  LineItemType,
  OrderDiscountType,
  OrderLineItemType,
  Product,
  VariationType,
} from "@/core/api/graphql/types";

/**
 * The GA4 item shape, shared by every tracker so reports in different tools agree on one vocabulary.
 */
export type AnalyticsItemType = {
  index?: number;
  item_id?: string;
  item_name?: string;
  item_brand?: string;
  affiliation?: string;
  currency?: string;
  item_list_id?: string;
  item_list_name?: string;
  price?: number;
  discount?: number;
  quantity?: number;
  promotion_id?: string;
  promotion_name?: string;
  item_category?: string;
  item_category2?: string;
  item_category3?: string;
  item_category4?: string;
  item_category5?: string;
};

export type ConfiguredPriceType = { list: number; actual: number };

export type ProductToItemContextType = {
  itemListId?: string;
  itemListName?: string;
  currency?: string;
};

export function productToAnalyticsItem(
  item: Product | VariationType,
  index?: number,
  priceOverrideOrContext?: ConfiguredPriceType | ProductToItemContextType,
  context?: ProductToItemContextType,
): AnalyticsItemType {
  // 3rd arg used to be ConfiguredPriceType — preserved for external extendEvents consumers.
  const isPriceOverride =
    !!priceOverrideOrContext &&
    typeof priceOverrideOrContext === "object" &&
    ("list" in priceOverrideOrContext || "actual" in priceOverrideOrContext);
  let priceOverride: ConfiguredPriceType | undefined;
  let ctx: ProductToItemContextType | undefined;
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

export function lineItemToAnalyticsItem(
  item: LineItemType | OrderLineItemType,
  index?: number,
): AnalyticsItemType & { promotions: string | undefined } {
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
            ?.filter(Boolean),
        ),
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

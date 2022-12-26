import { getProductRoute } from "@/core";
import { QuoteItemType } from "@/xapi";

export function extendQuoteItem(item: QuoteItemType) {
  return {
    ...item,

    extended: {
      isProductExists: !!item.product,
      route: getProductRoute(item.product?.id ?? "", item.product?.slug),
      displayProperties: item.product?.properties?.slice(0, 3) || [],
    },
  };
}

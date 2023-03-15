import { getProductRoute } from "@/core/utilities";
import type { LineItemType } from "@/xapi/types";

export function extendWishListItem(item: LineItemType) {
  return {
    ...item,
    extended: {
      isProductExists: !!item.product,
      route: getProductRoute(item.product?.id ?? "", item.product?.slug),
      displayProperties: item.product?.properties?.slice(0, 3) || [],
    },
  };
}

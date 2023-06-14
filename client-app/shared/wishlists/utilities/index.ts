import { getProductRoute, getPropertiesGroupedByName } from "@/core/utilities";
import type { LineItemType } from "@/core/api/graphql/types";

/** @deprecated Use `prepareLineItem` function */
export function extendWishListItem(item: LineItemType, countInCart?: number) {
  return {
    ...item,
    extended: {
      isProductExists: !!item.product,
      route: getProductRoute(item.product?.id ?? "", item.product?.slug),
      displayProperties: Object.values(getPropertiesGroupedByName(item.product?.properties ?? [])).slice(0, 3),
      countInCart,
    },
  };
}

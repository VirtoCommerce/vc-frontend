import { getProductRoute } from "@/core";
import { Property, LineItemType } from "@/xapi";
import { RouteLocationRaw } from "vue-router";

export function prepareExtendedLineItems(
  items: LineItemType[]
): Record<string, { isProductExists: boolean; route: RouteLocationRaw; properties: Property[] }> {
  return items.reduce(
    (result, item: LineItemType) =>
      Object.assign(result, {
        [item.id]: {
          isProductExists: !!item.product,
          route: getProductRoute(item.product?.id ?? "", item.product?.slug),
          properties: item.product?.properties?.slice(0, 3),
        },
      }),
    {}
  );
}

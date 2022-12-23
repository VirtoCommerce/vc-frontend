import { getProductRoute } from "@/core";
import { LineItemType } from "@/xapi";

export function extendCartItem(item: LineItemType) {
  return {
    ...item,
    isProductExists: !!item.product,
    route: getProductRoute(item.product?.id ?? "", item.product?.slug),
    displayProperties: item.product?.properties?.slice(0, 3) || [],
    isInStock: item.inStockQuantity && item.inStockQuantity >= item.quantity!,
    minQuantity: item.product?.minQuantity || 1,
    maxQuantity: item.inStockQuantity || item.product?.maxQuantity || 999999,
  };
}

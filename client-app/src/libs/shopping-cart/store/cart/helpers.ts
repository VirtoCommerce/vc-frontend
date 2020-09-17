import { IProduct, IShoppingCart } from "@core/api/api-clients";

export function findProductInCartByLineItemId(cart: IShoppingCart, lineItemId: string): IProduct {
  return cart.items!.find(x=>x.id === lineItemId)?.product!;
}

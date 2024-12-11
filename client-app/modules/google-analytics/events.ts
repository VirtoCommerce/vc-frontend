import { sumBy } from "lodash";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { DEBUG_PREFIX } from "./constants";
import { lineItemToGtagItem, productToGtagItem } from "./utils";
import type { CustomEventNamesType, EventParamsType } from "./types";
import type { CartType, CustomerOrderType, LineItemType, Product, VariationType } from "@/core/api/graphql/types";
import type { ViewItemListParamsAdditionalType } from "@/core/types/analytics";

const canUseDOM = !!(typeof window !== "undefined" && window.document?.createElement);
const { currencyCode } = globals;

function sendEvent(eventName: Gtag.EventNames | CustomEventNamesType, eventParams?: EventParamsType): void {
  if (canUseDOM && window.gtag) {
    window.gtag("event", eventName, eventParams);
  } else {
    Logger.debug(DEBUG_PREFIX, eventName, eventParams);
  }
}

export function viewItemList(
  items: { code: string }[] = [],
  params?: EventParamsType & ViewItemListParamsAdditionalType,
): void {
  sendEvent("view_item_list", {
    ...params,
    items_skus: items
      .map((el) => el.code)
      .join(", ")
      .trim(),
    items_count: items.length,
  });
}

export function selectItem(item: Product | LineItemType, params?: EventParamsType): void {
  const gtagItem = "productId" in item ? lineItemToGtagItem(item) : productToGtagItem(item);

  sendEvent("select_item", {
    ...params,
    items: [gtagItem],
  });
}

export function viewItem(item: Product, params?: EventParamsType): void {
  sendEvent("view_item", {
    ...params,
    currency: currencyCode,
    value: item.price?.actual?.amount,
    items: [productToGtagItem(item)],
  });
}

export function addItemToWishList(item: Product, params?: EventParamsType): void {
  sendEvent("add_to_wishlist", {
    ...params,
    currency: currencyCode,
    value: item.price?.actual?.amount,
    items: [productToGtagItem(item)],
  });
}

export function addItemToCart(item: Product | VariationType, quantity = 1, params?: EventParamsType): void {
  const inputItem = productToGtagItem(item);

  inputItem.quantity = quantity;

  sendEvent("add_to_cart", {
    ...params,
    currency: currencyCode,
    value: item.price?.actual?.amount * quantity,
    items: [inputItem],
  });
}

export function addItemsToCart(items: (Product | VariationType)[], params?: EventParamsType): void {
  const subtotal: number = sumBy(items, (item) => item?.price?.actual?.amount);
  const inputItems = items.filter((item) => item).map((item) => productToGtagItem(item));

  sendEvent("add_to_cart", {
    ...params,
    currency: currencyCode,
    value: subtotal,
    items: inputItems,
    items_count: inputItems.length,
  });
}

export function removeItemsFromCart(items: LineItemType[], params?: EventParamsType): void {
  const subtotal: number = sumBy(items, (item) => item.extendedPrice?.amount);
  const inputItems = items.map((item) => lineItemToGtagItem(item));

  sendEvent("remove_from_cart", {
    ...params,
    currency: currencyCode,
    value: subtotal,
    items: inputItems,
    items_count: inputItems.length,
  });
}

export function viewCart(cart: CartType, params?: EventParamsType): void {
  sendEvent("view_cart", {
    ...params,
    currency: currencyCode,
    value: cart.total.amount,
    items: cart.items.map(lineItemToGtagItem),
    items_count: cart.items.length,
  });
}

export function clearCart(cart: CartType, params?: EventParamsType): void {
  sendEvent("clear_cart", {
    ...params,
    currency: currencyCode,
    value: cart.total.amount,
    items: cart.items.map(lineItemToGtagItem),
    items_count: cart.items.length,
  });
}

export function beginCheckout(cart: CartType, params?: EventParamsType): void {
  try {
    sendEvent("begin_checkout", {
      ...params,
      currency: cart.currency.code,
      value: cart.total.amount,
      items: cart.items.map(lineItemToGtagItem),
      items_count: cart.items.length,
      coupon: cart.coupons?.[0]?.code,
    });
  } catch (e) {
    Logger.error(DEBUG_PREFIX, beginCheckout.name, e);
  }
}

export function addShippingInfo(cart?: CartType, params?: EventParamsType, shipmentMethodOption?: string): void {
  try {
    sendEvent("add_shipping_info", {
      ...params,
      shipping_tier: shipmentMethodOption,
      currency: cart?.shippingPrice.currency.code,
      value: cart?.shippingPrice.amount,
      coupon: cart?.coupons?.[0]?.code,
      items: cart?.items.map(lineItemToGtagItem),
      items_count: cart?.items.length,
    });
  } catch (e) {
    Logger.error(DEBUG_PREFIX, addShippingInfo.name, e);
  }
}

export function addPaymentInfo(cart?: CartType, params?: EventParamsType, paymentGatewayCode?: string): void {
  try {
    sendEvent("add_payment_info", {
      ...params,
      payment_type: paymentGatewayCode,
      currency: cart?.currency?.code,
      value: cart?.total?.amount,
      coupon: cart?.coupons?.[0]?.code,
      items: cart?.items.map(lineItemToGtagItem),
      items_count: cart?.items.length,
    });
  } catch (e) {
    Logger.error(DEBUG_PREFIX, addPaymentInfo.name, e);
  }
}

export function purchase(order: CustomerOrderType, transactionId?: string, params?: EventParamsType): void {
  try {
    sendEvent("purchase", {
      ...params,
      currency: order.currency?.code,
      transaction_id: transactionId,
      value: order.total.amount,
      coupon: order.coupons?.[0],
      shipping: order.shippingTotal?.amount,
      tax: order.taxTotal?.amount,
      items: order.items.map(lineItemToGtagItem),
      items_count: order?.items?.length,
    });
  } catch (e) {
    Logger.error(DEBUG_PREFIX, purchase.name, e);
  }
}

export function placeOrder(order: CustomerOrderType, params?: EventParamsType): void {
  try {
    sendEvent("place_order", {
      ...params,
      currency: order.currency?.code,
      value: order.total?.amount,
      coupon: order.coupons?.[0],
      shipping: order.shippingTotal.amount,
      tax: order.taxTotal.amount,
      items_count: order.items?.length,
    });
  } catch (e) {
    Logger.error(DEBUG_PREFIX, placeOrder.name, e);
  }
}

export function search(searchTerm: string, visibleItems: { code: string }[] = [], itemsCount: number = 0): void {
  sendEvent("search", {
    search_term: searchTerm,
    items_count: itemsCount,
    visible_items: visibleItems
      .map((el) => el.code)
      .join(", ")
      .trim(),
  });
}

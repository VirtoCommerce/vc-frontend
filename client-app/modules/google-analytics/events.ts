import { sumBy } from "lodash";
import { globals } from "@/core/globals";
import { Logger } from "@/core/utilities";
import { DEBUG_PREFIX } from "./constants";
import { lineItemToGtagItem, productToGtagItem } from "./utils";
import type { CustomEventNamesType, EventParamsType } from "./types";
import type { IAnalyticsEventMap } from "@/core/types/analytics";

const canUseDOM = !!(typeof window !== "undefined" && window.document?.createElement);
const { currencyCode } = globals;

function sendEvent(eventName: Gtag.EventNames | CustomEventNamesType, eventParams?: EventParamsType): void {
  if (canUseDOM && window.gtag) {
    window.gtag("event", eventName, eventParams);
  } else {
    Logger.debug(DEBUG_PREFIX, eventName, eventParams);
  }
}

export const analytics = {
  viewItemList(...[items = [], params]: IAnalyticsEventMap["viewItemList"]) {
    sendEvent("view_item_list", {
      ...params,
      items_skus: items
        .map((el) => el.code)
        .join(", ")
        .trim(),
      items_count: items.length,
    });
  },

  selectItem(...[item, params]: IAnalyticsEventMap["selectItem"]) {
    const gtagItem = "productId" in item ? lineItemToGtagItem(item) : productToGtagItem(item);
    sendEvent("select_item", {
      ...params,
      items: [gtagItem],
    });
  },

  viewItem(...[item, params]: IAnalyticsEventMap["viewItem"]) {
    sendEvent("view_item", {
      ...params,
      currency: currencyCode,
      value: item.price?.actual?.amount,
      items: [productToGtagItem(item)],
    });
  },

  addItemToWishList(...[item, params]: IAnalyticsEventMap["addItemToWishList"]) {
    sendEvent("add_to_wishlist", {
      ...params,
      currency: currencyCode,
      value: item.price?.actual?.amount,
      items: [productToGtagItem(item)],
    });
  },

  addItemToCart(...[item, quantity = 1, params]: IAnalyticsEventMap["addItemToCart"]) {
    const inputItem = productToGtagItem(item);
    inputItem.quantity = quantity;
    sendEvent("add_to_cart", {
      ...params,
      currency: currencyCode,
      value: (item.price?.actual?.amount || 0) * quantity,
      items: [inputItem],
    });
  },

  addItemsToCart(...[items, params]: IAnalyticsEventMap["addItemsToCart"]) {
    const subtotal: number = sumBy(items, (item) => item?.price?.actual?.amount);
    const inputItems = items.filter(Boolean).map((item) => productToGtagItem(item));
    sendEvent("add_to_cart", {
      ...params,
      currency: currencyCode,
      value: subtotal,
      items: inputItems,
      items_count: inputItems.length,
    });
  },

  removeItemsFromCart(...[items, params]: IAnalyticsEventMap["removeItemsFromCart"]) {
    const subtotal: number = sumBy(items, (item) => item.extendedPrice?.amount);
    const inputItems = items.map(lineItemToGtagItem);
    sendEvent("remove_from_cart", {
      ...params,
      currency: currencyCode,
      value: subtotal,
      items: inputItems,
      items_count: inputItems.length,
    });
  },

  viewCart(...[cart, params]: IAnalyticsEventMap["viewCart"]) {
    sendEvent("view_cart", {
      ...params,
      currency: currencyCode,
      value: cart.total.amount,
      items: cart.items.map(lineItemToGtagItem),
      items_count: cart.items.length,
    });
  },

  clearCart(...[cart, params]: IAnalyticsEventMap["clearCart"]) {
    sendEvent("clear_cart", {
      ...params,
      currency: currencyCode,
      value: cart.total.amount,
      items: cart.items.map(lineItemToGtagItem),
      items_count: cart.items.length,
    });
  },

  beginCheckout(...[cart, params]: IAnalyticsEventMap["beginCheckout"]) {
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
      Logger.error(DEBUG_PREFIX, "beginCheckout", e);
    }
  },

  addShippingInfo(...[cart, params, shipmentMethodOption]: IAnalyticsEventMap["addShippingInfo"]) {
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
      Logger.error(DEBUG_PREFIX, "addShippingInfo", e);
    }
  },

  addPaymentInfo(...[cart, params, paymentGatewayCode]: IAnalyticsEventMap["addPaymentInfo"]) {
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
      Logger.error(DEBUG_PREFIX, "addPaymentInfo", e);
    }
  },

  purchase(...[order, transactionId, params]: IAnalyticsEventMap["purchase"]) {
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
      Logger.error(DEBUG_PREFIX, "purchase", e);
    }
  },

  placeOrder(...[order, params]: IAnalyticsEventMap["placeOrder"]) {
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
      Logger.error(DEBUG_PREFIX, "placeOrder", e);
    }
  },

  search(...[searchTerm, visibleItems = [], itemsCount = 0]: IAnalyticsEventMap["search"]) {
    sendEvent("search", {
      search_term: searchTerm,
      items_count: itemsCount,
      visible_items: visibleItems
        .map((el) => el.code)
        .join(", ")
        .trim(),
    });
  },
};

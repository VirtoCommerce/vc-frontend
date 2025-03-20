import { sumBy } from "lodash";
import { globals } from "@/core/globals";
import { Logger, toCSV } from "@/core/utilities";
import { DEBUG_PREFIX } from "./constants";
import { lineItemToGtagItem, productToGtagItem, sendEvent } from "./utils";
import type { TrackerEventsType } from "@/core/types/analytics";

const { currencyCode } = globals;

export const events: TrackerEventsType = {
  viewItemList(items, params) {
    sendEvent("view_item_list", {
      ...params,
      items_skus: toCSV((items ?? []).map((el) => el.code)),
      items_count: items?.length ?? 0,
    });
  },

  selectItem(item, params) {
    const gtagItem = "productId" in item ? lineItemToGtagItem(item) : productToGtagItem(item);
    sendEvent("select_item", {
      ...params,
      items: [gtagItem],
    });
  },

  viewItem(item, params) {
    sendEvent("view_item", {
      ...params,
      currency: currencyCode,
      value: item.price?.actual?.amount,
      items: [productToGtagItem(item)],
    });
  },

  addItemToWishList(item, params) {
    sendEvent("add_to_wishlist", {
      ...params,
      currency: currencyCode,
      value: item.price?.actual?.amount,
      items: [productToGtagItem(item)],
    });
  },

  addItemToCart(item, quantity, params) {
    const inputItem = productToGtagItem(item);
    inputItem.quantity = quantity;
    sendEvent("add_to_cart", {
      ...params,
      currency: currencyCode,
      value: (item.price?.actual?.amount || 0) * (quantity ?? 1),
      items: [inputItem],
    });
  },

  addItemsToCart(items, params) {
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

  removeItemsFromCart(items, params) {
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

  viewCart(cart, params) {
    sendEvent("view_cart", {
      ...params,
      currency: currencyCode,
      value: cart.total.amount,
      items: cart.items.map(lineItemToGtagItem),
      items_count: cart.items.length,
    });
  },

  clearCart(cart, params) {
    sendEvent("clear_cart", {
      ...params,
      currency: currencyCode,
      value: cart.total.amount,
      items: cart.items.map(lineItemToGtagItem),
      items_count: cart.items.length,
    });
  },

  beginCheckout(cart, params) {
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

  addShippingInfo(cart, params, shipmentMethodOption) {
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

  addPaymentInfo(cart, params, paymentGatewayCode) {
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

  purchase(order, transactionId, params) {
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

  placeOrder(order, params) {
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

  search(searchTerm, visibleItems = [], itemsCount = 0) {
    sendEvent("search", {
      search_term: searchTerm,
      items_count: itemsCount,
      visible_items: toCSV(visibleItems.map((el) => el.code)),
    });
  },

  viewSearchResults(searchTerm, params) {
    sendEvent("view_search_results", {
      ...params,
      search_term: searchTerm,
      visible_items: toCSV(params?.visible_items?.map((el) => el.code) ?? []),
      results_count: params?.results_count,
      results_page: params?.results_page,
    });
  },

  login(method, params) {
    sendEvent("login", {
      ...params,
      method,
    });
  },

  signUp(method, params) {
    sendEvent("sign_up", {
      ...params,
      method,
    });
  },
};

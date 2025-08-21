import { sumBy } from "lodash";
import { globals } from "@/core/globals";
import { Logger, toCSV } from "@/core/utilities";
import { DEBUG_PREFIX } from "./constants";
import { lineItemToGtagItem, productToGtagItem, sendEvent } from "./utils";
import type { TrackerEventsType } from "@/core/types/analytics";

const { currencyCode } = globals;

// Types for search context
interface ISearchContext {
  search_term: string;
  timestamp: number;
  results_count: number;
  session_id: string;
}

interface IAttributionResult {
  search_term?: string;
  item_list_id?: string;
  item_list_name?: string;
  source_type: "search" | "browse";
  search_session_id?: string;
  time_since_search?: number;
  attribution_method?: "session" | "referrer" | "default";
}

// Attribution utility function
function getSearchAttribution(): IAttributionResult {
  const ATTRIBUTION_WINDOW = 30 * 60 * 1000; // 30 minutes

  try {
    // Method 1: Check sessionStorage for recent search
    const searchContextStr = sessionStorage.getItem('search_context');
    if (searchContextStr) {
      const searchContext = JSON.parse(searchContextStr) as ISearchContext;
      const timeSinceSearch = Date.now() - searchContext.timestamp;

      if (timeSinceSearch <= ATTRIBUTION_WINDOW) {
        return {
          search_term: searchContext.search_term,
          item_list_id: "search_results",
          item_list_name: `Search results for "${searchContext.search_term}"`,
          source_type: "search",
          search_session_id: searchContext.session_id,
          time_since_search: Math.round(timeSinceSearch / 1000), // seconds
          attribution_method: "session"
        };
      } else {
        // Clear expired search context
        sessionStorage.removeItem('search_context');
      }
    }

    // Method 2: Fallback to referrer check
    const referrer = document.referrer;
    if (referrer) {
      const referrerUrl = new URL(referrer);
      const searchTerm = referrerUrl.searchParams.get('q');
      if (searchTerm) {
        return {
          search_term: searchTerm,
          item_list_id: "search_results",
          item_list_name: `Search results for "${searchTerm}"`,
          source_type: "search",
          attribution_method: "referrer"
        };
      }
    }
  } catch (e) {
    // Attribution detection failed, continue without attribution
    Logger.warn(DEBUG_PREFIX, "Attribution detection failed:", e);
  }

  // Default: browse attribution
  return {
    source_type: "browse",
    attribution_method: "default"
  };
}

export const events: TrackerEventsType = {
  viewItemList(items, params) {
    sendEvent("view_item_list", {
      ...params,
      items_skus: toCSV((items ?? []).map((el) => el.code)),
      items_count: items?.length ?? 0,
    });
  },

  selectItem(item, params) {
    const gtagItem =
      item && typeof item === "object" && "productId" in item ? lineItemToGtagItem(item) : productToGtagItem(item);
    sendEvent("select_item", {
      ...params,
      items: [gtagItem],
    });
  },

  viewItem(item, params) {
    const attribution = getSearchAttribution();

    sendEvent("view_item", {
      ...params,
      currency: currencyCode,
      value: item.price?.actual?.amount,
      items: [productToGtagItem(item)],
      // Attribution parameters (automatically applied)
      ...attribution
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
    const attribution = getSearchAttribution();
    const inputItem = productToGtagItem(item);
    inputItem.quantity = quantity;

    sendEvent("add_to_cart", {
      ...params,
      currency: currencyCode,
      value: (item.price?.actual?.amount || 0) * (quantity ?? 1),
      items: [inputItem],
      // Attribution parameters (automatically applied, overrides manual params)
      ...attribution,
      // Manual params can still override if explicitly provided
      ...(params?.item_list_id ? { item_list_id: params.item_list_id } : {}),
      ...(params?.item_list_name ? { item_list_name: params.item_list_name } : {}),
    });
  },

  addItemsToCart(items, params) {
    const attribution = getSearchAttribution();
    const subtotal: number = sumBy(items, (item) => item?.price?.actual?.amount);
    const inputItems = items.filter(Boolean).map((item) => productToGtagItem(item));

    sendEvent("add_to_cart", {
      ...params,
      currency: currencyCode,
      value: subtotal,
      items: inputItems,
      // GA4 standard parameter name
      number_of_items: inputItems.length,
      // Attribution parameters (automatically applied)
      ...attribution
    });
  },

  updateCartItem(itemId, newQuantity, previousQuantity, params) {
    sendEvent("update_cart_item", {
      ...params,
      item_id: itemId,
      new_quantity: newQuantity,
      previous_quantity: previousQuantity,
    });
  },

  removeItemsFromCart(items, params) {
    const attribution = getSearchAttribution();
    const subtotal: number = sumBy(items, (item) => item.extendedPrice?.amount);
    const inputItems = items.map(lineItemToGtagItem);

    sendEvent("remove_from_cart", {
      ...params,
      currency: currencyCode,
      value: subtotal,
      items: inputItems,
      // GA4 standard parameter name
      number_of_items: inputItems.length,
      // Attribution parameters (automatically applied)
      ...attribution
    });
  },

  viewCart(cart, params) {
    const attribution = getSearchAttribution();

    sendEvent("view_cart", {
      ...params,
      currency: currencyCode,
      value: cart.total.amount,
      items: cart.items.map(lineItemToGtagItem),
      // GA4 standard parameter name
      number_of_items: cart.items.length,
      // Attribution parameters (automatically applied)
      ...attribution
    });
  },

  clearCart(cart, params) {
    const attribution = getSearchAttribution();

    sendEvent("clear_cart", {
      ...params,
      currency: currencyCode,
      value: cart.total.amount,
      items: cart.items.map(lineItemToGtagItem),
      // GA4 standard parameter name
      number_of_items: cart.items.length,
      // Attribution parameters (automatically applied)
      ...attribution
    });
  },

  beginCheckout(cart, params) {
    try {
      const attribution = getSearchAttribution();

      sendEvent("begin_checkout", {
        ...params,
        currency: cart.currency.code,
        value: cart.total.amount,
        items: cart.items.map(lineItemToGtagItem),
        // GA4 standard parameter name
        number_of_items: cart.items.length,
        coupon: cart.coupons?.[0]?.code,
        // Attribution parameters (automatically applied)
        ...attribution
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
        // GA4 standard parameter name
        number_of_items: cart?.items.length,
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
        // GA4 standard parameter name
        number_of_items: cart?.items.length,
      });
    } catch (e) {
      Logger.error(DEBUG_PREFIX, "addPaymentInfo", e);
    }
  },

  purchase(order, transactionId, params) {
    try {
      const attribution = getSearchAttribution();

      sendEvent("purchase", {
        ...params,
        currency: order.currency?.code,
        transaction_id: transactionId,
        value: order.total.amount,
        coupon: order.coupons?.[0],
        shipping: order.shippingTotal?.amount,
        tax: order.taxTotal?.amount,
        items: order.items.map(lineItemToGtagItem),
        // GA4 standard parameter name
        number_of_items: order?.items?.length,
        // Attribution parameters (automatically applied)
        ...attribution
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
        // GA4 standard parameter name
        number_of_items: order.items?.length,
      });
    } catch (e) {
      Logger.error(DEBUG_PREFIX, "placeOrder", e);
    }
  },

  search(searchTerm, visibleItems = [], itemsCount = 0) {
    // Store search context with timestamp for attribution
    const searchContext = {
      search_term: searchTerm,
      timestamp: Date.now(),
      results_count: itemsCount,
      session_id: crypto.randomUUID() // Unique search session
    };

    try {
      sessionStorage.setItem('search_context', JSON.stringify(searchContext));
    } catch (e) {
      // Fallback if sessionStorage unavailable
      Logger.warn(DEBUG_PREFIX, "Failed to store search context:", e);
    }

    sendEvent("search", {
      search_term: searchTerm,
      number_of_items: itemsCount,
      visible_items: toCSV(visibleItems.map((el) => el.code)),
      search_results_count: itemsCount,
      search_type: "site_search",
    });
  },

  viewSearchResults(searchTerm, params) {
    sendEvent("view_search_results", {
      ...params,
      search_term: searchTerm,
      items: params?.visible_items?.map((item, index) => ({
        item_id: item.code,
        item_name: (item as { name?: string }).name || item.code,
        index: index
      })) || [],
      search_results_count: params?.results_count,
      results_page: params?.results_page,
      zero_results: params?.results_count === 0,
      search_refinement: params?.search_refinement || false,
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

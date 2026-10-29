import { sumBy } from "lodash-es";
import { useCurrency } from "@/core/composables/useCurrency";
import { globals } from "@/core/globals";
import { toCSV } from "@/core/utilities/common";
import { Logger } from "@/core/utilities/logger";
import { lineItemToAnalyticsItem, productToAnalyticsItem } from "./items";
import type { ConfiguredPriceType } from "./items";
import type { Product, VariationType } from "@/core/api/graphql/types";
import type { TrackerEventsType } from "@/core/types/analytics";

/** The GA4 names the bus events leave the page under; GA4's own where one exists (`add_to_wishlist`, not `add_item_to_wish_list`). */
export type AnalyticsEventSnakeNameType =
  | "view_item_list"
  | "select_item"
  | "view_item"
  | "add_to_wishlist"
  | "add_to_cart"
  | "update_cart_item"
  | "remove_from_cart"
  | "view_cart"
  | "clear_cart"
  | "begin_checkout"
  | "add_shipping_info"
  | "add_payment_info"
  | "purchase"
  | "place_order"
  | "search"
  | "view_search_results"
  | "login"
  | "sign_up"
  | "form_open"
  | "form_submit";

export type AnalyticsEventSenderType = (
  eventName: AnalyticsEventSnakeNameType,
  params?: Record<string, unknown>,
) => void;

export type CreateAnalyticsEventsOptionsType = {
  send: AnalyticsEventSenderType;
  /** A successful sign-in reloads the page: the tracker parks the login for the page it lands on. */
  deferLogin: (method: string, params?: Record<string, unknown>) => void;
  debugPrefix: string;
};

/**
 * The one mapping from bus events to GA4-named events, shared by every tracker so reports in different tools
 * describe the same funnel. A tracker supplies only how an event leaves the page.
 */
export function createAnalyticsEvents({
  send,
  deferLogin,
  debugPrefix,
}: CreateAnalyticsEventsOptionsType): TrackerEventsType {
  const { currencyCode } = globals;
  const { currentCurrency } = useCurrency();

  return {
    viewItemList(items, params) {
      const itemList = (items ?? []) as (Product | VariationType)[];
      const itemListId = params?.item_list_id;
      const itemListName = params?.item_list_name;
      const paramsCurrency = typeof params?.currency === "string" ? params.currency : undefined;
      const currency = paramsCurrency ?? currentCurrency.value?.code;

      const analyticsItems = itemList.map((product, index) =>
        productToAnalyticsItem(product, index, { itemListId, itemListName, currency }),
      );

      // GA4: event-level currency only when value is set; view_item_list has no value.
      const restParams: Record<string, unknown> = { ...params };
      delete restParams.currency;

      send("view_item_list", {
        ...restParams,
        items: analyticsItems,
        items_count: analyticsItems.length,
      });
    },

    selectItem(item, params) {
      const { index, ...restParams } = params ?? {};
      const analyticsItem =
        item && typeof item === "object" && "productId" in item
          ? {
              ...lineItemToAnalyticsItem(item, index),
              item_list_id: params?.item_list_id,
              item_list_name: params?.item_list_name,
            }
          : productToAnalyticsItem(item, index, {
              itemListId: params?.item_list_id,
              itemListName: params?.item_list_name,
              currency: currentCurrency.value?.code,
            });

      send("select_item", {
        ...restParams,
        items: [analyticsItem],
      });
    },

    viewItem(item, params) {
      send("view_item", {
        ...params,
        currency: currencyCode,
        value: item.price?.actual?.amount,
        items: [productToAnalyticsItem(item, undefined, { currency: currencyCode })],
      });
    },

    addItemToWishList(item, params) {
      send("add_to_wishlist", {
        ...params,
        currency: currencyCode,
        value: item.price?.actual?.amount,
        items: [productToAnalyticsItem(item, undefined, { currency: currencyCode })],
      });
    },

    addItemToCart(item, quantity, params) {
      const { configuredPrice, ...eventParams } = (params ?? {}) as { configuredPrice?: ConfiguredPriceType } & Record<
        string,
        unknown
      >;

      const inputItem = productToAnalyticsItem(item, undefined, configuredPrice);
      inputItem.quantity = quantity;

      const unitPrice = configuredPrice?.actual ?? item.price?.actual?.amount ?? 0;

      send("add_to_cart", {
        ...eventParams,
        currency: currencyCode,
        value: unitPrice * (quantity ?? 1),
        items: [inputItem],
      });
    },

    addItemsToCart(items, params) {
      const subtotal: number = sumBy(items, (item) => item?.price?.actual?.amount);
      const inputItems = items.filter(Boolean).map((item) => productToAnalyticsItem(item));

      send("add_to_cart", {
        ...params,
        currency: currencyCode,
        value: subtotal,
        items: inputItems,
        items_count: inputItems.length,
      });
    },

    addBulkItemsToCart(items, params) {
      const subtotal = items.reduce(
        (acc, item) => acc + (item.salePrice?.amount ?? item.listPrice?.amount ?? 0) * item.quantity,
        0,
      );
      const subtotalRound = Math.round(subtotal * 100) / 100;

      const inputItems = items.map((item, index) => ({
        index,
        item_id: item.sku,
        item_name: item.name,
        affiliation: item.vendor?.name,
        currency: item.salePrice?.currency?.code ?? item.listPrice?.currency?.code,
        discount: item.discountAmount?.amount,
        price: item.salePrice?.amount ?? item.listPrice?.amount,
        quantity: item.quantity,
      }));

      send("add_to_cart", {
        ...params,
        currency: currencyCode,
        value: subtotalRound,
        items: inputItems,
        items_count: inputItems.length,
      });
    },

    updateCartItem(itemId, newQuantity, previousQuantity, params) {
      send("update_cart_item", {
        ...params,
        item_id: itemId,
        new_quantity: newQuantity,
        previous_quantity: previousQuantity,
      });
    },

    removeItemsFromCart(items, params) {
      const subtotal: number = sumBy(items, (item) => item.extendedPrice?.amount);
      const inputItems = items.map((item, index) => lineItemToAnalyticsItem(item, index));

      send("remove_from_cart", {
        ...params,
        currency: currencyCode,
        value: subtotal,
        items: inputItems,
        items_count: inputItems.length,
      });
    },

    viewCart(cart, params) {
      send("view_cart", {
        ...params,
        currency: currencyCode,
        value: cart.total.amount,
        items: cart.items.map((item, index) => lineItemToAnalyticsItem(item, index)),
        items_count: cart.items.length,
      });
    },

    clearCart(cart, params) {
      send("clear_cart", {
        ...params,
        currency: currencyCode,
        value: cart.total.amount,
        items: cart.items.map((item, index) => lineItemToAnalyticsItem(item, index)),
        items_count: cart.items.length,
      });
    },

    beginCheckout(cart, params) {
      try {
        send("begin_checkout", {
          ...params,
          currency: cart.currency.code,
          value: cart.total.amount,
          items: cart.items.map((item, index) => lineItemToAnalyticsItem(item, index)),
          items_count: cart.items.length,
          coupon: cart.coupons?.[0]?.code,
        });
      } catch (e) {
        Logger.error(debugPrefix, "beginCheckout", e);
      }
    },

    addShippingInfo(cart, params, shipmentMethodOption) {
      try {
        send("add_shipping_info", {
          ...params,
          shipping_tier: shipmentMethodOption,
          currency: cart?.shippingPrice.currency.code,
          value: cart?.shippingPrice.amount,
          coupon: cart?.coupons?.[0]?.code,
          items: cart?.items.map((item, index) => lineItemToAnalyticsItem(item, index)),
          items_count: cart?.items.length,
        });
      } catch (e) {
        Logger.error(debugPrefix, "addShippingInfo", e);
      }
    },

    addPaymentInfo(cart, params, paymentGatewayCode) {
      try {
        send("add_payment_info", {
          ...params,
          payment_type: paymentGatewayCode,
          currency: cart?.currency?.code,
          value: cart?.total?.amount,
          coupon: cart?.coupons?.[0]?.code,
          items: cart?.items.map((item, index) => lineItemToAnalyticsItem(item, index)),
          items_count: cart?.items.length,
        });
      } catch (e) {
        Logger.error(debugPrefix, "addPaymentInfo", e);
      }
    },

    purchase(order, params) {
      try {
        send("purchase", {
          ...params,
          currency: order.currency?.code,
          transaction_id: order.id,
          value: order.subTotal?.amount,
          coupon: order.coupons?.[0],
          shipping: order.shippingTotal?.amount,
          tax: order.taxTotal?.amount,
          items: order.items.map((item, index) => lineItemToAnalyticsItem(item, index)),
          items_count: order?.items?.length,
        });
      } catch (e) {
        Logger.error(debugPrefix, "purchase", e);
      }
    },

    placeOrder(order, params) {
      try {
        send("place_order", {
          ...params,
          currency: order.currency?.code,
          transaction_id: order.id,
          value: order.subTotal?.amount,
          coupon: order.coupons?.[0],
          shipping: order.shippingTotal?.amount,
          tax: order.taxTotal?.amount,
          items: order.items?.map((item, index) => lineItemToAnalyticsItem(item, index)),
          items_count: order.items?.length,
        });
      } catch (e) {
        Logger.error(debugPrefix, "placeOrder", e);
      }
    },

    search(searchTerm, visibleItems = [], itemsCount = 0) {
      send("search", {
        search_term: searchTerm,
        items_count: itemsCount,
        visible_items: toCSV(visibleItems.map((el) => el.code)),
      });
    },

    viewSearchResults(searchTerm, params) {
      send("view_search_results", {
        ...params,
        search_term: searchTerm,
        visible_items: toCSV(params?.visible_items?.map((el) => el.code) ?? []),
        results_count: params?.results_count,
        results_page: params?.results_page,
      });
    },

    login(method, params) {
      // A failed attempt stays on the page and is the signed-out visitor's; a success is sent by the page it lands on.
      if (params?.success) {
        deferLogin(method, params);
        return;
      }

      send("login", {
        ...params,
        method,
      });
    },

    signUp(method, params) {
      send("sign_up", {
        ...params,
        method,
      });
    },

    formOpen(formName, params) {
      send("form_open", {
        ...params,
        form_name: formName,
      });
    },

    formSubmit(formName, params) {
      send("form_submit", {
        ...params,
        form_name: formName,
      });
    },
  };
}

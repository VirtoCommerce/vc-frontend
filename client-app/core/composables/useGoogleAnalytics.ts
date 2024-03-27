import { canUseDOM } from "@apollo/client/utilities";
import { useScriptTag } from "@vueuse/core";
import { sumBy } from "lodash";
import { useCurrency } from "@/core/composables/useCurrency";
import { useThemeContext } from "@/core/composables/useThemeContext";
import { IS_DEVELOPMENT } from "@/core/constants";
import { Logger } from "@/core/utilities";
import { globals } from "../globals";
import type {
  Breadcrumb,
  CartType,
  CustomerOrderType,
  LineItemType,
  OrderLineItemType,
  Product,
  VariationType,
} from "@/core/api/graphql/types";

type CustomEventNamesType = "place_order" | "clear_cart";
type EventParamsType = Gtag.ControlParams & Gtag.EventParams & Gtag.CustomParams;
type EventParamsExtendedType = EventParamsType & { item_list_id?: string; item_list_name?: string };

const { currentCurrency } = useCurrency();
const { modulesSettings } = useThemeContext();

const DEBUG_PREFIX = "[GA]";

const MODULE_KEYS = {
  ID: "VirtoCommerce.GoogleEcommerceAnalytics",
  ENABLE_STATE: "GoogleAnalytics4.EnableTracking",
  TRACK_ID: "GoogleAnalytics4.MeasurementId",
};

function getCategories(breadcrumbs: Breadcrumb[] = []): Record<string, string> {
  const categories: Record<string, string> = {};

  breadcrumbs
    .filter((breadcrumb) => breadcrumb.typeName !== "CatalogProduct")
    .slice(0, 5) // first five, according to the documentation
    .forEach((breadcrumb, i) => {
      const number = i + 1;
      categories[`item_category${number > 1 ? number : ""}`] = breadcrumb.title;
    });

  return categories;
}

function productToGtagItem(item: Product | VariationType, index?: number): Gtag.Item {
  const categories: Record<string, string> = "breadcrumbs" in item ? getCategories(item.breadcrumbs) : {};

  return {
    index,
    item_id: item.code,
    item_name: item.name,
    affiliation: item.vendor?.name,
    price: item.price?.list?.amount,
    discount: item.price?.discountAmount?.amount,
    quantity: item.availabilityData?.availableQuantity,
    ...categories,
  };
}

function lineItemToGtagItem(item: LineItemType | OrderLineItemType, index?: number): Gtag.Item {
  const categories: Record<string, string> = getCategories(item.product?.breadcrumbs);

  return {
    index,
    item_id: item.sku,
    item_name: item.name,
    affiliation: item.product?.vendor?.name,
    currency: globals.currencyCode,
    discount: item.discountAmount?.amount,
    price: "price" in item ? item.price.amount : item.listPrice.amount,
    quantity: item.quantity,
    ...categories,
  };
}

function getCartEventParams(cart: CartType): EventParamsType {
  return {
    currency: globals.currencyCode,
    value: cart.total?.amount,
    items: cart.items!.map(lineItemToGtagItem),
  };
}

function sendEvent(eventName: Gtag.EventNames | CustomEventNamesType, eventParams?: EventParamsType): void {
  if (canUseDOM && window.gtag) {
    window.gtag("event", eventName, eventParams);
  } else {
    Logger.debug(DEBUG_PREFIX, eventName, eventParams);
  }
}

function viewItemList(items: Product[], params?: EventParamsExtendedType): void {
  sendEvent("view_item_list", {
    ...params,
    items: items.map(productToGtagItem),
  });
}

function selectItem(item: Product | LineItemType, params?: EventParamsExtendedType): void {
  const gtagItem = "productId" in item ? lineItemToGtagItem(item) : productToGtagItem(item);

  sendEvent("select_item", {
    ...params,
    items: [gtagItem],
  });
}

function viewItem(item: Product, params?: EventParamsExtendedType): void {
  sendEvent("view_item", {
    ...params,
    currency: globals.currencyCode,
    value: item.price?.actual?.amount,
    items: [productToGtagItem(item)],
  });
}

function addItemToWishList(item: Product, params?: EventParamsExtendedType): void {
  sendEvent("add_to_wishlist", {
    ...params,
    currency: globals.currencyCode,
    value: item.price?.actual?.amount,
    items: [productToGtagItem(item)],
  });
}

function addItemToCart(item: Product | VariationType, quantity = 1, params?: EventParamsExtendedType): void {
  const inputItem = productToGtagItem(item);

  inputItem.quantity = quantity;

  sendEvent("add_to_cart", {
    ...params,
    currency: globals.currencyCode,
    value: item.price?.actual?.amount * quantity,
    items: [inputItem],
  });
}

function addItemsToCart(items: LineItemType[], params?: EventParamsExtendedType): void {
  const subtotal: number = sumBy(items, (item) => item.extendedPrice?.amount);
  const inputItems = items.map((item) => lineItemToGtagItem(item));

  sendEvent("add_to_cart", {
    ...params,
    currency: globals.currencyCode,
    value: subtotal,
    items: inputItems,
  });
}

function removeItemsFromCart(items: LineItemType[], params?: EventParamsExtendedType): void {
  const subtotal: number = sumBy(items, (item) => item.extendedPrice?.amount);
  const inputItems = items.map((item) => lineItemToGtagItem(item));

  sendEvent("remove_from_cart", {
    ...params,
    currency: globals.currencyCode,
    value: subtotal,
    items: inputItems,
  });
}

function viewCart(cart: CartType, params?: EventParamsExtendedType): void {
  const cartEventParams: EventParamsType = getCartEventParams(cart);

  sendEvent("view_cart", {
    ...params,
    ...cartEventParams,
  });
}

function clearCart(cart: CartType, params?: EventParamsExtendedType): void {
  const cartEventParams: EventParamsType = getCartEventParams(cart);

  sendEvent("clear_cart", {
    ...params,
    ...cartEventParams,
  });
}

function beginCheckout(cart: CartType, params?: EventParamsExtendedType): void {
  const cartEventParams: EventParamsType = getCartEventParams(cart);

  sendEvent("begin_checkout", {
    ...params,
    ...cartEventParams,
    coupon: cart.coupons?.[0]?.code,
  });
}

function addShippingInfo(cart: CartType, params?: EventParamsExtendedType, shipmentMethodOption?: string): void {
  const shipping_tier = shipmentMethodOption || cart.shipments?.[0]?.shipmentMethodOption;

  sendEvent("add_shipping_info", {
    ...params,
    shipping_tier,
    currency: cart.currency?.code,
    value: cart.total?.amount,
    coupon: cart.coupons?.[0]?.code,
    items: cart.items!.map(lineItemToGtagItem),
  });
}

function addPaymentInfo(cart: CartType, params?: EventParamsExtendedType, paymentGatewayCode?: string): void {
  const paymentMethodCode = paymentGatewayCode || cart.payments?.[0]?.paymentGatewayCode;
  const payment_type = cart.availablePaymentMethods?.find(
    (paymentMethod) => paymentMethod.code === paymentMethodCode,
  )?.paymentMethodGroupType;

  sendEvent("add_payment_info", {
    ...params,
    payment_type,
    currency: cart.currency?.code,
    value: cart.total?.amount,
    coupon: cart.coupons?.[0]?.code,
    items: cart.items!.map(lineItemToGtagItem),
  });
}

function purchase(order: CustomerOrderType, transactionId?: string, params?: EventParamsExtendedType): void {
  sendEvent("purchase", {
    ...params,
    currency: order.currency?.code,
    transaction_id: transactionId,
    value: order.total!.amount,
    coupon: order.coupons?.[0],
    shipping: order.shippingTotal?.amount,
    tax: order.taxTotal?.amount,
    items: order.items!.map(lineItemToGtagItem),
  });
}

function placeOrder(order: CustomerOrderType, params?: EventParamsExtendedType): void {
  sendEvent("place_order", {
    ...params,
    currency: order.currency?.code,
    value: order.total!.amount,
    coupon: order.coupons?.[0],
    shipping: order.shippingTotal?.amount,
    tax: order.taxTotal?.amount,
    items: order.items!.map(lineItemToGtagItem),
  });
}

function search(searchTerm: string): void {
  sendEvent("search", {
    search_term: searchTerm,
  });
}

function init() {
  if (!canUseDOM) {
    return;
  }

  const moduleSettings = modulesSettings.value?.find((el) => el.moduleId === MODULE_KEYS.ID);
  const isGoogleAnalyticsEnabled = !!moduleSettings?.settings?.find((el) => el.name === MODULE_KEYS.ENABLE_STATE)
    ?.value;

  if (isGoogleAnalyticsEnabled) {
    const id = moduleSettings?.settings?.find((el) => el.name === MODULE_KEYS.TRACK_ID)?.value as string;
    if (!IS_DEVELOPMENT) {
      useScriptTag(`https://www.googletagmanager.com/gtag/js?id=${id}`);
    } else {
      Logger.debug(DEBUG_PREFIX, "initialized without sync with google");
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // is not working with rest
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer.push(arguments);
    };

    window.gtag("js", new Date());
    window.gtag("config", id, { debug_mode: true });
    window.gtag("set", { currency: currentCurrency.value.code });
  }
}

export function useGoogleAnalytics() {
  return {
    sendEvent,
    viewItemList,
    selectItem,
    viewItem,
    addItemToWishList,
    addItemToCart,
    addItemsToCart,
    removeItemsFromCart,
    viewCart,
    clearCart,
    beginCheckout,
    addShippingInfo,
    addPaymentInfo,
    purchase,
    placeOrder,
    search,
    init,
  };
}

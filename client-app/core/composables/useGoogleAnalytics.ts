import { useAppContext } from "@/core";
import {
  Product,
  CartType,
  LineItemType,
  Breadcrumb,
  VariationType,
  PaymentMethodType,
  CustomerOrderType,
} from "@/xapi";
import globals from "@/core/globals";

type TEventParams = Gtag.ControlParams | Gtag.EventParams | Gtag.CustomParams;
type TEventParamsForList = TEventParams | { item_list_id?: string; item_list_name?: string };

const { storeSettings } = useAppContext();

const isAvailableGtag: Readonly<boolean> = Boolean(storeSettings.googleAnalyticsEnabled && window.gtag);

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

function lineItemToGtagItem(item: LineItemType, index?: number): Gtag.Item {
  const categories: Record<string, string> = getCategories(item.product?.breadcrumbs);

  return {
    index,
    item_id: item.sku,
    item_name: item.name,
    affiliation: item.product?.vendor?.name,
    currency: globals.currencyCode,
    discount: item.discountAmount?.amount,
    price: item.listPrice?.amount,
    quantity: item.quantity,
    ...categories,
  };
}

function getCartEventParams(cart: CartType): TEventParams {
  return {
    currency: globals.currencyCode,
    value: cart.total?.amount,
    items: cart.items!.map(lineItemToGtagItem),
  };
}

function sendEvent(eventName: Gtag.EventNames | string, eventParams?: TEventParams): void {
  if (isAvailableGtag) {
    window.gtag("event", eventName, eventParams);
  }
}

function viewItemList(items: Product[], params?: TEventParamsForList): void {
  sendEvent("view_item_list", {
    ...params,
    items: items.map(productToGtagItem),
  });
}

function selectItem(item: Product, params?: TEventParamsForList): void {
  sendEvent("select_item", {
    ...params,
    items: [productToGtagItem(item)],
  });
}

function viewItem(item: Product, params?: TEventParamsForList): void {
  sendEvent("view_item", {
    ...params,
    currency: globals.currencyCode,
    value: item.price?.actual?.amount,
    items: [productToGtagItem(item)],
  });
}

function addItemToWishList(item: Product, params?: TEventParamsForList): void {
  sendEvent("add_to_wishlist", {
    ...params,
    currency: globals.currencyCode,
    value: item.price?.actual?.amount,
    items: [productToGtagItem(item)],
  });
}

function addItemToCart(item: Product | VariationType, quantity = 1, params?: TEventParamsForList): void {
  const inputItem = productToGtagItem(item);

  inputItem.quantity = quantity;

  sendEvent("add_to_cart", {
    ...params,
    currency: globals.currencyCode,
    value: item.price?.actual?.amount * quantity,
    items: [inputItem],
  });
}

function removeItemFromCart(item: LineItemType, params?: TEventParamsForList): void {
  sendEvent("remove_from_cart", {
    ...params,
    currency: globals.currencyCode,
    value: item.placedPrice?.amount * (item.quantity ?? 1),
    items: [lineItemToGtagItem(item)],
  });
}

function viewCart(cart: CartType, params?: TEventParamsForList): void {
  const cartEventParams: TEventParams = getCartEventParams(cart);

  sendEvent("view_cart", {
    ...params,
    ...cartEventParams,
  });
}

function beginCheckout(cart: CartType, params?: TEventParamsForList): void {
  const cartEventParams: TEventParams = getCartEventParams(cart);

  sendEvent("begin_checkout", {
    ...params,
    ...cartEventParams,
    coupon: cart.coupons?.[0],
  });
}

function addShippingInfo(cart: CartType, params?: TEventParamsForList): void {
  sendEvent("add_shipping_info", {
    ...params,
    currency: cart.total?.currency?.code,
    value: cart.total?.amount,
    shipping_tier: cart.shipments?.[0].shipmentMethodOption,
    coupon: cart.coupons?.[0],
    items: cart.items!.map(lineItemToGtagItem),
  });
}

function addPaymentInfo(cart: CartType, params?: TEventParamsForList): void {
  sendEvent("add_payment_info", {
    ...params,
    currency: cart.currency?.code,
    value: cart.total?.amount,
    coupon: cart.coupons?.[0],
    payment_type: cart.availablePaymentMethods?.find(
      (paymentMethod: PaymentMethodType) => paymentMethod.code === cart.payments?.[0].paymentGatewayCode
    )?.paymentMethodGroupType,
    items: cart.items!.map(lineItemToGtagItem),
  });
}

function purchase(order: CustomerOrderType, params?: TEventParamsForList): void {
  sendEvent("purchase", {
    ...params,
    transaction_id: order.id,
    value: order.total!.amount,
    coupon: order.coupons?.[0],
    shipping: order.shippingTotal,
    tax: order.taxTotal,
    items: order.items!.map(lineItemToGtagItem),
  });
}

export default () => ({
  isAvailableGtag,
  sendEvent,
  viewItemList,
  selectItem,
  viewItem,
  addItemToWishList,
  addItemToCart,
  removeItemFromCart,
  viewCart,
  beginCheckout,
  addShippingInfo,
  addPaymentInfo,
  purchase,
});

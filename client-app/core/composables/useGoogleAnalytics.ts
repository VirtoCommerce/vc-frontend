import { useAppContext } from "@/core";
import globals from "@/core/globals";
import { Breadcrumb, CartType, CustomerOrderType, LineItemType, Product, VariationType } from "@/xapi";

type EventParamsType = Gtag.ControlParams & Gtag.EventParams & Gtag.CustomParams;
type EventParamsExtendedType = EventParamsType & { item_list_id?: string; item_list_name?: string };

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

function getCartEventParams(cart: CartType): EventParamsType {
  return {
    currency: globals.currencyCode,
    value: cart.total?.amount,
    items: cart.items!.map(lineItemToGtagItem),
  };
}

function sendEvent(eventName: Gtag.EventNames | string, eventParams?: EventParamsType): void {
  if (isAvailableGtag) {
    window.gtag("event", eventName, eventParams);
  }
}

function viewItemList(items: Product[], params?: EventParamsExtendedType): void {
  sendEvent("view_item_list", {
    ...params,
    items: items.map(productToGtagItem),
  });
}

function selectItem(item: Product, params?: EventParamsExtendedType): void {
  sendEvent("select_item", {
    ...params,
    items: [productToGtagItem(item)],
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

function removeItemFromCart(item: LineItemType, params?: EventParamsExtendedType): void {
  sendEvent("remove_from_cart", {
    ...params,
    currency: globals.currencyCode,
    value: item.placedPrice?.amount * (item.quantity ?? 1),
    items: [lineItemToGtagItem(item)],
  });
}

function viewCart(cart: CartType, params?: EventParamsExtendedType): void {
  const cartEventParams: EventParamsType = getCartEventParams(cart);

  sendEvent("view_cart", {
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
    currency: cart.total?.currency?.code,
    value: cart.total?.amount,
    coupon: cart.coupons?.[0]?.code,
    items: cart.items!.map(lineItemToGtagItem),
  });
}

function addPaymentInfo(cart: CartType, params?: EventParamsExtendedType, paymentGatewayCode?: string): void {
  const paymentMethodCode = paymentGatewayCode || cart.payments?.[0]?.paymentGatewayCode;
  const payment_type = cart.availablePaymentMethods?.find(
    (paymentMethod) => paymentMethod.code === paymentMethodCode
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

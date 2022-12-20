import { useAppContext } from "@/core";
import { Product, CartType, LineItemType, Breadcrumb, VariationType } from "@/xapi";
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
    value: item.price?.list?.amount,
    items: [productToGtagItem(item)],
  });
}

function addItemToCart(item: Product | VariationType, quantity = 1, params?: TEventParamsForList): void {
  const inputItem = productToGtagItem(item);

  inputItem.quantity = quantity;

  sendEvent("add_to_cart", {
    ...params,
    currency: globals.currencyCode,
    value: item.price?.list?.amount * quantity,
    items: [inputItem],
  });
}

function removeItemFromCart(item: LineItemType, params?: TEventParamsForList): void {
  const inputItem = lineItemToGtagItem(item);

  sendEvent("remove_from_cart", {
    ...params,
    currency: globals.currencyCode,
    value: item.listPrice?.amount * (inputItem.quantity ?? 1),
    items: [inputItem],
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

export default () => ({
  isAvailableGtag,
  sendEvent,
  viewItemList,
  selectItem,
  viewItem,
  addItemToCart,
  removeItemFromCart,
  viewCart,
  beginCheckout,
});

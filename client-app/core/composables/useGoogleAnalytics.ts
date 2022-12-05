import { useAppContext } from "@/core";
import { Product } from "@/xapi";
import globals from "@/core/globals";

type TEventParams = Gtag.ControlParams | Gtag.EventParams | Gtag.CustomParams;
type TEventParamsForList = TEventParams | { item_list_id?: string; item_list_name?: string };

const { storeSettings } = useAppContext();

const isAvailableGtag: Readonly<boolean> = Boolean(storeSettings.googleAnalyticsEnabled && window.gtag);

function productToGtagItem(product: Product, index?: number): Gtag.Item {
  const categories: Record<string, string> = {};

  if (product.breadcrumbs?.length) {
    product.breadcrumbs
      .filter((breadcrumb) => breadcrumb.typeName !== "CatalogProduct")
      .slice(0, 5) // first five, according to the documentation
      .forEach((breadcrumb, i) => {
        const number = i + 1;
        categories[`item_category${number > 1 ? number : ""}`] = breadcrumb.title;
      });
  }

  return {
    index,
    item_id: product.code,
    item_name: product.name,
    affiliation: product.vendor?.name,
    price: product.price?.list?.amount,
    discount: product.price?.discountAmount?.amount,
    quantity: product.availabilityData?.availableQuantity,
    ...categories,
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

function selectItem(product: Product, params?: TEventParamsForList): void {
  sendEvent("select_item", {
    ...params,
    items: [productToGtagItem(product)],
  });
}

function viewItem(product: Product, params?: TEventParamsForList): void {
  sendEvent("view_item", {
    ...params,
    currency: globals.currencyCode,
    value: product.price?.list?.amount,
    items: [productToGtagItem(product)],
  });
}

export default () => ({
  isAvailableGtag,
  sendEvent,
  viewItemList,
  selectItem,
  viewItem,
});

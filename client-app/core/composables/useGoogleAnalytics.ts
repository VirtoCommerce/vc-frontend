import { useAppContext } from "@/core";
import { Product } from "@/xapi";

type TEventParams = Gtag.ControlParams | Gtag.EventParams | Gtag.CustomParams;
type TEventParamsForList = TEventParams | { item_list_id?: string; item_list_name?: string };

const { storeSettings } = useAppContext();

const isAvailableGtag: Readonly<boolean> = Boolean(storeSettings.googleAnalyticsEnabled && window.gtag);

function productToGtagItem(product: Product, index?: number): Gtag.Item {
  return {
    index,
    item_id: product.code,
    item_name: product.name,
    affiliation: product.vendor?.name,
    price: product.price?.list?.amount,
    discount: product.price?.discountAmount?.amount,
    quantity: product.availabilityData?.availableQuantity,
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

export default () => ({
  isAvailableGtag,
  sendEvent,
  viewItemList,
  selectItem,
});

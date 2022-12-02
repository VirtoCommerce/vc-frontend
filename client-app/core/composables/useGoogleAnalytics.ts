import { useAppContext } from "@/core";
import { Product } from "@/xapi";

type TEventParams = Gtag.ControlParams | Gtag.EventParams | Gtag.CustomParams;
type TEventOtherParams = Gtag.ControlParams | Gtag.CustomParams;

const { storeSettings } = useAppContext();

const isAvailableGtag: Readonly<boolean> = Boolean(storeSettings.googleAnalyticsEnabled && window.gtag);

function productToGtagItem(product: Product, index = 0): Gtag.Item {
  return {
    index,
    item_name: product.name,
    item_variant: product.code,
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

function viewItemList(
  items: Product[],
  params?:
    | TEventOtherParams
    | {
        item_list_id?: string;
        item_list_name?: string;
      }
): void {
  sendEvent("view_item_list", {
    ...params,
    items: items.map(productToGtagItem),
  });
}

export default () => ({
  isAvailableGtag,
  sendEvent,
  viewItemList,
});

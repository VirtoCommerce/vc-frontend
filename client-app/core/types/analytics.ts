import type { CartType, CustomerOrderType, LineItemType, Product, VariationType } from "@/core/api/graphql/types";
import type { ICustomAnalyticsEventMap } from "@/core/types/analytics-custom";
export interface IBasicAnalyticsEventMap {
  viewItemList: [items: { code: string }[], params?: EventParamsType & ViewItemListParamsAdditionalType];
  selectItem: [item: Product | LineItemType, params?: EventParamsType];
  viewItem: [item: Product, params?: EventParamsType];
  addItemToWishList: [item: Product, params?: EventParamsType];
  addItemToCart: [item: Product | VariationType, quantity?: number, params?: EventParamsType];
  addItemsToCart: [items: (Product | VariationType)[], params?: EventParamsType];
  removeItemsFromCart: [items: LineItemType[], params?: EventParamsType];
  viewCart: [cart: CartType, params?: EventParamsType];
  clearCart: [cart: CartType, params?: EventParamsType];
  beginCheckout: [cart: CartType, params?: EventParamsType];
  addShippingInfo: [cart?: CartType, params?: EventParamsType, shipmentMethodOption?: string];
  addPaymentInfo: [cart?: CartType, params?: EventParamsType, paymentGatewayCode?: string];
  purchase: [order: CustomerOrderType, transactionId?: string, params?: EventParamsType];
  placeOrder: [order: CustomerOrderType, params?: EventParamsType];
  search: [searchTerm: string, visibleItems?: { code: string }[], itemsCount?: number];
}

type AnalyticsEventMapType = keyof ICustomAnalyticsEventMap extends never
  ? IBasicAnalyticsEventMap
  : Omit<IBasicAnalyticsEventMap, keyof ICustomAnalyticsEventMap> & ICustomAnalyticsEventMap;

export type AnalyticsEventNameType = keyof AnalyticsEventMapType;

export type ViewItemListParamsAdditionalType = { item_list_id?: string; item_list_name?: string };

export type EventParamsType = Record<string, unknown>;

export type TrackerType = {
  meta?: TrackerMetaType;
  events: TrackerEventsType;
};

export type TrackerMetaType = {
  name: string;
};

export type TrackerEventsType = Partial<{
  [K in AnalyticsEventNameType]: (...args: AnalyticsEventMapType[K]) => void | Promise<void>;
}>;

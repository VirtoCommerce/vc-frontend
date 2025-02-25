import type { CartType, CustomerOrderType, LineItemType, Product, VariationType } from "@/core/api/graphql/types";

export interface IAnalyticsEventMap {
  viewItemList: [items: { code: string }[], params?: EventParamsType & ViewItemListParamsAdditionalType];
  selectItem: [item: Product | LineItemType, params?: EventParamsType];
  viewItem: [item: Product, params?: EventParamsType];
  addItemToWishList: [item: Product, params?: EventParamsType];
  addItemToCart: [
    item: Product | VariationType,
    quantity?: number,
    params?: EventParamsType & AddToCartParamsAdditionalType,
  ];
  addItemsToCart: [items: (Product | VariationType)[], params?: EventParamsType & AddToCartParamsAdditionalType];
  removeItemsFromCart: [items: LineItemType[], params?: EventParamsType];
  viewCart: [cart: CartType, params?: EventParamsType];
  clearCart: [cart: CartType, params?: EventParamsType];
  beginCheckout: [cart: CartType, params?: EventParamsType];
  addShippingInfo: [cart?: CartType, params?: EventParamsType, shipmentMethodOption?: string];
  addPaymentInfo: [cart?: CartType, params?: EventParamsType, paymentGatewayCode?: string];
  purchase: [order: CustomerOrderType, transactionId?: string, params?: EventParamsType];
  placeOrder: [order: CustomerOrderType, params?: EventParamsType];
  search: [searchTerm: string, visibleItems?: { code: string }[], itemsCount?: number];
  viewSearchResults: [searchTerm: string, params?: ViewSearchResultsParamsAdditionalType];
}

export type AnalyticsEventNameType = keyof IAnalyticsEventMap;

export type ViewItemListParamsAdditionalType = { item_list_id?: string; item_list_name?: string };
export type AddToCartParamsAdditionalType = { source_route?: string; source_block?: string; search_terms?: string };
export type ViewSearchResultsParamsAdditionalType = {
  visible_items?: { code: string }[];
  results_count?: number;
  results_page?: number;
};

export type EventParamsType = Record<string, unknown>;

export type TrackerType = {
  meta?: TrackerMetaType;
  events: TrackerEventsType;
};

export type TrackerMetaType = {
  name: string;
};

export type TrackerEventsType = Partial<{
  [K in AnalyticsEventNameType]: (...args: IAnalyticsEventMap[K]) => void | Promise<void>;
}>;

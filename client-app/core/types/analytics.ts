import type { CartType, CustomerOrderType, LineItemType, Product, VariationType } from "@/core/api/graphql/types";
import type { ICustomAnalyticsEventMap } from "@/core/types/analytics-custom";

export interface IBasicAnalyticsEventMap {
  viewItemList: [items: { code: string }[], params?: EventParamsType & ListPropertiesType];
  selectItem: [item: Product | LineItemType, params?: EventParamsType & ListPropertiesType];
  viewItem: [item: Product, params?: EventParamsType];
  addItemToWishList: [item: Product, params?: EventParamsType];
  addItemToCart: [
    item: Product | VariationType,
    quantity?: number,
    params?: EventParamsType & AddToCartParamsAdditionalType,
  ];
  updateCartItem: [itemId: string, newQuantity: number, previousQuantity: number, params?: EventParamsType];
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
  login: [method: string, params?: EventParamsType & LoginParamsAdditionalType];
  signUp: [method: string, params?: EventParamsType & SignUpParamsAdditionalType];
}

export type AnalyticsEventMapType = keyof ICustomAnalyticsEventMap extends never
  ? IBasicAnalyticsEventMap

  : Omit<IBasicAnalyticsEventMap, keyof ICustomAnalyticsEventMap> & ICustomAnalyticsEventMap;

export type AnalyticsEventNameType = keyof AnalyticsEventMapType;

export type AddToCartParamsAdditionalType = { source_route?: string; source_block?: string; search_terms?: string };
export type LoginParamsAdditionalType = { errors?: string; success?: boolean };
export type SignUpParamsAdditionalType = { type?: string; errors?: string; success?: boolean };
export type ViewSearchResultsParamsAdditionalType = {
  visible_items?: { code: string }[];
  results_count?: number;
  results_page?: number;
  zero_results?: boolean;
  search_refinement?: boolean;
};

export type EventParamsType = Record<string, unknown>;

export type TrackerType = {
  meta?: TrackerMetaType;
  events: TrackerEventsType;
};

export type TrackerMetaType = {
  name: string;
  allowDebugInDevelopment?: boolean;
};

export type TrackerEventsType = Partial<{
  [K in AnalyticsEventNameType]: (...args: AnalyticsEventMapType[K]) => void | Promise<void>;
}>;

type ListPropertiesType = {
  item_list_id?: string;
  item_list_name?: string;
  related_id?: string;
  related_type?: string;
};

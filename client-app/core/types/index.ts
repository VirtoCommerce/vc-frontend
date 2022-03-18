import { CartAddressType, MemberAddressType, OrderAddressType } from "@core/api/graphql/types";
import { LocationQueryValue } from "vue-router";

export type Dictionary = { [key: string | symbol | number]: any };

export enum AddressType {
  Billing = 1,
  Shipping = 2,
  BillingAndShipping = 3,
}

export type AnyAddressType = MemberAddressType | OrderAddressType | CartAddressType;

export type UseRouteQueryParamOptions<T = LocationQueryValue | LocationQueryValue[]> = {
  defaultValue?: T | null;
  validator?(queryValue: any): boolean;
  onChange?(value: T, isChanged: boolean): void | Promise<void>;
  // @default push
  updateMethod?: "push" | "replace";
  // @default true
  removeFalsyValue?: boolean;
  // @default true
  removeNullishValue?: boolean;
  // @default true
  removeDefaultValue?: boolean;
};

export interface IThemeConfig {
  current: string | IThemeConfigPreset;
  presets: Record<string, IThemeConfigPreset>;
}

export interface IThemeConfigPreset {
  anonymous_access_enabled?: boolean;
  anonymous_price_enabled?: boolean;
  anonymous_checkout?: boolean;

  bulk_order_enabled?: boolean;
  product_compare_enabled?: boolean;
  product_compare_limit?: number;
  out_of_stock_order_enabled?: boolean;
  search_suggestions_category_enabled?: boolean;
  search_suggestions_category_limit?: number;
  search_suggestions_product_limit?: number;
  sticky_header_enabled?: boolean;
  store_selector_enabled?: boolean;
  top_header_menu_link_list?: string;
  header_menu_link_list?: string;
  products_menu_link_list?: string;
  footer_menu_link_list?: string;

  registration_enabled?: boolean;
  social_auth_google?: boolean;
  social_auth_twitter?: boolean;
  social_auth_ad?: boolean;
  social_auth_facebook?: boolean;

  catalog_items_limit?: number;
  catalog_items_selector?: number[];
  infinite_scrolling_enabled?: boolean;
  in_stock_count_enabled?: boolean;
  sort_by_price_enabled?: boolean;
  sort_by_name_enabled?: boolean;
  sort_by_featured_enabled?: boolean;
  show_unavailable_variations?: boolean;
  show_unavailable_products?: boolean;
  show_related_products?: boolean;
  related_products_group_name?: string;
  related_products_limit?: number;
  product_image_zoom_enabled?: boolean;
  product_vendor_enabled?: boolean;
  product_share_enabled?: boolean;
  show_prices_with_taxes?: boolean;
  default_delivery_method?: string;

  checkout_comment_enabled?: boolean;
  checkout_purchase_order_enabled?: boolean;
  checkout_coupon_enabled?: boolean;
  checkout_gifts_enabled?: boolean;
  checkout_shipping_address_creation_enabled?: boolean;
  checkout_billing_address_creation_enabled?: boolean;

  orders_default_sorting?: string;
  orders_search_enabled?: boolean;
  orders_filter_enabled?: boolean;
  orders_reorder_enabled?: boolean;

  logo_image?: string;
  logo_inverted_image?: string;
  favicon_image?: string;
  primary_font_family?: string;
  secondary_font_family?: string;
  color_primary?: string;
  color_primary_hover?: string;
  color_secondary?: string;
  color_secondary_hover?: string;
  color_link?: string;
  color_link_hover?: string;
  color_body_bg?: string;
  color_body_text?: string;
  color_popup_danger_bg?: string;
  color_popup_success_bg?: string;
  color_popup_warning_bg?: string;
  color_popup_info_bg?: string;
  color_alert_danger_bg?: string;
  color_alert_success_bg?: string;
  color_alert_warning_bg?: string;
  color_alert_info_bg?: string;
  color_alert_danger_text?: string;
  color_alert_success_text?: string;
  color_alert_warning_text?: string;
  color_alert_info_text?: string;
  color_danger?: string;
  color_success?: string;
  color_warning?: string;
  color_price_color?: string;
  color_checkbox?: string;
  color_header_top_bg?: string;
  color_header_top_text?: string;
  color_header_top_link?: string;
  color_header_top_link_hover?: string;
  color_header_bottom_bg?: string;
  color_header_bottom_text?: string;
  color_header_bottom_link?: string;
  color_header_bottom_link_hover?: string;
  color_header_bottom_link_active?: string;
  color_header_bottom_dropdown_bg?: string;
  color_header_bottom_dropdown_link?: string;
  color_header_bottom_dropdown_link_hover?: string;
  color_search_bar_bg?: string;
  color_footer_top_bg?: string;
  color_footer_top_text?: string;
  color_footer_top_link?: string;
  color_footer_top_link_hover?: string;
  color_footer_top_link_active?: string;
  color_footer_bottom_bg?: string;
  color_footer_bottom_text?: string;
  color_footer_bottom_link?: string;
  color_footer_bottom_link_hover?: string;
}

export interface IThemeContext {
  baseUrl?: string;
  storeId?: string;
  storeName?: string;
  language?: string;
  availLanguages?: string[];
  catalogId?: string;
  currency?: string;
  availCurrencies?: string[];
  userId?: string;
  userName?: string;
  settings?: { key: string; value: unknown }[];
}

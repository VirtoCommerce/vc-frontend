import { MaybeRef } from "@vueuse/core";
import { CartAddressType, ContactType, MemberAddressType, OrderAddressType } from "@/xapi/types";
import { LocationQueryValue } from "vue-router";

export * from "./currency";
export * from "./global-variables";
export * from "./language";
export * from "./page-content";
export * from "./role";
export * from "./theme-context";

export type Dictionary = { [key: string | symbol | number]: any };

export enum AddressType {
  Billing = 1,
  Shipping = 2,
  BillingAndShipping = 3,
}

export type OrganizationContactType = ContactType & {
  email?: string;
  role?: string;
  displayStatus: OrganizationContactDisplayStatusType;
};

export type OrganizationContactDisplayStatusType = {
  localeLabel: string;
  iconUrl?: string;
  cssStyles?: string;
};

export type AnyAddressType = MemberAddressType | OrderAddressType | CartAddressType;

export type UsePageSeoData = {
  /**
   * input chunks: ["title_part_1", "title_part_2"]
   * output string: title_part_1<page_title_divider>title_part_2
   */
  title?: MaybeRef<string | string[] | undefined>;
  meta?: Record<string, MaybeRef<string | undefined>>;
};

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

export interface ISortInfo {
  column: string;
  direction: string;
}

export interface IThemeConfig {
  current: string | { [key: string]: any };
  presets: Record<string, IThemeConfigPreset>;
}

export interface ISocialSharingService {
  name: string;
  icon?: string;
  url_template: string;
}

export interface IThemeConfigPreset {
  page_title_with_store_name?: boolean;
  page_title_store_name_align?: string | "start" | "end";
  page_title_divider?: string;

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
  image_tools_enabled?: boolean;

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

  wishlists_limit?: number;

  search_min_chars?: number;

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
  orders_statuses?: string[];

  social_sharing_services?: ISocialSharingService[];
  support_phone_number?: string;

  logo_image?: string;
  logo_inverted_image?: string;
  favicon_image?: string;
  homepage_background_image?: string;
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
  color_danger_hover?: string;
  color_success?: string;
  color_success_hover?: string;
  color_warning?: string;
  color_warning_hover?: string;
  color_price?: string;
  color_mobile_menu_bg?: string;
  color_mobile_menu_link?: string;
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

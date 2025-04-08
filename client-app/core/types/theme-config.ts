import type { BrowserTargetType } from "./browser-window-target";
import type { ISocialSharingService } from "./social-sharing";
import type { SortDirection } from "@/core/enums";
import type { IOrderStatus } from "@/core/types";

export interface IThemeConfigPreset {
  primary_font_family?: string;
  secondary_font_family?: string;

  color_primary_50: string;
  color_primary_100: string;
  color_primary_200: string;
  color_primary_300: string;
  color_primary_400: string;
  color_primary_500: string;
  color_primary_600: string;
  color_primary_700: string;
  color_primary_800: string;
  color_primary_900: string;
  color_primary_950: string;

  color_secondary_50: string;
  color_secondary_100: string;
  color_secondary_200: string;
  color_secondary_300: string;
  color_secondary_400: string;
  color_secondary_500: string;
  color_secondary_600: string;
  color_secondary_700: string;
  color_secondary_800: string;
  color_secondary_900: string;
  color_secondary_950: string;

  color_accent_50: string;
  color_accent_100: string;
  color_accent_200: string;
  color_accent_300: string;
  color_accent_400: string;
  color_accent_500: string;
  color_accent_600: string;
  color_accent_700: string;
  color_accent_800: string;
  color_accent_900: string;
  color_accent_950: string;

  color_neutral_50: string;
  color_neutral_100: string;
  color_neutral_200: string;
  color_neutral_300: string;
  color_neutral_400: string;
  color_neutral_500: string;
  color_neutral_600: string;
  color_neutral_700: string;
  color_neutral_800: string;
  color_neutral_900: string;
  color_neutral_950: string;

  color_warning_50: string;
  color_warning_100: string;
  color_warning_200: string;
  color_warning_300: string;
  color_warning_400: string;
  color_warning_500: string;
  color_warning_600: string;
  color_warning_700: string;
  color_warning_800: string;
  color_warning_900: string;
  color_warning_950: string;

  color_danger_50: string;
  color_danger_100: string;
  color_danger_200: string;
  color_danger_300: string;
  color_danger_400: string;
  color_danger_500: string;
  color_danger_600: string;
  color_danger_700: string;
  color_danger_800: string;
  color_danger_900: string;
  color_danger_950: string;

  color_success_50: string;
  color_success_100: string;
  color_success_200: string;
  color_success_300: string;
  color_success_400: string;
  color_success_500: string;
  color_success_600: string;
  color_success_700: string;
  color_success_800: string;
  color_success_900: string;
  color_success_950: string;

  color_info_50: string;
  color_info_100: string;
  color_info_200: string;
  color_info_300: string;
  color_info_400: string;
  color_info_500: string;
  color_info_600: string;
  color_info_700: string;
  color_info_800: string;
  color_info_900: string;
  color_info_950: string;

  color_additional_50: string;
  color_additional_950: string;

  color_body_bg?: string;
  color_body_text?: string;

  color_link?: string;
  color_link_hover?: string;

  color_price?: string;

  color_hexagon_icon_bg?: string;
  color_hexagon_icon?: string;

  color_header_top_bg?: string;
  color_header_top_text?: string;
  color_header_top_link?: string;
  color_header_top_link_hover?: string;

  color_header_bottom_bg?: string;
  color_header_bottom_text?: string;
  color_header_bottom_link?: string;
  color_header_bottom_link_hover?: string;
  color_header_bottom_link_active?: string;

  color_footer_top_bg?: string;
  color_footer_top_text?: string;
  color_footer_top_link?: string;
  color_footer_top_link_hover?: string;
  color_footer_top_link_active?: string;

  color_footer_bottom_bg?: string;
  color_footer_bottom_text?: string;
  color_footer_bottom_link?: string;
  color_footer_bottom_link_hover?: string;

  color_mobile_search_bar_bg?: string;
  color_mobile_menu_bg?: string;
  color_mobile_menu_text?: string;
  color_mobile_menu_link?: string;
  color_mobile_menu_link_active?: string;
  color_mobile_menu_icon?: string;
  color_mobile_menu_icon_active?: string;
}

export interface IThemeConfigSettings {
  details_browser_target?: BrowserTargetType;

  search_by_static_content_enabled?: boolean;

  anonymous_price_enabled?: boolean;
  anonymous_checkout?: boolean;

  push_messages_enabled?: boolean;
  files_enabled?: boolean;

  bulk_order_enabled?: boolean;
  product_compare_enabled?: boolean;
  product_compare_limit?: number;
  product_filters_sorting?: boolean;
  product_filters_sorting_direction?: SortDirection | string;
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
  image_thumbnails_enabled?: boolean;
  image_thumbnails_original_fallback_enabled?: boolean;
  image_thumbnails_suffixes?: { sm: string; md: string; lg: string };
  image_carousel_in_product_card_enabled?: boolean;

  registration_enabled?: boolean;
  social_auth_google?: boolean;
  social_auth_twitter?: boolean;
  social_auth_ad?: boolean;
  social_auth_facebook?: boolean;

  catalog_items_limit?: number;
  catalog_items_selector?: number[];
  infinite_scrolling_enabled?: boolean;
  in_stock_count_enabled?: boolean;
  zero_price_product_enabled?: boolean;
  sort_by_price_enabled?: boolean;
  sort_by_name_enabled?: boolean;
  sort_by_featured_enabled?: boolean;
  show_unavailable_variations?: boolean;
  show_unavailable_products?: boolean;
  show_related_products?: boolean;
  related_products_group_name?: string;
  related_products_limit?: number;
  product_image_zoom_enabled?: boolean;
  product_share_enabled?: boolean;
  show_prices_with_taxes?: boolean;
  default_delivery_method?: string;

  categories_limit?: number;

  wishlists_limit?: number;

  search_min_chars?: number;
  search_max_chars?: number;
  search_static_content_suggestions_enabled?: boolean;
  search_product_phrase_suggestions_enabled?: boolean;

  vendor_enabled?: boolean;
  vendor_rating_enabled?: boolean;

  checkout_multistep_enabled?: boolean;
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
  orders_statuses?: IOrderStatus[];
  quote_statuses?: IOrderStatus[];
  line_items_group_by_vendor_enabled?: boolean;

  social_sharing_services?: ISocialSharingService[];

  logo_image?: string;
  logo_inverted_image?: string;
  favicon_image?: string;
  homepage_background_image?: string;
  isCVVinSkyflowRequired?: boolean;
  default_return_url?: string;
  previewers_settings?: {
    priorities?: {
      [key: string]: number;
    };
  };
}

export interface IThemeConfig {
  current: string;
  settings: IThemeConfigSettings;
}

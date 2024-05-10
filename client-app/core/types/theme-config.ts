import type { IOrderStatus } from "./order-status";
import type { IQuoteStatus } from "./quote-status";
import type { ISocialSharingService } from "./social-sharing";
import type { SortDirection } from "@/core/enums";

export interface IThemeConfigPreset {
  search_by_static_content_enabled?: boolean;
  page_title_with_store_name?: boolean;
  page_title_store_name_align?: "start" | "end";
  page_title_divider?: string;

  catalog_menu_link_list_name?: string | null;
  catalog_empty_categories_enabled?: boolean;

  anonymous_price_enabled?: boolean;
  anonymous_checkout?: boolean;

  push_messages_enabled?: boolean;
  files_enabled?: boolean;

  quotes_enabled?: boolean;
  quotes_files_scope?: string;

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
  rating_enabled?: boolean;

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
  quote_statuses?: IQuoteStatus[];
  line_items_group_by_vendor_enabled?: boolean;

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
  color_modal_danger_bg?: string;
  color_modal_success_bg?: string;
  color_modal_warning_bg?: string;
  color_modal_info_bg?: string;
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
  color_mobile_menu_icon?: string;
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
  isCVVinSkyflowRequired?: boolean;
}

export interface IThemeConfig {
  current: string | IThemeConfigPreset;
  presets: Record<string, IThemeConfigPreset>;
}

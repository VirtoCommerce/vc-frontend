import type { ISocialSharingService } from "./social-sharing";
import type { DesktopMenuModeType } from "@/core/constants";
import type { BrowserTargetType } from "@/core/enums";
import type { IOrderStatus, IQuoteStatus, SortDirectionType } from "@/core/types";
import type { CatalogPaginationModeType } from "@/shared/catalog/types/catalog";

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

  color_vc_focus_ring?: string;

  color_vc_background_solid_primary?: string;
  color_vc_background_solid_secondary?: string;
  color_vc_background_solid_accent?: string;
  color_vc_background_solid_neutral?: string;
  color_vc_background_solid_warning?: string;
  color_vc_background_solid_danger?: string;
  color_vc_background_solid_success?: string;
  color_vc_background_solid_info?: string;

  color_vc_background_soft_primary?: string;
  color_vc_background_soft_secondary?: string;
  color_vc_background_soft_accent?: string;
  color_vc_background_soft_neutral?: string;
  color_vc_background_soft_warning?: string;
  color_vc_background_soft_danger?: string;
  color_vc_background_soft_success?: string;
  color_vc_background_soft_info?: string;

  color_vc_background_outline_primary?: string;
  color_vc_background_outline_secondary?: string;
  color_vc_background_outline_accent?: string;
  color_vc_background_outline_neutral?: string;
  color_vc_background_outline_warning?: string;
  color_vc_background_outline_danger?: string;
  color_vc_background_outline_success?: string;
  color_vc_background_outline_info?: string;

  color_vc_background_surface_primary?: string;
  color_vc_background_surface_secondary?: string;
  color_vc_background_surface_accent?: string;
  color_vc_background_surface_neutral?: string;
  color_vc_background_surface_warning?: string;
  color_vc_background_surface_danger?: string;
  color_vc_background_surface_success?: string;
  color_vc_background_surface_info?: string;

  color_vc_background_ghost_primary?: string;
  color_vc_background_ghost_secondary?: string;
  color_vc_background_ghost_accent?: string;
  color_vc_background_ghost_neutral?: string;
  color_vc_background_ghost_warning?: string;
  color_vc_background_ghost_danger?: string;
  color_vc_background_ghost_success?: string;
  color_vc_background_ghost_info?: string;

  color_vc_background_tonal_primary?: string;
  color_vc_background_tonal_secondary?: string;
  color_vc_background_tonal_accent?: string;
  color_vc_background_tonal_neutral?: string;
  color_vc_background_tonal_warning?: string;
  color_vc_background_tonal_danger?: string;
  color_vc_background_tonal_success?: string;
  color_vc_background_tonal_info?: string;

  color_vc_border_solid_primary?: string;
  color_vc_border_solid_secondary?: string;
  color_vc_border_solid_accent?: string;
  color_vc_border_solid_neutral?: string;
  color_vc_border_solid_warning?: string;
  color_vc_border_solid_danger?: string;
  color_vc_border_solid_success?: string;
  color_vc_border_solid_info?: string;

  color_vc_border_soft_primary?: string;
  color_vc_border_soft_secondary?: string;
  color_vc_border_soft_accent?: string;
  color_vc_border_soft_neutral?: string;
  color_vc_border_soft_warning?: string;
  color_vc_border_soft_danger?: string;
  color_vc_border_soft_success?: string;
  color_vc_border_soft_info?: string;

  color_vc_border_outline_primary?: string;
  color_vc_border_outline_secondary?: string;
  color_vc_border_outline_accent?: string;
  color_vc_border_outline_neutral?: string;
  color_vc_border_outline_warning?: string;
  color_vc_border_outline_danger?: string;
  color_vc_border_outline_success?: string;
  color_vc_border_outline_info?: string;

  color_vc_border_surface_primary?: string;
  color_vc_border_surface_secondary?: string;
  color_vc_border_surface_accent?: string;
  color_vc_border_surface_neutral?: string;
  color_vc_border_surface_warning?: string;
  color_vc_border_surface_danger?: string;
  color_vc_border_surface_success?: string;
  color_vc_border_surface_info?: string;

  color_vc_border_ghost_primary?: string;
  color_vc_border_ghost_secondary?: string;
  color_vc_border_ghost_accent?: string;
  color_vc_border_ghost_neutral?: string;
  color_vc_border_ghost_warning?: string;
  color_vc_border_ghost_danger?: string;
  color_vc_border_ghost_success?: string;
  color_vc_border_ghost_info?: string;

  color_vc_border_tonal_primary?: string;
  color_vc_border_tonal_secondary?: string;
  color_vc_border_tonal_accent?: string;
  color_vc_border_tonal_neutral?: string;
  color_vc_border_tonal_warning?: string;
  color_vc_border_tonal_danger?: string;
  color_vc_border_tonal_success?: string;
  color_vc_border_tonal_info?: string;

  color_vc_icon_solid_primary?: string;
  color_vc_icon_solid_secondary?: string;
  color_vc_icon_solid_accent?: string;
  color_vc_icon_solid_neutral?: string;
  color_vc_icon_solid_warning?: string;
  color_vc_icon_solid_danger?: string;
  color_vc_icon_solid_success?: string;
  color_vc_icon_solid_info?: string;

  color_vc_icon_soft_primary?: string;
  color_vc_icon_soft_secondary?: string;
  color_vc_icon_soft_accent?: string;
  color_vc_icon_soft_neutral?: string;
  color_vc_icon_soft_warning?: string;
  color_vc_icon_soft_danger?: string;
  color_vc_icon_soft_success?: string;
  color_vc_icon_soft_info?: string;

  color_vc_icon_outline_primary?: string;
  color_vc_icon_outline_secondary?: string;
  color_vc_icon_outline_accent?: string;
  color_vc_icon_outline_neutral?: string;
  color_vc_icon_outline_warning?: string;
  color_vc_icon_outline_danger?: string;
  color_vc_icon_outline_success?: string;
  color_vc_icon_outline_info?: string;

  color_vc_icon_surface_primary?: string;
  color_vc_icon_surface_secondary?: string;
  color_vc_icon_surface_accent?: string;
  color_vc_icon_surface_neutral?: string;
  color_vc_icon_surface_warning?: string;
  color_vc_icon_surface_danger?: string;
  color_vc_icon_surface_success?: string;
  color_vc_icon_surface_info?: string;

  color_vc_icon_ghost_primary?: string;
  color_vc_icon_ghost_secondary?: string;
  color_vc_icon_ghost_accent?: string;
  color_vc_icon_ghost_neutral?: string;
  color_vc_icon_ghost_warning?: string;
  color_vc_icon_ghost_danger?: string;
  color_vc_icon_ghost_success?: string;
  color_vc_icon_ghost_info?: string;

  color_vc_icon_tonal_primary?: string;
  color_vc_icon_tonal_secondary?: string;
  color_vc_icon_tonal_accent?: string;
  color_vc_icon_tonal_neutral?: string;
  color_vc_icon_tonal_warning?: string;
  color_vc_icon_tonal_danger?: string;
  color_vc_icon_tonal_success?: string;
  color_vc_icon_tonal_info?: string;

  color_vc_text_solid_primary?: string;
  color_vc_text_solid_secondary?: string;
  color_vc_text_solid_accent?: string;
  color_vc_text_solid_neutral?: string;
  color_vc_text_solid_warning?: string;
  color_vc_text_solid_danger?: string;
  color_vc_text_solid_success?: string;
  color_vc_text_solid_info?: string;

  color_vc_text_soft_primary?: string;
  color_vc_text_soft_secondary?: string;
  color_vc_text_soft_accent?: string;
  color_vc_text_soft_neutral?: string;
  color_vc_text_soft_warning?: string;
  color_vc_text_soft_danger?: string;
  color_vc_text_soft_success?: string;
  color_vc_text_soft_info?: string;

  color_vc_text_outline_primary?: string;
  color_vc_text_outline_secondary?: string;
  color_vc_text_outline_accent?: string;
  color_vc_text_outline_neutral?: string;
  color_vc_text_outline_warning?: string;
  color_vc_text_outline_danger?: string;
  color_vc_text_outline_success?: string;
  color_vc_text_outline_info?: string;

  color_vc_text_surface_primary?: string;
  color_vc_text_surface_secondary?: string;
  color_vc_text_surface_accent?: string;
  color_vc_text_surface_neutral?: string;
  color_vc_text_surface_warning?: string;
  color_vc_text_surface_danger?: string;
  color_vc_text_surface_success?: string;
  color_vc_text_surface_info?: string;

  color_vc_text_ghost_primary?: string;
  color_vc_text_ghost_secondary?: string;
  color_vc_text_ghost_accent?: string;
  color_vc_text_ghost_neutral?: string;
  color_vc_text_ghost_warning?: string;
  color_vc_text_ghost_danger?: string;
  color_vc_text_ghost_success?: string;
  color_vc_text_ghost_info?: string;

  color_vc_text_tonal_primary?: string;
  color_vc_text_tonal_secondary?: string;
  color_vc_text_tonal_accent?: string;
  color_vc_text_tonal_neutral?: string;
  color_vc_text_tonal_warning?: string;
  color_vc_text_tonal_danger?: string;
  color_vc_text_tonal_success?: string;
  color_vc_text_tonal_info?: string;

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
  cart_page_browser_target?: BrowserTargetType;
  product_page_browser_target?: BrowserTargetType;
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
  product_filters_sorting_direction?: SortDirectionType;
  product_quantity_control?: "stepper" | "button";
  range_filter_type?: "slider" | "default";
  out_of_stock_order_enabled?: boolean;
  search_suggestions_category_enabled?: boolean;
  search_suggestions_category_limit?: number;
  search_suggestions_product_limit?: number;
  sticky_header_enabled?: boolean;
  store_selector_enabled?: boolean;
  top_header_menu_link_list?: string;
  header_menu_link_list?: string;
  desktop_menu_mode?: DesktopMenuModeType;
  icon_variant?: "solid" | "outline";
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
  catalog_pagination_mode?: CatalogPaginationModeType;
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
  quote_statuses?: IQuoteStatus[];
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

  graphql_operation_marking_enabled?: boolean;
}

export interface IThemeConfig {
  current: string;
  settings: IThemeConfigSettings;
}

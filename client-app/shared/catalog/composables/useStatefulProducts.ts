import { useProducts } from "./useProducts";
import type { FiltersDisplayOrderType } from "../types";
import type { Ref } from "vue";

/**
 * A wrapper around useProducts that provides the same functionality.
 * This composable will be extended with additional features in the future.
 */
export function useStatefulProducts(
  options: {
    /** @default false */
    withFacets?: boolean;
    /** @default config.image_carousel_in_product_card_enabled */
    withImages?: boolean;
    /** @default config.zero_price_product_enabled */
    withZeroPrice?: boolean;
    filtersDisplayOrder?: Ref<FiltersDisplayOrderType | undefined>;
    useQueryParams?: boolean;
  } = {},
) {
  // For now, this is just a transparent wrapper around useProducts
  return useProducts(options);
}

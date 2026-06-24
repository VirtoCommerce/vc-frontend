import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { PRODUCT_SORTING_LIST } from "@/core/constants";
import type { ProductSortingType } from "@/core/api/graphql/types";
import type { WritableComputedRef } from "vue";

export interface IProductSortingOption {
  id: string;
  name: string;
}

// Module-level singleton, populated from the products search response (sortings field).
const productSortings = ref<ProductSortingType[]>([]);

export function setProductSortings(definitions?: ProductSortingType[] | null): void {
  productSortings.value = definitions ? [...definitions] : [];
}

export function useProductSortings() {
  const { t } = useI18n();

  /**
   * Storefront sort dropdown options. Uses the backend-driven definitions when available; otherwise falls back to the
   * translated hardcoded list (older backend that doesn't return sortings, or before the first fetch).
   */
  const sortList = computed<IProductSortingOption[]>(() => {
    if (productSortings.value.length) {
      return productSortings.value.map((definition) => ({
        // The default ordering maps to "" so it stays the ?sort-free URL and an empty sort tells the backend to
        // apply the store default (the backend resolves "" -> the default ordering deterministically).
        id: definition.isDefault ? "" : definition.id,
        name: definition.name ?? definition.id,
      }));
    }

    return PRODUCT_SORTING_LIST.map((item) => ({ id: item.id, name: t(item.name) }));
  });

  return {
    sortList,
    productSortings: computed(() => productSortings.value),
  };
}

/**
 * Two-way binding for the sort control that tolerates an unknown or now-hidden `?sort` code: when the current value
 * matches no visible option, the control presents the default ("") instead of rendering blank. Writes flow straight
 * through to the route param (which drops `?sort` for the default).
 */
export function useSelectedSortOption(sortQueryParam: WritableComputedRef<string>) {
  const { sortList } = useProductSortings();

  return computed<string>({
    get: () => (sortList.value.some((option) => option.id === sortQueryParam.value) ? sortQueryParam.value : ""),
    set: (value) => {
      sortQueryParam.value = value;
    },
  });
}

import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { PRODUCT_SORTING_LIST } from "@/core/constants";
import type { SortDefinitionType } from "@/core/api/graphql/types";

export interface IProductSortingOption {
  id: string;
  name: string;
}

// Module-level singleton, populated from the products search response (sort_definitions field).
const sortDefinitions = ref<SortDefinitionType[]>([]);

export function setProductSortDefinitions(definitions?: SortDefinitionType[] | null): void {
  sortDefinitions.value = definitions ? [...definitions] : [];
}

export function useProductSortDefinitions() {
  const { t } = useI18n();

  /**
   * Storefront sort dropdown options. Uses the backend-driven definitions when available; otherwise falls back to the
   * translated hardcoded list (older backend that doesn't return sort_definitions, or before the first fetch).
   */
  const sortList = computed<IProductSortingOption[]>(() => {
    if (sortDefinitions.value.length) {
      return sortDefinitions.value.map((definition) => ({
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
    sortDefinitions: computed(() => sortDefinitions.value),
  };
}

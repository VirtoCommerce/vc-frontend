import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import { PRODUCT_SORTING_LIST } from "@/core/constants";
import type { SortDefinitionType } from "@/core/api/graphql/types";
import type { WritableComputedRef } from "vue";

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

/**
 * Two-way binding for the sort control that tolerates an unknown or now-hidden `?sort` code: when the current value
 * matches no visible option, the control presents the default ("") instead of rendering blank. Writes flow straight
 * through to the route param (which drops `?sort` for the default).
 */
export function useSelectedSortOption(sortQueryParam: WritableComputedRef<string>) {
  const { sortList } = useProductSortDefinitions();

  return computed<string>({
    get: () => (sortList.value.some((option) => option.id === sortQueryParam.value) ? sortQueryParam.value : ""),
    set: (value) => {
      sortQueryParam.value = value;
    },
  });
}

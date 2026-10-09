import { computed, toValue } from "vue";
import { useI18n } from "vue-i18n";
import { PRODUCT_SORTING_LIST } from "@/core/constants";
import type { ProductSortingType } from "@/core/api/graphql/types";
import type { MaybeRefOrGetter, WritableComputedRef } from "vue";

export interface IProductSortingOption {
  id: string;
  name: string;
}

/**
 * Builds the storefront "Sort by" dropdown from the sortings the products search returned for the current store.
 * The sortings are owned per-`useProducts` instance and passed in (no module-level state), so different product
 * grids on the same page never clobber each other's options.
 *
 * @param sortings  The `sortings` field from the products search response (the owning `useProducts` instance).
 * @param sortQueryParam  The `?sort` route param to write the user's choice into.
 */
export function useProductSortings(
  sortings: MaybeRefOrGetter<ProductSortingType[]>,
  sortQueryParam: WritableComputedRef<string>,
) {
  const { t } = useI18n();

  /**
   * Dropdown options. Uses the backend-driven sortings when available; otherwise falls back to the translated
   * hardcoded list (before the first fetch; an old backend that lacks the field errors the query outright).
   */
  const sortList = computed<IProductSortingOption[]>(() => {
    const definitions = toValue(sortings);

    if (definitions.length) {
      return definitions.map((definition) => ({
        // The default option maps to "" so it stays the ?sort-free URL and an empty sort tells the backend to
        // apply the store default (the backend resolves "" -> the default option deterministically).
        id: definition.isDefault ? "" : definition.id,
        name: definition.name ?? definition.id,
      }));
    }

    return PRODUCT_SORTING_LIST.map((item) => ({ id: item.id, name: t(item.name) }));
  });

  /**
   * Two-way binding for the sort control. The displayed value follows the backend's `selected` flag (the option the
   * server actually applied to the current result), so the control shows a selection only once the backend has
   * confirmed it. Until the first response arrives — or when the applied sort is a hidden/unknown code or a raw
   * expression that maps to no visible option — nothing is `selected`, so the control renders empty (VcSelect shows
   * its placeholder for a value that matches no item) instead of guessing the store default. Writes flow straight
   * through to the route param (which drops `?sort` for the default).
   */
  const selectedSort = computed<string | undefined>({
    get: () => {
      const definitions = toValue(sortings);

      // No backend response yet (initial load) or no visible options → show nothing, don't guess the default.
      if (!definitions.length) {
        return undefined;
      }

      // Backend is authoritative about which option was actually applied. Nothing selected (hidden/unknown/raw
      // sort) → undefined → empty control.
      const selected = definitions.find((definition) => definition.selected);
      if (!selected) {
        return undefined;
      }

      // The default option maps to "" to match the sortList id mapping.
      return selected.isDefault ? "" : selected.id;
    },
    set: (value) => {
      sortQueryParam.value = value ?? "";
    },
  });

  return { sortList, selectedSort };
}

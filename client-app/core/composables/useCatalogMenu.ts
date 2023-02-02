import { computed, shallowRef } from "vue";
import { sortBy } from "lodash";
import { categoryToMenuLink, MenuLink, useCategories } from "@/core";

const { childCategories, fetchChildCategories } = useCategories();

const catalogMenuItems = shallowRef<MenuLink[]>([]);

export default function useCatalogMenu() {
  async function fetchCatalogMenuItems(options?: { maxLevel?: number; onlyActive?: boolean }): Promise<void> {
    await fetchChildCategories({
      maxLevel: options?.maxLevel || 2,
      onlyActive: options?.onlyActive,
    });

    catalogMenuItems.value = childCategories.value.map(categoryToMenuLink);
  }

  return {
    catalogMenuItems: computed(() => sortBy(catalogMenuItems.value, (item: MenuLink) => item.title)),
    fetchCatalogMenuItems,
  };
}

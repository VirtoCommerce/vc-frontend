import { computed, shallowRef } from "vue";
import { sortBy } from "lodash";
import { categoryToMenuLink, MenuLink, useCategories } from "@/core";
import { QueryChildCategoriesArgs } from "@/xapi";

const { childCategories, fetchChildCategories } = useCategories();

const catalogMenuItems = shallowRef<MenuLink[]>([]);

export default function useCatalogMenu() {
  async function fetchCatalogMenuItems(payload: QueryChildCategoriesArgs): Promise<void> {
    await fetchChildCategories(payload);

    catalogMenuItems.value = childCategories.value.map(categoryToMenuLink);
  }

  return {
    catalogMenuItems: computed(() => sortBy(catalogMenuItems.value, (item: MenuLink) => item.title)),
    fetchCatalogMenuItems,
  };
}

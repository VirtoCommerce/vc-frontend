import { computed, readonly, ref, shallowRef } from "vue";
import { Logger } from "@/core";
import { getChildCategories, QueryChildCategoriesArgs, Category } from "@/xapi";

const loading = ref(true);
const catalogMenuItems = shallowRef<Category[]>([]);

export default function useCatalogMenu() {
  async function fetchCatalogMenuItems(payload: QueryChildCategoriesArgs): Promise<void> {
    loading.value = true;

    try {
      catalogMenuItems.value = await getChildCategories(payload);
    } catch (e) {
      Logger.error(`${useCatalogMenu.name}.${fetchCatalogMenuItems.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading: readonly(loading),
    catalogMenuItems: computed(() => catalogMenuItems.value),
    fetchCatalogMenuItems,
  };
}

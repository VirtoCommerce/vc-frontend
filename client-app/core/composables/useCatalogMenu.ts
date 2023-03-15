import { computed, readonly, ref, shallowRef } from "vue";
import { getChildCategories } from "@/xapi";
import { Logger } from "../utilities";
import type { QueryChildCategoriesArgs, Category } from "@/xapi/types";

const loading = ref(true);
const catalogMenuItems = shallowRef<Category[]>([]);

export function useCatalogMenu() {
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

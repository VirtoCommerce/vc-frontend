import { computed, readonly, ref, shallowRef } from "vue";
import { Category, childCategories, ChildCategoriesQueryResponseType } from "@/xapi";
import { Logger } from "@/core";

const loading = ref(true);
const catalogMenu = shallowRef<ChildCategoriesQueryResponseType>();

export default function useCatalogMenu() {
  async function fetchCatalogMenu(maxLevel: number, onlyActive: boolean, categoryId?: string): Promise<void> {
    loading.value = true;

    try {
      catalogMenu.value = await childCategories(maxLevel, onlyActive, categoryId);
    } catch (e) {
      Logger.error(`${useCatalogMenu.name}.${fetchCatalogMenu.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading: readonly(loading),
    catalogMenu: computed(() => catalogMenu.value),
    fetchCatalogMenu,
  };
}

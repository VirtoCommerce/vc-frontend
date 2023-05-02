import { computed, inject, readonly, ref, shallowRef } from "vue";
import { configInjectionKey } from "@/core/injection-keys";
import { getChildCategories, getMenu } from "@/xapi";
import { categoryToMenuLink, Logger } from "../utilities";
import type { MenuLinkType } from "@/xapi/types";

const loading = ref(false);
const catalogMenuItems = shallowRef<MenuLinkType[]>([]);

export function useCatalogMenu() {
  const config = inject(configInjectionKey, {});

  async function fetchCatalogMenu(): Promise<void> {
    loading.value = true;

    try {
      catalogMenuItems.value = config.catalog_menu_link_list_name
        ? await getMenu(config.catalog_menu_link_list_name)
        : (
            await getChildCategories({
              maxLevel: 2,
              onlyActive: true,
            })
          ).map((item) => categoryToMenuLink(item));
    } catch (e) {
      Logger.error(`${useCatalogMenu.name}.${fetchCatalogMenu.name}`, e);
    } finally {
      loading.value = false;
    }
  }

  return {
    fetchCatalogMenu,
    loading: readonly(loading),
    catalogMenuItems: computed(() => catalogMenuItems.value),
  };
}

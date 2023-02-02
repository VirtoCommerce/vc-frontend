import { computed, readonly, ref } from "vue";
import { Category, getCategory, getChildCategories, QueryChildCategoriesArgs } from "@/xapi";
import { Logger } from "@/core";
import globals from "@/core/globals";

export default function useCategories() {
  const loading = ref(false);

  const childCategories = ref<Category[]>([]);
  const category = ref<Category>();

  function getCatalogHomeCategory(): Category {
    const catalogCode: string = globals.router.resolve({ name: "Catalog" }).fullPath.slice(1);

    return {
      id: globals.catalogId,
      code: catalogCode,
      name: globals.i18n.global.t("pages.catalog.title"),
      slug: catalogCode,
      seoInfo: {
        pageTitle: globals.i18n.global.t("pages.catalog.meta.title"),
        metaKeywords: globals.i18n.global.t("pages.catalog.meta.keywords"),
        metaDescription: globals.i18n.global.t("pages.catalog.meta.description"),
      },
    };
  }

  async function fetchChildCategories(payload: QueryChildCategoriesArgs): Promise<void> {
    loading.value = true;

    try {
      childCategories.value = await getChildCategories(payload);
    } catch (e) {
      Logger.error(`${useCategories.name}.${fetchChildCategories.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  async function fetchCategory(payload: QueryChildCategoriesArgs): Promise<void> {
    loading.value = true;

    try {
      category.value = getCatalogHomeCategory();

      if (payload.categoryId) {
        category.value = await getCategory(payload.categoryId);
        if (category.value && !category.value.parent) {
          category.value.parent = getCatalogHomeCategory();
        }
      }

      if (payload.maxLevel && payload.maxLevel > 0) {
        await fetchChildCategories({
          categoryId: category.value!.id !== globals.catalogId ? category.value!.id : undefined,
          maxLevel: payload.maxLevel,
          onlyActive: payload.onlyActive,
        });
        category.value!.childCategories = childCategories.value;
      }
    } catch (e) {
      Logger.error(`${useCategories.name}.${fetchCategory.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    loading: readonly(loading),
    childCategories: computed(() => childCategories.value),
    category: computed(() => category.value),
    fetchChildCategories,
    fetchCategory,
  };
}

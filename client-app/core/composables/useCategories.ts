import { computed, readonly, ref } from "vue";
import { Category, getCategory, getChildCategories, QueryChildCategoriesArgs } from "@/xapi";
import { Logger } from "@/core";

export default function useCategories() {
  const loading = ref(false);

  const childCategories = ref<Category[]>([]);
  const category = ref<Category>();

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
      category.value = await getCategory(payload);
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

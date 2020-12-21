import { Ref, ref } from '@vue/composition-api';
import { searchCategories } from '@core/api/graphql/catalog';
import { Category } from '@core/api/graphql/types'
import { Logger } from '@core/utilities';

export default () => {
  const categories: Ref<Category[]> = ref([]);
  const total: Ref<number> = ref(0);
  const loading: Ref<boolean> = ref(true);

  async function fetchCategories(itemsPerPage: number, page: number) {
    loading.value = true;
    try {
      const catConnection = await searchCategories(itemsPerPage, page);
      categories.value  = catConnection?.items as Category[];
      total.value = catConnection.totalCount ?? 0;
    } catch (e) {
      Logger.error('useCategories.fetchProducts', e);
      throw e;
    } finally {
      loading.value = false;
    }

  }
  return { fetchCategories, categories,  total, loading };
}

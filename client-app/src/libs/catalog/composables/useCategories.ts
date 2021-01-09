import { computed, Ref, ref } from '@vue/composition-api';
import { searchCategories } from '@core/api/graphql/catalog';
import { Category } from '@core/api/graphql/types'
import { Logger } from '@core/utilities';
import { CategoryTree } from '../types';

const itemToTree = (category: Category, isCurrent: boolean): CategoryTree => {
  return {
    id: category.id,
    parent: category.parent?.id ?? '',
    label: category.name ?? '',
    slug: category.slug ?? '',
    items: [],
    isCurrent
  };
};

const buildCategoryTree = (parent: CategoryTree, allCats: Category[], activeCatId: string): CategoryTree => {
  //TODO: replace to loop instead of recursion
  parent.items = allCats
    .filter(c => c.id != parent.id && c.parent?.id === parent.id)
    // .sort((a, b) => (a.outline ?? "").localeCompare(b.outline ?? ""))
    .map(c => {
      return buildCategoryTree(itemToTree(c, activeCatId === c.id), allCats, activeCatId);
    } );

  return parent;
};
const categoryTree: Ref<CategoryTree> = ref({});
const loading: Ref<boolean> = ref(true);

export default () => {

  async function loadCategoriesTree(activeCatId: string) {
    loading.value = true;
    try {
      const catConnection = await searchCategories(100, 1);
      categoryTree.value  = buildCategoryTree({}, catConnection.items as Category[], activeCatId);
    } catch (e) {
      Logger.error('useCategories.fetchProducts', e);
      throw e;
    } finally {
      loading.value = false;
    }

  }
  return {
    loadCategoriesTree,
    categoryTree : computed(() => categoryTree.value ),
    loading: computed(() => loading.value ) };
}


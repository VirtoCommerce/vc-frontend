import { computed, ref } from "vue";
import { Category } from "@/xapi";
import { categoryToMenuLink, MenuLink } from "@/core";

const displayedCategory = ref<MenuLink>();
const parentCategory = ref<MenuLink>();
const subcategories = ref<MenuLink[]>([]);

export default function useCategorySelector() {
  function initCategorySelector(category?: Category): void {
    if (category) {
      displayedCategory.value = categoryToMenuLink(category);

      subcategories.value = (category.childCategories || []).map((item: Category) => categoryToMenuLink(item));

      if (category.parent) {
        parentCategory.value = categoryToMenuLink(category.parent);
      }
    }
  }

  return {
    displayedCategory: computed(() => displayedCategory.value),
    parentCategory: computed(() => parentCategory.value),
    subcategories: computed(() => subcategories.value),
    initCategorySelector,
  };
}

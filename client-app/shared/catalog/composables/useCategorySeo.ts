import { useSeoMeta } from "@unhead/vue";
import { computed } from "vue";
import { usePageHead } from "@/core/composables";
import { useCategory } from "@/shared/catalog/composables/useCategory";

export function useCategorySeo() {
  const { category: currentCategory } = useCategory();
  const seoTitle = computed(() => currentCategory.value?.seoInfo?.pageTitle || currentCategory.value?.name);
  const seoDescription = computed(() => currentCategory.value?.seoInfo?.metaDescription);
  const seoKeywords = computed(() => currentCategory.value?.seoInfo?.metaKeywords);
  const seoImageUrl = computed(() => currentCategory.value?.images?.[0]?.url);

  usePageHead({
    title: seoTitle,
    meta: {
      keywords: seoKeywords,
      description: seoDescription,
    },
  });

  useSeoMeta({
    ogTitle: seoTitle,
    ogDescription: seoDescription,
    ogImage: seoImageUrl,
  });
}

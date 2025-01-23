import { useSeoMeta } from "@unhead/vue";
import { computed, watchEffect } from "vue";
import { usePageHead } from "@/core/composables";
import { globals } from "@/core/globals";
import { useCategory } from "@/shared/catalog/composables/useCategory";
import type { Ref } from "vue";

type PropsType = {
  allowSetMeta: Ref<boolean>;
  categoryComponentAnchorIsVisible: Ref<boolean>;
};

const { i18n } = globals;

export function useCategorySeo({ allowSetMeta, categoryComponentAnchorIsVisible }: PropsType) {
  const { category: currentCategory, loading: categoryLoading } = useCategory();

  const seoTitle = computed(
    () =>
      currentCategory.value?.seoInfo?.pageTitle ??
      currentCategory.value?.name ??
      (categoryLoading.value ? "" : i18n.global.t("pages.catalog.title")),
  );
  const seoDescription = computed(() => currentCategory.value?.seoInfo?.metaDescription);
  const seoKeywords = computed(() => currentCategory.value?.seoInfo?.metaKeywords);
  const seoImageUrl = computed(() => currentCategory.value?.images?.[0]?.url);

  watchEffect(() => {
    if (allowSetMeta.value && categoryComponentAnchorIsVisible.value) {
      usePageHead({
        title: seoTitle,
        meta: {
          keywords: seoKeywords,
          description: seoDescription,
        },
      });

      const seoUrl = currentCategory.value?.seoInfo?.semanticUrl
        ? `${window.location.host}\${currentCategory.value?.seoInfo?.semanticUrl`
        : window.location.toString();

      useSeoMeta({
        ogUrl: seoUrl,
        ogTitle: seoTitle,
        ogDescription: seoDescription,
        ogImage: seoImageUrl,
        ogType: "website",
      });
    }
  });
}

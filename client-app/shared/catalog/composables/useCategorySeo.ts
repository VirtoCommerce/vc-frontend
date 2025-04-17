import { useSeoMeta } from "@unhead/vue";
import { computed, watchEffect } from "vue";
import { usePageTitle } from "@/core/composables/usePageTitle";
import { globals } from "@/core/globals";
import type { Category } from "@/core/api/graphql/types";
import type { Ref } from "vue";

type PropsType = {
  category: Ref<Category | undefined>;
  allowSetMeta: Ref<boolean>;
  categoryComponentAnchorIsVisible: Ref<boolean>;
};

const { i18n } = globals;

export function useCategorySeo({ category, allowSetMeta, categoryComponentAnchorIsVisible }: PropsType) {
  const seoTitle = computed(
    () =>
      category.value?.seoInfo?.pageTitle ??
      category.value?.name ??
      (category.value ? "" : i18n.global.t("pages.catalog.title")),
  );
  const seoDescription = computed(() => category.value?.seoInfo?.metaDescription);
  const seoKeywords = computed(() => category.value?.seoInfo?.metaKeywords);
  const seoImageUrl = computed(() => category.value?.images?.[0]?.url);
  const { title: pageTitle } = usePageTitle(seoTitle);
  const seoMeta = useSeoMeta({});

  watchEffect(() => {
    if (allowSetMeta.value && categoryComponentAnchorIsVisible.value && seoMeta) {
      const seoUrl = category.value?.seoInfo?.semanticUrl
        ? `${window.location.host}\${currentCategory.value?.seoInfo?.semanticUrl`
        : window.location.toString();

      seoMeta.patch({
        title: pageTitle.value,
        keywords: seoKeywords.value,
        description: seoDescription.value,
        ogUrl: seoUrl,
        ogTitle: pageTitle.value,
        ogDescription: seoDescription.value,
        ogImage: seoImageUrl.value,
        ogType: "website",
      });
    }
  });
}

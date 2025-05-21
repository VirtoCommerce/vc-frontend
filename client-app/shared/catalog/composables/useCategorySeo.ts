import { useSeoMeta } from "@unhead/vue";
import { computed } from "vue";
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
  const seoUrl = computed(() =>
    category.value?.seoInfo?.semanticUrl
      ? `${window.location.host}\${currentCategory.value?.seoInfo?.semanticUrl`
      : window.location.toString(),
  );
  const canSetMeta = computed(() => allowSetMeta.value && categoryComponentAnchorIsVisible.value);

  const { title: pageTitle } = usePageTitle(seoTitle);

  useSeoMeta({
    title: () => (canSetMeta.value ? pageTitle.value : undefined),
    keywords: () => (canSetMeta.value ? seoKeywords.value : undefined),
    description: () => (canSetMeta.value ? seoDescription.value : undefined),
    ogUrl: () => (canSetMeta.value ? seoUrl.value : undefined),
    ogTitle: () => (canSetMeta.value ? pageTitle.value : undefined),
    ogDescription: () => (canSetMeta.value ? seoDescription.value : undefined),
    ogImage: () => (canSetMeta.value ? seoImageUrl.value : undefined),
    ogType: () => (canSetMeta.value ? "website" : undefined),
  });
}

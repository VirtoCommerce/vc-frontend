import { computed, watchEffect } from "vue";
import { usePageHead } from "@/core/composables";
import { globals } from "@/core/globals";
import { getHeadInstance, setSeoMeta } from "@/core/utilities/head";
import type { Category } from "@/core/api/graphql/types";
import type { Ref } from "vue";

type PropsType = {
  category: Ref<Category | undefined>;
  allowSetMeta: Ref<boolean>;
  categoryComponentAnchorIsVisible: Ref<boolean>;
};

const { i18n } = globals;
const head = getHeadInstance();

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

  watchEffect(() => {
    if (allowSetMeta.value && categoryComponentAnchorIsVisible.value) {
      usePageHead(
        {
          title: seoTitle,
          meta: {
            keywords: seoKeywords,
            description: seoDescription,
          },
        },
        head,
      );

      const seoUrl = category.value?.seoInfo?.semanticUrl
        ? `${window.location.host}\${currentCategory.value?.seoInfo?.semanticUrl`
        : window.location.toString();

      setSeoMeta({
        ogUrl: seoUrl,
        ogTitle: seoTitle,
        ogDescription: seoDescription,
        ogImage: seoImageUrl,
        ogType: "website",
      });
    }
  });
}

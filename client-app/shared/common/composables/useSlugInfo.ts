import { computed, toValue } from "vue";
import { useGetPage, useGetSlugInfo } from "@/core/api/graphql";
import { globals } from "@/core/globals";
import type { PageTemplate } from "@/shared/static-content";
import type { MaybeRefOrGetter } from "vue";

const RESERVED_URLS = ["__index__home__page__"];

/**
 * @param seoUrl path after domain without slash at the beginning
 * @param isReserved shows whether seoUrl is included in the reserved urls
 * It's needed for the Theme to show a 404 page if a user tries to open, for example, /index__home__page.
 */
export function useSlugInfo(seoUrl: MaybeRefOrGetter<string>, isReserved?: boolean) {
  const { storeId, userId, cultureName } = globals;
  const variables = computed(() => {
    return {
      storeId,
      userId,
      cultureName,
      slug: toValue(seoUrl),
    };
  });

  const { result, loading: slugLoading } = useGetSlugInfo(variables);

  const slugInfo = computed(() => {
    if (!isReserved && RESERVED_URLS.includes(toValue(seoUrl))) {
      return null;
    }

    return result.value?.slugInfo;
  });

  const hasContent = computed(() => {
    return slugInfo.value?.entityInfo?.objectType === "ContentFile";
  });

  const getPageParams = computed(() => {
    return { id: slugInfo?.value?.entityInfo?.objectId || "", cultureName, storeId };
  });

  const { load: fetchContent, result: contentResult, loading: contentLoading } = useGetPage(getPageParams);

  const pageContent = computed(() => {
    let content: unknown;

    if (typeof contentResult?.value?.page?.content === "string") {
      content = JSON.parse(contentResult.value.page.content);
    }

    if (isPageContent(content)) {
      return content;
    }

    return null;
  });

  function isPageContent(data: unknown): data is PageTemplate {
    return Array.isArray((data as PageTemplate)?.content) && typeof (data as PageTemplate)?.settings === "object";
  }

  return {
    loading: computed(() => {
      return slugLoading.value || contentLoading.value;
    }),
    slugInfo,
    hasContent,
    pageContent,
    fetchContent,
  };
}

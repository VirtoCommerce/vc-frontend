import { computed, toValue } from "vue";
import { useGetPage, useGetSlugInfo } from "@/core/api/graphql";
import { globals } from "@/core/globals";
import type { PageTemplate } from "@/shared/static-content";
import type { MaybeRefOrGetter } from "vue";

/**
 * @param seoUrl path after domain without slash at the beginning
 **/
export function useSlugInfo(seoUrl: MaybeRefOrGetter<string>) {
  const { storeId, userId, cultureName } = globals;
  const variables = computed(() => {
    return {
      storeId,
      userId,
      cultureName,
      slug: toValue(seoUrl),
    };
  });

  const { result, loading: slugLoading, error: slugError } = useGetSlugInfo(variables);

  const slugInfo = computed(() => {
    if (slugError.value) {
      return null;
    }
    return result.value?.slugInfo;
  });

  const objectType = computed(() => {
    return slugInfo.value?.entityInfo?.objectType;
  });

  const hasContent = computed(() => {
    return objectType.value === "ContentFile";
  });

  const getPageParams = computed(() => {
    return { id: slugInfo?.value?.entityInfo?.objectId || "?", cultureName, storeId };
  });

  const {
    load: loadContent,
    result: contentResult,
    loading: contentLoading,
    error: contentError,
  } = useGetPage(getPageParams);

  const pageContent = computed(() => {
    if (contentError.value) {
      return null;
    }

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
    objectType,
    hasContent,
    pageContent,
    fetchContent: loadContent,
  };
}

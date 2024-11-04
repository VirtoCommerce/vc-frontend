import { computed, readonly, toValue } from "vue";
import { useGetPage, useGetPageDocument, useGetSlugInfo } from "@/core/api/graphql";
import { globals } from "@/core/globals";
import type { PageTemplate } from "@/shared/static-content";
import type { MaybeRefOrGetter } from "vue";
import { createGlobalState } from "@vueuse/core";

/**
 * @param seoUrl path after domain without slash at the beginning
 **/
function _useSlugInfo(seoUrl: MaybeRefOrGetter<string>) {
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

  const seoInfo = computed(() => {
    return slugInfo.value
      ? {
          metaKeywords: slugInfo.value?.entityInfo?.metaKeywords,
          metaDescription: slugInfo.value?.entityInfo?.metaDescription,
          pageTitle: slugInfo.value?.entityInfo?.pageTitle,
        }
      : null;
  });

  const hasContent = computed(() => {
    return objectType.value === "ContentFile";
  });

  const hasPageDocumentContent = computed(() => {
    return objectType.value === "Pages";
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

  const {
    load: loadPageDocumentContent,
    result: pageDocumentContentResult,
    loading: pageDocumentContentLoading,
    error: PageDocumentContentError,
  } = useGetPageDocument(getPageParams);

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

  const pageDocumentContent = computed(() => {
    if (PageDocumentContentError.value) {
      return null;
    }

    return pageDocumentContentResult?.value?.pageDocument || null;
  });

  function isPageContent(data: unknown): data is PageTemplate {
    return Array.isArray((data as PageTemplate)?.content) && typeof (data as PageTemplate)?.settings === "object";
  }

  return {
    loading: computed(() => {
      return slugLoading.value || contentLoading.value || pageDocumentContentLoading.value;
    }),
    slugInfo,
    objectType,
    hasContent,
    pageContent,
    seoInfo: readonly(seoInfo),
    fetchContent: loadContent,

    hasPageDocumentContent,
    pageDocumentContent,
    fetchPageDocumentContent: loadPageDocumentContent,
  };
}

export const useSlugInfo = createGlobalState(_useSlugInfo);

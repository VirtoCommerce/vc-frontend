import { useLocalStorage } from "@vueuse/core";
import { computed, nextTick, readonly, toValue, watch } from "vue";
import { useGetPage, useGetPageDocument, useGetSlugInfo } from "@/core/api/graphql";
import { useLanguages } from "@/core/composables/useLanguages";
import { NAVIGATION_OUTLINE } from "@/core/constants";
import { globals } from "@/core/globals";
import { safeDecode } from "@/core/utilities/common";
import type { IPageTemplate } from "@/shared/static-content";
import type { MaybeRefOrGetter } from "vue";

/**
 * @param seoUrl path after domain without slash at the beginning
 **/
export function useSlugInfo(seoUrl: MaybeRefOrGetter<string>) {
  const { previousCultureSlug } = useLanguages();

  const navigationOutlineStorage = useLocalStorage<string>(NAVIGATION_OUTLINE, "");
  const { storeId, userId, cultureName: currentCultureName } = globals;

  const previousCultureSlugDecoded = computed(() => {
    return safeDecode(previousCultureSlug.value?.slug);
  });

  const cultureName = computed(() => {
    return previousCultureSlugDecoded.value === toValue(seoUrl)
      ? previousCultureSlug.value?.cultureName
      : currentCultureName;
  });

  const variables = computed(() => {
    return {
      storeId,
      userId,
      cultureName: cultureName.value,
      permalink: rawSeoUrl.value,
    };
  });

  const { result, loading: slugLoading, error: slugError } = useGetSlugInfo(variables);

  const slugInfo = computed(() => {
    if (slugError.value) {
      return null;
    }
    return result.value?.slugInfo;
  });

  const slugOutline = computed(() => slugInfo.value?.entityInfo?.outline);

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
    return { id: slugInfo?.value?.entityInfo?.objectId || "?", cultureName: currentCultureName, storeId };
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

  function isPageContent(data: unknown): data is IPageTemplate {
    const pageTemplate = data as IPageTemplate;
    return Array.isArray(pageTemplate?.content) && typeof pageTemplate?.settings === "object";
  }

  watch(
    slugOutline,
    async (value) => {
      await nextTick();
      navigationOutlineStorage.value = value ?? "";
    },
    { immediate: true },
  );

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

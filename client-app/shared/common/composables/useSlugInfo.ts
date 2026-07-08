import { useLocalStorage } from "@vueuse/core";
import { computed, nextTick, readonly, toValue, watch } from "vue";
import { useGetPage, useGetPageDocument, useGetSlugInfo } from "@/core/api/graphql";
import { useLanguages } from "@/core/composables/useLanguages";
import { NAVIGATION_OUTLINE } from "@/core/constants";
import { globals } from "@/core/globals";
import { humanizeName, safeDecode } from "@/core/utilities/common";
import type { IPageTemplate } from "@/shared/static-content";
import type { MaybeRefOrGetter } from "vue";

/**
 * Extracts the page file name (without the language segment and extension) from a content file
 * relative URL — e.g. "/blogs/my_post.en-US.page" → "my_post". Mirrors how the admin blade parses
 * the File name: drop the extension, then drop a trailing culture segment when it matches a known
 * culture. Used to derive the storefront breadcrumb / title after a rename (VCST-5274).
 */
function getPageFileName(relativeUrl: string | undefined, cultures: (string | null | undefined)[]): string {
  const parts = relativeUrl?.split("/").filter(Boolean).pop()?.split(".") ?? [];
  if (parts.length > 1) {
    parts.pop(); // extension
  }
  if (
    parts.length > 1 &&
    cultures.some((culture) => culture?.toLowerCase() === parts[parts.length - 1].toLowerCase())
  ) {
    parts.pop(); // language segment
  }
  return parts.join(".");
}

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
    const rawSeoUrl = toValue(seoUrl);
    const permalink = rawSeoUrl === "" ? "/" : rawSeoUrl;
    const resolvedCultureName = cultureName.value || currentCultureName;

    return {
      storeId,
      userId,
      cultureName: resolvedCultureName,
      permalink,
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
      // VCST-5274: `settings.name`/`displayName` are baked into the page document at authoring
      // time and are never rewritten on rename. Everything server-side that derives from them is
      // stale too — `page.name` (GetPage) resolves to the indexed `displayName`, and the SEO name
      // (ContentSeoResolver) is `displayName` as well. The value that actually follows a File-name
      // rename is the page's file path, so derive the breadcrumb / <title> leaf from `relativeUrl`
      // (its file name without extension) instead of the stored name.
      const fileName = getPageFileName(contentResult?.value?.page?.relativeUrl, [
        slugInfo.value?.entityInfo?.languageCode,
        currentCultureName,
      ]);
      if (fileName) {
        content.settings = { ...content.settings, name: humanizeName(fileName) };
      }
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

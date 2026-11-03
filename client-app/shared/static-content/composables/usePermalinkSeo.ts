import { useHead, useSeoMeta } from "@unhead/vue";
import { computed, toValue } from "vue";
import { useBrandProfile } from "@/core/composables/useBrandProfile";
import { useLanguages } from "@/core/composables/useLanguages";
import type { MaybeRefOrGetter } from "vue";

/**
 * The address search engines and link previews get for a content page: the store's host and the page's permalink in
 * the current language, without the query the visitor came with (`utm_*`, the designer's `?ep=`).
 */
export function usePermalinkSeo(permalink: MaybeRefOrGetter<string | undefined>, isActive: MaybeRefOrGetter<boolean>) {
  const { currentLanguage, getLocalizedPath } = useLanguages();
  const { storeUrl } = useBrandProfile();

  const pageUrl = computed(() => {
    const value = toValue(permalink);

    if (!toValue(isActive) || value === undefined || !currentLanguage.value) {
      return undefined;
    }

    return new URL(getLocalizedPath(currentLanguage.value.cultureName, value), new URL(storeUrl.value).origin).href;
  });

  useSeoMeta({ ogUrl: () => pageUrl.value });

  useHead({
    link: () => (pageUrl.value ? [{ rel: "canonical", href: pageUrl.value }] : []),
  });

  return { pageUrl };
}

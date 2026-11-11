import { useHead, useSeoMeta } from "@unhead/vue";
import { computed, toValue } from "vue";
import { useBrandProfile } from "@/core/composables/useBrandProfile";
import { useLanguages } from "@/core/composables/useLanguages";
import type { MaybeRefOrGetter } from "vue";

/** Canonical and `og:url` take the permalink, so the visitor's query (tracking, the designer's endpoint) stays out. */
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

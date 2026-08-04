import { useHead } from "@unhead/vue";
import { useBrandProfile } from "./useBrandProfile";
import { useIsHomePage } from "./useIsHomePage";

const TAGLINE_SEPARATOR = " — ";

/**
 * Emits the store-level Open Graph tags: `og:site_name`, `og:image` and `og:description`
 * site-wide, and the `name — tagline` `og:title` on the homepage, which no page emitter owns
 * when a CMS page wins the previewer chain.
 *
 * All but `og:site_name` are fallbacks by construction. A page's own `useSeoMeta` registers a
 * later unhead entry, and for a same-keyed `og:*` tag the later entry replaces this one.
 *
 * `og:url`/`og:type` stay with the pages — consolidating them is a separate refactor.
 */
export function useStoreSocialMeta() {
  const { storeName, tagline, description, shareImageUrl } = useBrandProfile();
  const isHomePage = useIsHomePage();

  return useHead({
    meta: () => {
      const tags: { property: string; content: string }[] = [];
      const name = storeName.value?.trim();

      if (name) {
        tags.push({ property: "og:site_name", content: name });
      }

      if (description.value) {
        tags.push({ property: "og:description", content: description.value });
      }

      if (shareImageUrl.value) {
        tags.push({ property: "og:image", content: shareImageUrl.value });
      }

      if (isHomePage.value && name && tagline.value) {
        tags.push({ property: "og:title", content: `${name}${TAGLINE_SEPARATOR}${tagline.value}` });
      }

      return tags;
    },
  });
}

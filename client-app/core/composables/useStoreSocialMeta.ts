import { useHead } from "@unhead/vue";
import { useBrandProfile } from "./useBrandProfile";

/**
 * Emits the store-level Open Graph tags that no page owns.
 *
 * `og:site_name` is a property of the store, not of a page, so it belongs here and applies
 * site-wide. The page-level tags (`og:title`, `og:description`, `og:url`, `og:type`) stay
 * with the individual page emitters — see the VCST-5536 spec for why consolidating them is a
 * separate refactor.
 */
export function useStoreSocialMeta() {
  const { storeName } = useBrandProfile();

  return useHead({
    meta: () => {
      const content = storeName.value?.trim();

      return content ? [{ property: "og:site_name", content }] : [];
    },
  });
}

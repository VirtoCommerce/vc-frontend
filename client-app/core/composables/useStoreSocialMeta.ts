import { useHead } from "@unhead/vue";
import { useBrandProfile } from "./useBrandProfile";

/**
 * Emits `og:site_name` site-wide — a store property, not a page one, and previously unowned.
 *
 * `og:title`/`og:description`/`og:url`/`og:type` deliberately stay with the page emitters;
 * consolidating them is a separate refactor (see the VCST-5536 spec).
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

import { useHead } from "@unhead/vue";
import { toValue } from "vue";
import type { MaybeRefOrGetter } from "vue";

/**
 * Emits a `<meta name="keywords">` tag.
 *
 * `@unhead/vue` v3 dropped the (long-deprecated) `keywords` shortcut from
 * `useSeoMeta`, so we set it via `useHead` instead. The tag is rendered only
 * when a non-empty value is provided, mirroring `useSeoMeta`'s behavior of
 * omitting meta whose value is `undefined`.
 */
export function useSeoKeywords(keywords: MaybeRefOrGetter<string | undefined>) {
  return useHead({
    meta: () => {
      const content = toValue(keywords);
      return content ? [{ name: "keywords", content }] : [];
    },
  });
}

import { useSeoMeta } from "@unhead/vue";
import { computed, toValue } from "vue";
import { usePageTitle } from "@/core/composables/usePageTitle";
import { useSeoKeywords } from "@/core/composables/useSeoKeywords";
import { isRecord } from "@/core/utilities";
import type { MaybeRefOrGetter } from "vue";

/**
 * Title, description and keywords of a Page Builder page from its `settings.seoInfo`.
 * The document comes from content storage, so a field that is not a non-empty string is ignored.
 *
 * @param seoInfo - The page's `settings.seoInfo`.
 * @param fallbackTitle - The title when the page has no SEO title of its own, usually the page name.
 * @param isActive - Sets nothing while `false`.
 */
export function usePageSeoInfo(
  seoInfo: MaybeRefOrGetter<unknown>,
  fallbackTitle: MaybeRefOrGetter<string | undefined>,
  isActive: MaybeRefOrGetter<boolean> = true,
): void {
  const fields = computed(() => {
    const value = toValue(seoInfo);
    return isRecord(value) ? value : {};
  });

  const { title } = usePageTitle(computed(() => readText(fields.value.pageTitle) ?? toValue(fallbackTitle)));
  const description = computed(() => readText(fields.value.metaDescription));

  function whenActive<T>(value: T): T | undefined {
    return toValue(isActive) ? value : undefined;
  }

  useSeoMeta({
    title: () => whenActive(title.value),
    description: () => whenActive(description.value),
    ogTitle: () => whenActive(title.value),
    ogDescription: () => whenActive(description.value),
    ogType: () => whenActive("website" as const),
  });

  useSeoKeywords(() => whenActive(readText(fields.value.metaKeywords)));
}

function readText(value: unknown): string | undefined {
  return typeof value === "string" && value ? value : undefined;
}

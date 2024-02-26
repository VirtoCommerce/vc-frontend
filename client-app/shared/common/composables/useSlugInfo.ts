import { computed, toValue } from "vue";
import { useFetch } from "@/core/api/common";
import { useLanguages } from "@/core/composables";
import type { SlugInfoResultType } from "@/shared/common/types";
import type { MaybeRefOrGetter } from "vue";

export function useSlugInfo(seoUrl: MaybeRefOrGetter<string>) {
  const { currentLanguage } = useLanguages();

  const url = computed(() => `/storefrontapi/slug/${toValue(seoUrl)}?culture=${currentLanguage.value.cultureName}`);
  const { data: slugInfo, isFetching: loading } = useFetch(url, { refetch: true }).get().json<SlugInfoResultType>();

  return {
    loading,
    slugInfo,
  };
}

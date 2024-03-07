import { computed, toValue } from "vue";
import { getSlugInfoNew } from "@/core/api/graphql";
import { globals } from "@/core/globals";
import type { MaybeRefOrGetter } from "vue";

export function useSlugInfo(seoUrl: MaybeRefOrGetter<string>) {
  const { storeId, userId, cultureName } = globals;
  const variables = computed(() => {
    return {
      storeId,
      userId,
      cultureName,
      slug: toValue(seoUrl),
    };
  });

  const { result, loading } = getSlugInfoNew(variables);

  const slugInfo = computed(() => {
    return result.value?.slugInfo;
  });

  return {
    loading,
    slugInfo,
  };
}

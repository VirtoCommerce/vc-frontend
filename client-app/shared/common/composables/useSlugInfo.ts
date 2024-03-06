import { computed, toValue, watch } from "vue";
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

  const { result, refetch, loading } = getSlugInfoNew(variables);

  watch(
    () => toValue(seoUrl),
    () => {
      refetch(variables.value);
    },
  );

  const slugInfo = computed(() => {
    return result.value?.slugInfo;
  });

  return {
    loading,
    slugInfo,
  };
}

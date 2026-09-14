import { computed, toValue } from "vue";
import { useGetReturnQuery } from "@/modules/returns/api/graphql/queries/getReturn";
import type { MaybeRefOrGetter } from "vue";

export function useReturn(returnId: MaybeRefOrGetter<string>) {
  const { result, loading, refetch } = useGetReturnQuery(computed(() => ({ id: toValue(returnId) })));

  // Null when the return does not exist or belongs to somebody else — the server deliberately
  // does not distinguish the two, so neither does the page.
  const orderReturn = computed(() => result.value?.return);

  return {
    loading,
    orderReturn,
    refetch,
  };
}

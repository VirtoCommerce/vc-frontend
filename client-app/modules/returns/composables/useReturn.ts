import { computed, toValue } from "vue";
import { useGetReturnQuery } from "@/modules/returns/api/graphql/queries/getReturn";
import type { MaybeRefOrGetter } from "vue";

export function useReturn(returnId: MaybeRefOrGetter<string>) {
  const { result, loading, refetch } = useGetReturnQuery(computed(() => ({ id: toValue(returnId) })));

  const orderReturn = computed(() => result.value?.return);

  return {
    loading,
    orderReturn,
    refetch,
  };
}

import { computed } from "vue";
import { useGetReturnStatusesQuery } from "@/modules/returns/api/graphql/queries/getReturnStatuses";
import type { ReturnStatusOptionType } from "@/modules/returns/types";

export function useReturnStatuses() {
  const { result, loading } = useGetReturnStatusesQuery();

  const statuses = computed<ReturnStatusOptionType[]>(
    () =>
      result.value?.returnStatuses?.items?.map((item) => ({
        code: item.key,
        label: item.value || item.key,
      })) ?? [],
  );

  return {
    loading,
    statuses,
  };
}

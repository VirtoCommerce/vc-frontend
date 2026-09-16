import { computed } from "vue";
import { useGetReturnStatusesQuery } from "@/modules/returns/api/graphql/queries/getReturnStatuses";
import { useReturnStatusLabel } from "@/modules/returns/composables/useReturnStatusLabel";
import type { ReturnStatusOptionType } from "@/modules/returns/types";

export function useReturnStatuses() {
  const { result, loading } = useGetReturnStatusesQuery();
  const { statusLabel } = useReturnStatusLabel();

  const statuses = computed<ReturnStatusOptionType[]>(
    () =>
      result.value?.returnStatuses?.items?.map((item) => ({
        code: item.key,
        label: statusLabel(item.key, item.value),
      })) ?? [],
  );

  return {
    loading,
    statuses,
  };
}

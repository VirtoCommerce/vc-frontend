import { computed } from "vue";
import { useGetReturnStatusesQuery } from "@/modules/returns/api/graphql/queries/getReturnStatuses";
import { useReturnStatusLabel } from "@/modules/returns/composables/useReturnStatusLabel";
import type { ReturnStatusOptionType } from "@/modules/returns/types";

export function useReturnStatuses() {
  const { result, loading } = useGetReturnStatusesQuery();
  const { statusLabel } = useReturnStatusLabel();

  // The dictionary carries both spellings of cancelled, which would read as the same option
  // listed twice. Whichever code survives still matches both rows: the server expands synonyms.
  const statuses = computed<ReturnStatusOptionType[]>(() => {
    const byLabel = new Map<string, ReturnStatusOptionType>();

    for (const item of result.value?.returnStatuses?.items ?? []) {
      const label = statusLabel(item.key, item.value);

      if (!byLabel.has(label)) {
        byLabel.set(label, { code: item.key, label });
      }
    }

    return [...byLabel.values()];
  });

  return {
    loading,
    statuses,
  };
}

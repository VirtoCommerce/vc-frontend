import { computed } from "vue";
import { useGetReturnReasonsQuery } from "@/modules/returns/api/graphql/queries/getReturnReasons";

export function useReturnReasons() {
  const { result, loading } = useGetReturnReasonsQuery();

  const reasons = computed(() => result.value?.returnReasons ?? []);

  /**
   * Whether picking this reason obliges the buyer to explain. Driven by the store's own
   * dictionary, so an unknown code simply does not demand anything.
   */
  function requiresComment(code: string): boolean {
    return reasons.value.find((reason) => reason.code === code)?.requiresComment ?? false;
  }

  return {
    loading,
    reasons,
    requiresComment,
  };
}

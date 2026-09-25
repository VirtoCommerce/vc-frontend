import { computed } from "vue";
import { useGetReturnPolicyQuery } from "@/modules/returns/api/graphql/queries/getReturnPolicy";

export function useReturnPolicy() {
  const { result, loading } = useGetReturnPolicyQuery();

  const policy = computed(() => result.value?.returnPolicy);

  const allowedOrderStatuses = computed(() => policy.value?.allowedOrderStatuses ?? []);

  function allowsOrderStatus(status?: string | null): boolean {
    if (!status) {
      return false;
    }

    const wanted = status.toLowerCase();

    return allowedOrderStatuses.value.some((allowed) => allowed?.toLowerCase() === wanted);
  }

  return {
    loading,
    policy,
    isEnabled: computed(() => policy.value?.isEnabled === true),
    windowDays: computed(() => policy.value?.windowDays),
    allowedOrderStatuses,
    allowsOrderStatus,
  };
}

import { computed } from "vue";
import { useGetReturnPolicyQuery } from "@/modules/returns/api/graphql/queries/getReturnPolicy";

export function useReturnPolicy() {
  const { result, loading } = useGetReturnPolicyQuery();

  const policy = computed(() => result.value?.returnPolicy);

  return {
    loading,
    policy,
    isEnabled: computed(() => policy.value?.isEnabled === true),
    windowDays: computed(() => policy.value?.windowDays),
  };
}

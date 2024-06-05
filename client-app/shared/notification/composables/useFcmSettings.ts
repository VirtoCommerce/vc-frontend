import { computed } from "vue";
import { useGetFcmSettings } from "@/core/api/graphql/push-messages/queries/getFcmSettings";

export function useFcmSettings() {
  const { result, load, refetch } = useGetFcmSettings();

  return {
    fcmSettings: computed(() => result.value?.fcmSettings),
    fetchFcmSettings: async () => (await load()) || (await refetch()),
  };
}

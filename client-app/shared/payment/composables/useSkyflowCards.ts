import { computed, readonly } from "vue";
import { useGetSkyflowCards } from "@/core/api/graphql";

export function useSkyflowCards() {
  const { loading, result, load, refetch } = useGetSkyflowCards();

  return {
    loading: readonly(loading),
    skyflowCards: computed(() => result.value?.skyflowCards?.cards),
    fetchSkyflowCards: async () => (await load()) || (await refetch()),
  };
}

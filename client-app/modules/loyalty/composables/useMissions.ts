import { computed, readonly, ref, shallowRef } from "vue";
import { Logger } from "@/core/utilities";
import { getLoyaltyMissionProgress } from "../api/graphql/queries";
import { DEFAULT_MISSIONS_PER_PAGE } from "../constants";
import type { MissionDataType } from "./useMissionCard";
import type { Ref } from "vue";

export function useMissions() {
  const itemsPerPage = ref(DEFAULT_MISSIONS_PER_PAGE);
  const loading: Ref<boolean> = ref(false);
  const missions = shallowRef<MissionDataType[]>([]);
  const page: Ref<number> = ref(1);
  const pagesCount: Ref<number> = ref(0);

  async function fetchMissions() {
    loading.value = true;

    try {
      const response = await getLoyaltyMissionProgress({
        first: itemsPerPage.value,
        after: String((page.value - 1) * itemsPerPage.value),
      });

      missions.value = response?.items ?? [];
      pagesCount.value = Math.ceil((response?.totalCount ?? 0) / itemsPerPage.value);
    } catch (e) {
      Logger.error(`${useMissions.name}.${fetchMissions.name}`, e);
      throw e;
    } finally {
      loading.value = false;
    }
  }

  return {
    fetchMissions,
    loading: readonly(loading),
    missions: computed(() => missions.value),
    page,
    pagesCount: computed(() => pagesCount.value),
  };
}

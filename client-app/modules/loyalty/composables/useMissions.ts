import { computed, readonly, ref, shallowRef } from "vue";
import { Logger } from "@/core/utilities";
import { getLoyaltyMissionProgress } from "../api/graphql/queries";
import type { MissionDataType } from "./useMissionCard";
import type { Ref } from "vue";

export function useMissions() {
  const loading: Ref<boolean> = ref(false);
  const missions = shallowRef<MissionDataType[]>([]);

  async function fetchMissions() {
    loading.value = true;

    try {
      const response = await getLoyaltyMissionProgress();
      missions.value = response?.items ?? [];
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
  };
}

import { computed, ref } from "vue";
import { whileLabelingSettings } from "./white-labeling.mock";
import type { WhiteLabelingSettingsType } from "@/core/types";

const settings = ref<WhiteLabelingSettingsType>();

export function useWhiteLabeling() {
  function fetchWhiteLabeling(organizationId: string): void {
    settings.value = whileLabelingSettings.find((item) => item.organizationId === organizationId);
  }

  return {
    settings: computed(() => settings.value),
    fetchWhiteLabeling,
  };
}

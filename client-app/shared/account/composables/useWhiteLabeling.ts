import { computed, ref } from "vue";
import type { WhiteLabelingSettingsType } from "@/core/types";

const mockSettings: WhiteLabelingSettingsType[] = [
  {
    userId: "cfcec63a-faa5-4511-9aef-ee7672af6710",
    organizationId: "f081c52234754c9c8229aa42d6a19220",
    logoUrl: "/static/images/common/logo-1.svg",
    secondaryLogoUrl: "/static/images/common/logo-white-1.svg",
  },
  {
    userId: "07e6a601-b90e-4dbd-a7d0-0f1f89db4f2e",
    organizationId: "",
    logoUrl: "/static/images/common/logo.svg",
    secondaryLogoUrl: "/static/images/common/logo-white.svg",
  },
];

const settings = ref<WhiteLabelingSettingsType>();

export function useWhiteLabeling() {
  function fetchWhiteLabeling(organizationId: string): void {
    settings.value = mockSettings.find((item) => item.organizationId === organizationId);
  }

  return {
    settings: computed(() => settings.value),
    fetchWhiteLabeling,
  };
}

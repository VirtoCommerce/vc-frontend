import { useEventBus } from "@vueuse/core";
import type { EventBusKey } from "@vueuse/core";

const NAVIGATE_TO_CONFIGURATION_SECTION_EVENT: EventBusKey<string> = Symbol("navigate-to-configuration-section");

export function getConfigurationSectionElementId(sectionId: string) {
  return `product-configuration-section-${sectionId}`;
}

export function useConfigurationSectionNavigation() {
  const { emit, on } = useEventBus(NAVIGATE_TO_CONFIGURATION_SECTION_EVENT);

  function navigateToSection(sectionId: string) {
    emit(sectionId);
  }

  return {
    navigateToSection,
    onNavigateToSection: on,
  };
}

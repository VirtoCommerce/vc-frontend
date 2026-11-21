import { defineAsyncComponent, markRaw, watch } from "vue";
import { isSiteBuilderEnabled, useThemeSnapshot } from "@/core/theme-snapshot";
import { useExtensionRegistry } from "@/shared/common/composables/extensionRegistry/useExtensionRegistry";
import { isCustomSectionType } from "./type-name";

const SECTION_CATEGORY = "pageBuilderSection";

/**
 * Registers each custom type of the shown theme as it comes and unregisters it as it goes.
 * The renderer is a separate chunk: a page loads it only when it shows a custom section.
 */
export function registerCustomSections(): void {
  if (!isSiteBuilderEnabled()) {
    return;
  }

  const component = markRaw(defineAsyncComponent(() => import("./custom-section.vue")));
  const { getEntries, register, unregister } = useExtensionRegistry();
  const { theme } = useThemeSnapshot();
  const registered = new Set<string>();

  watch(
    () =>
      Object.keys(theme.value?.customSections ?? {})
        .filter(isCustomSectionType)
        .sort((a, b) => a.localeCompare(b))
        .join(" "),
    (value) => {
      const types = new Set(value.split(" ").filter(Boolean));

      [...registered]
        .filter((type) => !types.has(type))
        .forEach((type) => {
          unregister(SECTION_CATEGORY, type);
          registered.delete(type);
        });

      // A type someone else registered keeps their component.
      [...types]
        .filter((type) => !registered.has(type) && !Object.hasOwn(getEntries(SECTION_CATEGORY), type))
        .forEach((type) => {
          register(SECTION_CATEGORY, type, { component });
          registered.add(type);
        });
    },
    { immediate: true },
  );
}

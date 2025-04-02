import { computedEager } from "@vueuse/core";
import { unref } from "vue";
import { useEnvironmentName } from "@/core/composables/useEnvironmentName";
import { useModuleSettings } from "@/core/composables/useModuleSettings";
import { MODULE_XAPI_KEYS } from "@/core/constants/modules";
import { useThemeContext } from "./useThemeContext";
import type { MaybeRef } from "vue";

/**
 * Builds formatted page titles with environment prefix and store name based on configuration.
 *
 * @param title - Title string, array of title segments, or ref to either
 * @returns {Object} Object containing the formatted page title
 *
 * @example
 * const { title } = usePageTitle("Product Details");
 * // With default settings in development: "DEV | My Store | Product Details"
 */
export function usePageTitle(title?: MaybeRef<string | string[] | undefined>) {
  const { themeContext } = useThemeContext();
  const { environmentName, isIgnored } = useEnvironmentName();
  const { getModuleSettings } = useModuleSettings(MODULE_XAPI_KEYS.MODULE_ID);

  const { page_title_with_store_name, page_title_store_name_align, page_title_divider } = getModuleSettings({
    [MODULE_XAPI_KEYS.PAGE_TITLE_WITH_STORE_NAME]: "page_title_with_store_name",
    [MODULE_XAPI_KEYS.PAGE_TITLE_STORE_NAME_ALIGN]: "page_title_store_name_align",
    [MODULE_XAPI_KEYS.PAGE_TITLE_DIVIDER]: "page_title_divider",
  } as const);

  const { storeName } = themeContext.value;

  const builtTitle = computedEager(() => {
    if (!title) {
      return "";
    }

    const textOrChunks = unref(title);
    const titleChunks: string[] = [];

    if (Array.isArray(textOrChunks)) {
      titleChunks.push(...textOrChunks);
    } else if (textOrChunks) {
      titleChunks.push(textOrChunks);
    }

    if (page_title_with_store_name) {
      titleChunks[page_title_store_name_align === "end" ? "push" : "unshift"](storeName);
    }

    if (!isIgnored) {
      titleChunks.unshift(environmentName);
    }

    return titleChunks.filter(Boolean).join(page_title_divider ? ` ${page_title_divider} ` : " ");
  });

  return {
    title: builtTitle,
  };
}

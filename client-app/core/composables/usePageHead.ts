import { useHead } from "@unhead/vue";
import { computedEager } from "@vueuse/core";
import { unref } from "vue";
import { useEnvironmentName } from "@/core/composables/useEnvironmentName";
import { useThemeContext } from "./useThemeContext";
import type { IUsePageSeoData } from "../types";

export function usePageHead(data: IUsePageSeoData) {
  const { themeContext } = useThemeContext();
  const { environmentName, isIgnored } = useEnvironmentName();

  const {
    storeName,
    settings: { page_title_with_store_name, page_title_store_name_align, page_title_divider },
  } = themeContext.value;

  return useHead({
    title: computedEager(() => {
      if (!data.title) {
        return "";
      }

      const textOrChunks = unref(data.title);
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

      return titleChunks.filter(Boolean).join(page_title_divider);
    }),
    meta: () => {
      if (!data.meta) {
        return [];
      }
      return Object.entries(data.meta).map(([name, content]) => ({ name, content: unref(content) ?? "" }));
    },
  });
}

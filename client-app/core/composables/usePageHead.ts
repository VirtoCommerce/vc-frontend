import { useHead } from "@unhead/vue";
import { computedEager } from "@vueuse/core";
import { unref } from "vue";
// import { useI18n } from "vue-i18n";
import { useThemeContext } from "./useThemeContext";
import type { IUsePageSeoData } from "../types";

export function usePageHead(data: IUsePageSeoData) {
  const { themeContext } = useThemeContext();
  // const { t: $t } = useI18n();

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

      // TODO: uncomment lines below and above after adding envName property to storeSettings
      // const envName = themeContext.value.storeSettings?.envName;
      // if (envName) {
      //   titleChunks.unshift($t(`env.${envName}`));
      // }

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

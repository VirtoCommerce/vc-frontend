import { unref } from "vue";
import { HeadObject, useHead } from "@vueuse/head";
import { UsePageSeoData } from "@/core/types";
import useThemeContext from "./useThemeContext";
import { eagerComputed } from "@vueuse/core";

export default function usePageHead(data: UsePageSeoData) {
  const { themeContext } = useThemeContext();

  const {
    storeName,
    settings: { page_title_with_store_name, page_title_store_name_align, page_title_divider },
  } = themeContext.value;

  const headObject: HeadObject = { meta: [] };

  if (Object.prototype.hasOwnProperty.call(data, "title")) {
    headObject.title = eagerComputed(() => {
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

      return titleChunks.filter(Boolean).join(page_title_divider);
    });
  }

  if (data.meta) {
    Object.entries(data.meta).forEach(([name, content]) =>
      unref(headObject.meta)!.push({ name, content: eagerComputed(() => unref(content) ?? "") })
    );
  }

  return useHead(headObject);
}

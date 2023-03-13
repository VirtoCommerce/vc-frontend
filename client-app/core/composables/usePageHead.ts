import { eagerComputed } from "@vueuse/core";
import { useHead } from "@vueuse/head";
import { unref } from "vue";
import { useThemeContext } from "./useThemeContext";
import type { IUsePageSeoData } from "../types";
import type { MaybeRef } from "@vueuse/core";
import type { HeadAttrs } from "@vueuse/head";

export function usePageHead(data: IUsePageSeoData) {
  const { themeContext } = useThemeContext();

  const {
    storeName,
    settings: { page_title_with_store_name, page_title_store_name_align, page_title_divider },
  } = themeContext.value;

  const headObject: {
    title?: MaybeRef<string>;
    meta: HeadAttrs[];
  } = { meta: [] };

  if (data.hasOwnProperty("title")) {
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
      headObject.meta.push({ name, content: () => unref(content) ?? "" })
    );
  }

  return useHead(headObject);
}

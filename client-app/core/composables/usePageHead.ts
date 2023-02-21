import { eagerComputed, MaybeRef } from "@vueuse/core";
import { HeadAttrs, useHead } from "@vueuse/head";
import { unref } from "vue";
import { useThemeContext } from "@/core";

export interface IUsePageSeoData {
  /**
   * input chunks: ["title_part_1", "title_part_2"]
   * output string: title_part_1<page_title_divider>title_part_2
   */
  title?: MaybeRef<string | string[] | undefined>;
  meta?: Record<string, MaybeRef<string | undefined>>;
}

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

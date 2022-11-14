import { unref } from "vue";
import { eagerComputed, MaybeRef } from "@vueuse/core";
import { HeadAttrs, useHead } from "@vueuse/head";
import { UsePageSeoData, useThemeContext } from "@/core";

export default function usePageHead(data: UsePageSeoData) {
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

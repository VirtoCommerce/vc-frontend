import { useHead } from "@unhead/vue";
import { unref } from "vue";
import { usePageTitle } from "./usePageTitle";
import type { IUsePageSeoData } from "../types";

export function usePageHead(data?: IUsePageSeoData) {
  const { title: builtTitle } = usePageTitle(data.title);

  return useHead({
    title: builtTitle,
    meta: () => {
      if (!data.meta) {
        return [];
      }
      return Object.entries(data.meta).map(([name, content]) => ({ name, content: unref(content) ?? "" }));
    },
  });
}

import { useHead } from "@unhead/vue";
import { unref } from "vue";
import { usePageTitle } from "./usePageTitle";
import type { IUsePageSeoData } from "../types";

// Returns nothing on purpose: no caller uses the head entry, and exposing unhead's return type
// through the facade contract puts an unresolvable internal alias into the generated .d.ts.
export function usePageHead(data?: IUsePageSeoData): void {
  const { title: builtTitle } = usePageTitle(data?.title ?? "");

  useHead({
    title: builtTitle,
    meta: () => {
      if (!data?.meta) {
        return [];
      }
      return Object.entries(data.meta).map(([name, content]) => ({ name, content: unref(content) ?? "" }));
    },
  });
}

import type { InjectionKey } from "vue";

export const vcScrollbarKey: InjectionKey<VcScrollbarContextType> = Symbol("vc-scrollbar-context");

/** A closed popover's display:none content: it sits at every edge, so its edges mean nothing. */
export function isCollapsedBox({
  clientHeight,
  clientWidth,
}: Pick<HTMLElement, "clientHeight" | "clientWidth">): boolean {
  return !clientHeight || !clientWidth;
}

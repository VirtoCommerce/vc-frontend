import type { InjectionKey } from "vue";

/** The kit's own view of the context: `remeasure` serves VcLoadMore and stays out of the public type. */
type ScrollbarContextType = VcScrollbarContextType & {
  /** Measures again after the usual debounce, for a reader whose input changed with nothing in the DOM to observe. */
  remeasure: () => void;
};

export const vcScrollbarKey: InjectionKey<ScrollbarContextType> = Symbol("vc-scrollbar-context");

/** A closed popover's display:none content: it sits at every edge, so its edges mean nothing. */
export function isCollapsedBox({
  clientHeight,
  clientWidth,
}: Pick<HTMLElement, "clientHeight" | "clientWidth">): boolean {
  return !clientHeight || !clientWidth;
}

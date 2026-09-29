import { inject, provide } from "vue";
import type { ComputedRef, InjectionKey } from "vue";

/**
 * What a `LayoutBlock` offers the widget inside it about the block itself — so the widget can name and
 * hide it from its own header. The drag controls come from the ui-kit list instead (`useSortableItem`).
 *
 * provide/inject rather than props: the widget is slot content authored by the surface, so a prop would
 * have to be threaded through every page template for a concern neither the page nor the widget owns.
 */
export interface ILayoutBlockContextType {
  /** Localized block name, for the control labels. */
  title: ComputedRef<string>;
  hide: () => void;
}

const LAYOUT_BLOCK = Symbol("layoutBlock") as InjectionKey<ILayoutBlockContextType | undefined>;

export function provideLayoutBlock(context: ILayoutBlockContextType): void {
  provide(LAYOUT_BLOCK, context);
}

/** `undefined` for a widget rendered outside a layout. */
export function useLayoutBlock(): ILayoutBlockContextType | undefined {
  return inject(LAYOUT_BLOCK, undefined);
}

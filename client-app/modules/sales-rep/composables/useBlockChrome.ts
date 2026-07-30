import { inject, provide } from "vue";
import type { ComputedRef, InjectionKey } from "vue";

/**
 * The drag controls a `LayoutBlock` offers to the widget inside it, so the widget can render them in
 * its own header rather than the layout overlaying them from outside.
 *
 * provide/inject rather than props: the widget is slot content authored by the surface, so a prop would
 * have to be threaded through every page template for a concern neither the page nor the widget owns.
 */
export interface ILayoutBlockChromeType {
  /** Edit mode: the header is a drag surface and the block can be hidden. */
  draggable: ComputedRef<boolean>;
  grabbed: ComputedRef<boolean>;
  /** Localized block name, for the control labels. */
  title: ComputedRef<string>;
  hide: () => void;
  handleKeydown: (event: KeyboardEvent) => void;
  handleBlur: () => void;
}

const LAYOUT_BLOCK_CHROME = Symbol("layoutBlockChrome") as InjectionKey<ILayoutBlockChromeType>;

export function provideBlockChrome(chrome: ILayoutBlockChromeType): void {
  provide(LAYOUT_BLOCK_CHROME, chrome);
}

/** `undefined` for a widget rendered outside a layout, which then keeps its plain header. */
export function useBlockChrome(): ILayoutBlockChromeType | undefined {
  return inject(LAYOUT_BLOCK_CHROME, undefined);
}

/** Consume the offer, so a widget nested in another does not render a second handle and ✕. */
export function stopBlockChrome(): void {
  provide(LAYOUT_BLOCK_CHROME, undefined as unknown as ILayoutBlockChromeType);
}

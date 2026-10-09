import { inject, provide } from "vue";
import type { SortableHandleAttrsType } from "./useSortableList";
import type { InjectionKey } from "vue";

/** Reactive: read the fields directly, in a template or a computed. */
export interface ISortableItemContext {
  readonly id: string;
  readonly grabbed: boolean;
  /** Null while the list is disabled, and in a list that drags by the whole item — then no handle renders. */
  readonly handleAttrs: SortableHandleAttrsType | null;
}

const SORTABLE_ITEM_KEY = Symbol("sortableItem") as InjectionKey<ISortableItemContext | undefined>;

export function provideSortableItem(context: ISortableItemContext): void {
  provide(SORTABLE_ITEM_KEY, context);
}

/**
 * The drag controls of the VcSortable item this component renders inside, so a component deep in the
 * item slot can put the handle in its own header.
 *
 * `undefined` outside a sortable list, which lets one component serve both places. Consumes the offer
 * unless `consume: false`, so a component nested inside another inside the same item gets `undefined`
 * and renders no second handle.
 */
export function useSortableItem(options?: { consume?: boolean }): ISortableItemContext | undefined {
  const context = inject(SORTABLE_ITEM_KEY, undefined);

  if (options?.consume !== false) {
    provide(SORTABLE_ITEM_KEY, undefined);
  }

  return context;
}

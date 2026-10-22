import { HANDLE_SELECTOR, SORTABLE_ITEM_ATTRIBUTE } from "@/ui-kit/composables/useSortableList";

// Shared by every list, so an object carried across lists keeps its id.
const objectKeys = new WeakMap<object, string>();
let lastObjectKey = 0;

export function objectKey(item: object): string {
  let key = objectKeys.get(item);
  if (!key) {
    lastObjectKey += 1;
    key = `vc-sortable-${lastObjectKey}`;
    objectKeys.set(item, key);
  }
  return key;
}

export function warn(text: string): void {
  // eslint-disable-next-line no-console
  console.warn(`[VcSortable] ${text}`);
}

export function checkItem(el: unknown, id: string, hasHandle: boolean): void {
  if (!(el instanceof Element) || !el.hasAttribute(SORTABLE_ITEM_ATTRIBUTE)) {
    warn(`item "${id}" did not get its \`attrs\`: bind them to the #item slot's root element.`);
  } else if (hasHandle && !el.querySelector(HANDLE_SELECTOR)) {
    warn(
      `item "${id}" had no handle when it mounted. Bind \`useSortableItem().handleAttrs\` to an element inside the ` +
        "item, from a component rendered in the #item slot. If you did, possible causes: a component between the " +
        "item and your handle called `useSortableItem()` first and took it (call `useSortableItem({ consume: false })` " +
        "there); the component you bound it to does not pass attrs to an element; the handle is teleported out of " +
        "the item. A handle that renders after mount works; then ignore this.",
    );
  }
}

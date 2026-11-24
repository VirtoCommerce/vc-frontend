<template>
  <div ref="root" class="vc-menu-list" :role="role">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { useEventListener } from "@vueuse/core";
import { computed, onMounted, provide, shallowReactive, shallowRef, toRef, useAttrs, useTemplateRef, watch } from "vue";
import { vcMenuListKey } from "./vc-menu-list-context";

interface IProps {
  /**
   * `listbox`: a choice of options; items become `role="option"` and `aria-selected` follows `active`.
   * `menu`: actions or links; items become `role="menuitem"`.
   */
  role: VcMenuListRoleType;
}

const props = defineProps<IProps>();

defineSlots<{
  /** `VcMenuItem` rows, at any depth (a VcScrollbar between them is fine). Name the list with `aria-label` or `aria-labelledby`. */
  default?: () => unknown;
}>();

const attrs = useAttrs();
const root = useTemplateRef<HTMLElement>("root");
const items = shallowReactive(new Set<VcMenuListItemType>());
const lastFocused = shallowRef<VcMenuListItemType | null>(null);

function contains(item: VcMenuListItemType): boolean {
  const el = item.el();

  return !!el && !!root.value?.contains(el);
}

function isBefore(a: VcMenuListItemType, b: VcMenuListItemType): boolean {
  return (a.el()!.compareDocumentPosition(b.el()!) & Node.DOCUMENT_POSITION_FOLLOWING) !== 0;
}

// Read in DOM order on every call: a keyed re-order moves elements without touching the registered set.
function getEnabledItems(): VcMenuListItemType[] {
  return Array.from(items)
    .filter((item) => !item.disabled() && contains(item))
    .sort((a, b) => (isBefore(a, b) ? -1 : 1));
}

const activeItem = computed(() => getEnabledItems().find((item) => item.active()));

// A new selection takes the stop over from the item focused last.
watch(activeItem, () => {
  lastFocused.value = null;
});

const tabStop = computed(() => {
  const enabledItems = getEnabledItems();

  if (lastFocused.value && enabledItems.includes(lastFocused.value)) {
    return lastFocused.value;
  }

  return activeItem.value ?? enabledItems[0];
});

function register(item: VcMenuListItemType): () => void {
  items.add(item);

  return () => {
    items.delete(item);

    if (lastFocused.value === item) {
      lastFocused.value = null;
    }
  };
}

// Listbox and menu keys: Up and Down move between the enabled items (wrapping), Home and End go to the ends.
// On the element, not in the template: a handler there trips vuejs-accessibility/no-static-element-interactions.
useEventListener(root, "keydown", (event: KeyboardEvent) => {
  // Leave modified keys to the browser: Shift+Down extends a text selection.
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) {
    return;
  }

  const elements = getEnabledItems().map((item) => item.el()!);
  const index = elements.indexOf(event.target as HTMLElement);

  if (index === -1) {
    return;
  }

  let target: HTMLElement | undefined;

  if (event.key === "ArrowDown") {
    target = elements[(index + 1) % elements.length];
  } else if (event.key === "ArrowUp") {
    target = elements[(index - 1 + elements.length) % elements.length];
  } else if (event.key === "Home") {
    target = elements[0];
  } else if (event.key === "End") {
    target = elements.at(-1);
  }

  if (!target) {
    return;
  }

  event.preventDefault();
  target.focus();
});

/** Focuses the tab stop: the item focused last, else the `active` one, else the first enabled one. */
function focus(): void {
  tabStop.value?.el()?.focus();
}

onMounted(() => {
  if (import.meta.env.DEV && !attrs["aria-label"] && !attrs["aria-labelledby"]) {
    // eslint-disable-next-line no-console
    console.warn("[VcMenuList] Name the list with `aria-label` or `aria-labelledby`.");
  }
});

provide(vcMenuListKey, {
  listRole: toRef(props, "role"),
  itemRole: computed(() => (props.role === "listbox" ? "option" : "menuitem")),
  contains,
  isTabStop: (item) => tabStop.value === item,
  onItemFocus: (item) => {
    if (contains(item)) {
      lastFocused.value = item;
    }
  },
  register,
});

defineExpose({ focus });
</script>

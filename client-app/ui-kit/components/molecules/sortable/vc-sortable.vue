<template>
  <component :is="tag" ref="container" class="vc-sortable" :data-sortable-name="name">
    <slot name="before" />

    <ItemScope
      v-for="item in model"
      :key="keyOf(item)"
      :item-id="keyOf(item)"
      :grabbed="isGrabbed(keyOf(item))"
      :handle-attrs="handleAttrs(keyOf(item))"
      :render-item="() => $slots.item?.(scopeOf(item))"
    />

    <!-- Inside the container but not an item — an empty-state hint, a footer. `itemSelector` never
         matches it, so it keeps its place and the indices stay aligned with the model. -->
    <slot name="after" />
  </component>
</template>

<script setup lang="ts" generic="T">
import { computed, defineComponent, useTemplateRef } from "vue";
import { provideSortableItem, useSortableList } from "@/ui-kit/composables";
import type {
  SortableHandleAttrsType,
  SortableItemAttrsType,
  SortableMovePayloadType,
  SortableOrientationType,
  SortableSignalType,
} from "@/ui-kit/composables";
import type { PropType, VNode } from "vue";

export interface IEmits {
  /** An item left this list for another one in its group. The owner of both lists applies it. */
  (event: "move", payload: SortableMovePayloadType): void;
  /** Every keyboard state change, unlocalized, for the consumer's `aria-live` region. */
  (event: "announce", signal: SortableSignalType): void;
}

export interface IProps<TItem = unknown> {
  /** Names this list in `move` payloads, in `accepts` and in a sibling's `ring`. */
  name?: string;
  /** Lists sharing a group exchange items. */
  group?: string;
  /** Ordered names of this list and its siblings, walked by the cross-axis arrows. Ends do not wrap. */
  ring?: readonly string[];
  /** Per-item acceptance for items arriving from `from`, asked on the pointer AND the keyboard path. */
  accepts?: (id: string, from: string) => boolean;
  /** Which children are items. Defaults to the `data-sortable-id` that `attrs` puts on each. */
  itemSelector?: string;
  /** Pointer handle inside an item. Without one the whole item drags and takes the keyboard. */
  handle?: string;
  /** Elements inside an item that must never start a drag, such as a button inside the handle. */
  filter?: string;
  /** Which arrows reorder: ↑/↓ for "vertical", ←/→ for "horizontal". */
  orientation?: SortableOrientationType;
  /** Reorder mode. While false the list is inert and the items keep their own behaviour. */
  enabled?: boolean;
  /** Container element. Layout stays the consumer's, so the class to style is their own. */
  tag?: string;
  /** Maps an item to its id. Defaults to `String(item)`, which suits a list of ids. */
  itemKey?: (item: TItem) => string;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps<T>>(), {
  name: "default",
  group: undefined,
  ring: undefined,
  accepts: undefined,
  itemSelector: undefined,
  handle: undefined,
  filter: undefined,
  orientation: "vertical",
  enabled: true,
  tag: "div",
  itemKey: undefined,
});

defineSlots<{
  /** One item. Render exactly one root element and bind `attrs` to it — SortableJS moves that element. */
  item?(props: { item: T; attrs: SortableItemAttrsType; grabbed: boolean }): unknown;
  before?(): unknown;
  after?(): unknown;
}>();

const model = defineModel<T[]>({ required: true });

const container = useTemplateRef<HTMLElement>("container");

function keyOf(item: T): string {
  return props.itemKey ? props.itemKey(item) : String(item);
}

const byKey = computed(() => new Map(model.value.map((item) => [keyOf(item), item])));

// eslint-disable-next-line vue/no-setup-props-reactivity-loss -- structural: SortableJS reads these once
const { itemSelector, handle, filter, accepts } = props;

const { isGrabbed, itemAttrs, handleAttrs } = useSortableList(container, {
  name: () => props.name,
  items: () => model.value.map(keyOf),
  group: () => props.group,
  ring: () => props.ring,
  accepts,
  itemSelector,
  handle,
  filter,
  orientation: () => props.orientation,
  enabled: () => props.enabled,
  // Same-list reorder only: a cross-list move never patches this list, or the item would land in both.
  onReorder: (ids) => {
    model.value = ids.map((id) => byKey.value.get(id)).filter((item): item is T => item !== undefined);
  },
  onMove: (payload) => emit("move", payload),
  onAnnounce: (signal) => emit("announce", signal),
});

function scopeOf(item: T) {
  const id = keyOf(item);
  return { item, attrs: itemAttrs(id), grabbed: isGrabbed(id) };
}

// Renderless and fragment-free: SortableJS moves the item element itself, so anything this adds to the
// DOM — a fragment's anchors included — would be a node Vue then loses track of. One instance per item,
// so a `useSortableItem()` deep inside the slot resolves to THIS item.
const ItemScope = defineComponent({
  props: {
    itemId: { type: String, required: true },
    grabbed: { type: Boolean, required: true },
    handleAttrs: { type: Object as PropType<SortableHandleAttrsType | null>, default: null },
    // The slot function itself, not a `<slot>`: that would wrap the item in a fragment.
    renderItem: { type: Function as PropType<() => VNode[] | undefined>, required: true },
  },

  setup(scopeProps) {
    provideSortableItem({
      id: computed(() => scopeProps.itemId),
      grabbed: computed(() => scopeProps.grabbed),
      handleAttrs: computed(() => scopeProps.handleAttrs),
    });

    return () => {
      const nodes = scopeProps.renderItem() ?? [];
      return nodes.length === 1 ? nodes[0] : nodes;
    };
  },
});
</script>

<style lang="scss">
@use "@/ui-kit/styles/focus-ring" as *;

// No box properties: layout is the consumer's, and this class must be safe on a `tbody`. What is here is
// only the drag affordance, tokenized; the states double the item class so they outrank the consumer's
// resting styles regardless of stylesheet order.
.vc-sortable {
  &__item {
    $item: &;

    @apply select-none;

    // Before `--whole`: a held whole item shows the focus ring, not the accent, on its outline.
    &#{$item}--grabbed {
      opacity: var(--vc-sortable-grabbed-opacity);
      box-shadow: var(--vc-sortable-grabbed-shadow);
      outline-color: var(--vc-sortable-accent-color);
    }

    &--whole {
      cursor: var(--vc-sortable-cursor);

      &:active {
        cursor: var(--vc-sortable-cursor-active);
      }

      // The keyboard moves the item and restores focus a tick later, so the held ring cannot depend on
      // `:focus-visible`.
      &[aria-pressed="true"] {
        @include focus-ring;
      }
    }
  }

  &__handle {
    cursor: var(--vc-sortable-cursor);

    &:active {
      cursor: var(--vc-sortable-cursor-active);
    }

    // Stands in for the "I am holding this" feedback a pointer user gets from the cursor.
    &[aria-pressed="true"] {
      --vc-icon-color: var(--vc-sortable-accent-color);

      box-shadow: 0 0 0 2px var(--vc-sortable-handle-ring-color);
    }
  }

  // SortableJS moves the dragged element to the insertion point, so this previews what lands there.
  &__item#{&}__ghost {
    @apply rounded-[--vc-radius] outline-dashed outline-1 outline-offset-2;

    opacity: var(--vc-sortable-ghost-opacity);
    outline-color: var(--vc-sortable-accent-color);
  }

  // The clone under the pointer stays solid, so what is carried reads as the real item.
  &__item#{&}__drag {
    opacity: 1;
  }
}
</style>

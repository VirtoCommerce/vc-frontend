<template>
  <component :is="tag" ref="container" class="vc-sortable">
    <slot name="before" />

    <ItemScope
      v-for="item in model"
      :key="keyOf(item)"
      :item-id="keyOf(item)"
      :grabbed="isGrabbed(keyOf(item))"
      :handle-attrs="handleAttrs(keyOf(item))"
      :render-item="() => $slots.item?.(scopeOf(item))"
    />

    <!-- Inside the container but not an item — an empty-state hint, a footer. It carries no
         `data-sortable-id`, so it keeps its place and the indices stay aligned with the model. -->
    <slot name="after" />

    <!-- Out of the container, which may be a `tbody`; Teleport leaves only comment anchors here. -->
    <Teleport to="body">
      <span v-if="liveRegion" aria-live="polite" class="sr-only">{{ message }}</span>
    </Teleport>
  </component>
</template>

<script setup lang="ts" generic="T">
import {
  Comment,
  computed,
  defineComponent,
  getCurrentInstance,
  nextTick,
  onMounted,
  reactive,
  ref,
  useTemplateRef,
  watch,
} from "vue";
import { useI18n } from "vue-i18n";
import { useSortableList } from "@/ui-kit/composables";
import { provideSortableItem } from "@/ui-kit/composables/useSortableItem";
import { checkItem, objectKey, warn } from "./vc-sortable-support";
import type {
  SortableGrabPayloadType,
  SortableHandleAttrsType,
  SortableItemAttrsType,
  SortableMovePayloadType,
  SortableOrientationType,
  SortableReleasePayloadType,
  SortableSignalType,
} from "@/ui-kit/composables";
import type { PropType, VNode } from "vue";

export interface IEmits {
  /** An item left this list for another one in its group. The owner of both lists applies it, synchronously. */
  (event: "move", payload: SortableMovePayloadType): void;
  /**
   * Every keyboard state change, unlocalized. A notification only: the list keeps announcing in its own region
   * unless `liveRegion` is false, so a listener that renders its own region must turn that off, or both speak.
   */
  (event: "announce", signal: SortableSignalType): void;
  /** A grab started, by pointer drag or by keyboard, in this list. */
  (event: "grab", payload: SortableGrabPayloadType): void;
  /** A grab ended. A keyboard grab carried across lists ends in the list that holds it then. */
  (event: "release", payload: SortableReleasePayloadType): void;
}

export interface IProps<TItem = unknown> {
  /** Names this list in `move` payloads, in `accepts` and in a sibling's `listOrder`. Required in a `group`. */
  name?: string;
  /** Lists sharing a group exchange items. */
  group?: string;
  /** Ordered names of this list and its siblings, walked by the cross-axis arrows. Ends do not wrap. */
  listOrder?: readonly string[];
  /**
   * Per-item acceptance for items arriving from `from`, asked on the pointer AND the keyboard path. Called on
   * every check, so it may close over reactive state.
   */
  accepts?: (id: string, from: string) => boolean;
  /**
   * Set on the list the item leaves: a keyboard move out of it into another list drops the item there instead
   * of keeping it held, as a pointer drop does, and Escape no longer brings it back.
   */
  dropOnListChange?: boolean;
  /**
   * Drag by a handle instead of the whole item. `true` drags by the element bound with `useSortableItem()`'s
   * `handleAttrs`, which also takes the keyboard; a selector adds what it matches to that pointer grip.
   * Read at mount.
   */
  handle?: boolean | string;
  /** Elements inside an item that must never start a drag, such as a button inside the handle. Read at mount. */
  filter?: string;
  /** Which arrows reorder: ↑/↓ for "vertical", ←/→ for "horizontal". */
  orientation?: SortableOrientationType;
  /** Turns reordering off. The list is inert and the items keep their own behaviour. */
  disabled?: boolean;
  /**
   * Renders the list's own localized, polite `aria-live` region. Turn it off only when you announce `announce`
   * signals yourself, e.g. one region shared by several lists.
   */
  liveRegion?: boolean;
  /** Container element. Layout stays the consumer's, so the class to style is their own. */
  tag?: string;
  /**
   * Maps an item to its id, as `move`, `accepts` and the signals report it. Defaults to the item itself for
   * strings and numbers, and to an id generated per object otherwise — stable while the object is, but
   * opaque: pass one whenever `move` or `accepts` must map the id back to your data.
   */
  itemKey?: (item: TItem) => string;
}

const emit = defineEmits<IEmits>();

const props = withDefaults(defineProps<IProps<T>>(), {
  name: "default",
  group: undefined,
  listOrder: undefined,
  accepts: undefined,
  dropOnListChange: false,
  handle: undefined,
  filter: undefined,
  orientation: "vertical",
  disabled: false,
  liveRegion: true,
  tag: "div",
  itemKey: undefined,
});

defineSlots<{
  /** One item. Render exactly one root element and bind `attrs` to it — SortableJS moves that element. */
  item?(props: { item: T; attrs: SortableItemAttrsType; grabbed: boolean }): unknown;
  /** Inside the container, ahead of the items, e.g. a header row. Not sortable, and not counted in indices. */
  before?(): unknown;
  /** Inside the container, after the items, e.g. an empty-state hint or a footer. Not sortable, and not counted in indices. */
  after?(): unknown;
}>();

const model = defineModel<T[]>({ required: true });

const { t } = useI18n();

const instance = getCurrentInstance();

// `.once` listeners are stored under their own key.
function hasListener(name: "onAnnounce" | "onMove"): boolean {
  const vnodeProps = instance?.vnode.props;
  return Boolean(vnodeProps?.[name] || vnodeProps?.[`${name}Once`]);
}

const container = useTemplateRef<HTMLElement>("container");

function keyOf(item: T): string {
  if (props.itemKey) {
    return props.itemKey(item);
  }
  return typeof item === "object" && item !== null ? objectKey(item) : String(item);
}

const byKey = computed(() => new Map(model.value.map((item) => [keyOf(item), item])));

// eslint-disable-next-line vue/no-setup-props-reactivity-loss -- structural: SortableJS reads these once
const { handle, filter } = props;

const message = ref("");

function describe(signal: SortableSignalType): string {
  switch (signal.kind) {
    case "grabbed":
      return t(signal.canChangeList ? "ui_kit.sortable.grabbed_lists" : "ui_kit.sortable.grabbed", {
        position: signal.index + 1,
        total: signal.total,
      });
    case "moved":
      return t("ui_kit.sortable.moved", { position: signal.index + 1, total: signal.total });
    case "dropped":
      return t("ui_kit.sortable.dropped", { position: signal.index + 1, total: signal.total });
    case "edge":
      return t("ui_kit.sortable.edge");
    case "cancelled":
      return t("ui_kit.sortable.cancelled");
    // By place, not by `name`: that is an id, never translated.
    case "movedList":
      return t(signal.dropped ? "ui_kit.sortable.moved_list_dropped" : "ui_kit.sortable.moved_list", {
        position: (props.listOrder?.indexOf(signal.to) ?? -1) + 1,
        total: props.listOrder?.length ?? 0,
      });
    case "noTarget":
      return t("ui_kit.sortable.no_target");
  }
}

function onAnnounce(signal: SortableSignalType): void {
  emit("announce", signal);
  if (!props.liveRegion) {
    return;
  }
  // Cleared first, so a repeated message ("No further to go" twice) is announced again.
  message.value = "";
  const text = describe(signal);
  void nextTick(() => {
    message.value = text;
  });
}

const { isGrabbed, itemAttrs, handleAttrs } = useSortableList(container, {
  name: () => props.name,
  items: () => model.value.map(keyOf),
  group: () => props.group,
  listOrder: () => props.listOrder,
  // Read per call, so a rule closing over state never goes stale.
  accepts: (id, from) => props.accepts?.(id, from) ?? true,
  dropOnListChange: () => props.dropOnListChange,
  handle,
  filter,
  orientation: () => props.orientation,
  disabled: () => props.disabled,
  // Same-list reorder only: a cross-list move never patches this list, or the item would land in both.
  onReorder: (ids) => {
    model.value = ids.map((id) => byKey.value.get(id)).filter((item): item is T => item !== undefined);
  },
  onMove: (payload) => emit("move", payload),
  onAnnounce,
  onGrab: (payload) => emit("grab", payload),
  onRelease: (payload) => emit("release", payload),
});

function scopeOf(item: T) {
  const id = keyOf(item);
  return { item, attrs: itemAttrs(id), grabbed: isGrabbed(id) };
}

if (import.meta.env.DEV) {
  const vnodeProps = instance?.vnode.props ?? {};

  if (props.group && !("name" in vnodeProps)) {
    warn(
      `list in group "${props.group}" has no \`name\`: every unnamed list is "default", so moves cannot tell them apart.`,
    );
  }
  if (props.group && !hasListener("onMove")) {
    warn(`list in group "${props.group}" has no \`@move\` listener: an item dragged across snaps back.`);
  }
  if (!props.liveRegion && !hasListener("onAnnounce")) {
    warn("`liveRegion` is off and nothing listens to `announce`: keyboard sorting is silent for screen readers.");
  }

  // Not `accepts`: an inline function is a new one on every render, though it means the same.
  watch([() => props.handle, () => props.filter], () =>
    warn("`handle` and `filter` are read at mount; changing them later has no effect."),
  );

  // Watched, not read once: object data usually arrives after mount.
  let warnedObjects = false;
  watch(
    () => model.value.some((item) => typeof item === "object"),
    (hasObjects) => {
      if (warnedObjects || !(props.group || props.accepts) || props.itemKey) {
        return;
      }
      if (hasObjects) {
        warnedObjects = true;
        warn("object items need an `itemKey` here: `move` and `accepts` would get generated ids you cannot map back.");
      }
    },
    { immediate: true },
  );

  watch(
    () => model.value.map(keyOf),
    (keys) => {
      if (new Set(keys).size !== keys.length) {
        warn("two items share an id, so a reorder would drop one. Pass an `itemKey` that is unique per item.");
      }
    },
    { immediate: true },
  );
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
    provideSortableItem(
      reactive({
        id: computed(() => scopeProps.itemId),
        grabbed: computed(() => scopeProps.grabbed),
        handleAttrs: computed(() => scopeProps.handleAttrs),
      }),
    );

    if (import.meta.env.DEV) {
      const scope = getCurrentInstance();
      // One warning per mistake: with several roots the attrs check would blame the wrong one.
      onMounted(() => warnedRoots || checkItem(scope?.proxy?.$el, scopeProps.itemId, scopeProps.handleAttrs !== null));
    }

    let warnedRoots = false;

    return () => {
      // Development builds keep template comments as vnodes; they must not turn the item into a fragment.
      const nodes = (scopeProps.renderItem() ?? []).filter((node) => node.type !== Comment);
      if (import.meta.env.DEV && nodes.length !== 1 && !warnedRoots) {
        warnedRoots = true;
        warn(`item "${scopeProps.itemId}" renders ${nodes.length} root nodes; the #item slot needs exactly one.`);
      }
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
      outline-color: var(--vc-sortable-accent-color);
    }

    // Handle mode only: there the ring is on the handle, inside the item. Under a whole item a shadow fills
    // the gap between the item and its ring.
    &#{$item}--grabbed:not(#{$item}--whole) {
      box-shadow: var(--vc-sortable-grabbed-shadow);
    }

    &--whole {
      cursor: var(--vc-sortable-cursor);

      &:active {
        cursor: var(--vc-sortable-active-cursor);
      }

      // The keyboard moves the item and restores focus a tick later, so the held ring cannot depend on
      // `:focus-visible`.
      // Held, not only focused: the ring doubles. A change of shape, at the ring's own colour and contrast; it
      // reaches 8px outside the item, twice a plain ring.
      &[aria-pressed="true"] {
        @include focus-ring;

        outline-style: double;
        outline-width: calc(3 * var(--vc-focus-ring-width));
      }
    }

    // SortableJS moves the dragged element to the insertion point, so this previews what lands there. No
    // radius: the item's shape is the consumer's.
    &#{$item}--ghost {
      @apply outline-dashed outline-1 outline-offset-2;

      opacity: var(--vc-sortable-ghost-opacity);
      outline-color: var(--vc-sortable-accent-color);
    }

    // The clone under the pointer stays solid, so what is carried reads as the real item.
    &#{$item}--drag {
      opacity: 1;
    }
  }

  // The handle is the consumer's element — often another kit component — so only the cursor is set here;
  // the held look is the consumer's, through that component's own knobs.
  &__handle {
    cursor: var(--vc-sortable-cursor);

    &:active {
      cursor: var(--vc-sortable-active-cursor);
    }
  }
}
</style>

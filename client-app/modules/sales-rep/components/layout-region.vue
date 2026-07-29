<template>
  <component
    :is="tag ?? 'div'"
    ref="container"
    :class="[
      'layout-region',
      `layout-region--${orientation}`,
      { 'layout-region--editing': editing, 'layout-region--zone': editing && zone },
    ]"
    :data-drop-hidden="String(Boolean(dropHidden))"
  >
    <LayoutBlock
      v-for="id in entries"
      :key="id"
      :block-id="id"
      :title="titleOf(id)"
      :editing="editing"
      :grabbed="isGrabbed(id)"
      :drag-whole="dragWhole"
      @hide="$emit('setHidden', id, !dropHidden)"
      @handle-keydown="onKeydown($event, id)"
      @handle-blur="onBlur(id)"
    >
      <slot :id="id" />
    </LayoutBlock>

    <p v-if="editing && zone && !entries.length" class="layout-region__empty">{{ emptyText }}</p>
  </component>
</template>

<script setup lang="ts">
import Sortable from "sortablejs";
import { onMounted, onUnmounted, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useKeyboardSort } from "../composables/useKeyboardSort";
import { getBlock } from "../layout/registry";
import LayoutBlock from "./layout-block.vue";
import type { KeyboardSortOrientationType, KeyboardSortSignalType, SalesRepLayoutScopeType } from "../types/layout";

interface IProps {
  scope: SalesRepLayoutScopeType;
  /** Ids of the blocks this half holds, in render order. */
  entries: readonly string[];
  orientation: KeyboardSortOrientationType;
  editing?: boolean;
  /**
   * Groups that accept drops from a sibling list (the stat row's visible/hidden pair). Sharing a
   * name is what makes a cross-zone drag legal; the two widget columns deliberately get distinct
   * names so a rail widget can never be dropped into the wide column.
   */
  group: string;
  /** Element to render as — `aside` for the customer profile's rail, `div` everywhere else. */
  tag?: string;
  /**
   * Blocks are dragged by the whole card rather than by a handle, and carry no hide button — the
   * stat row, per the design. Widgets keep a handle because their headers belong to components the
   * layout does not own.
   */
  dragWhole?: boolean;
  /** Renders the dashed drop-zone frame and an empty-state hint. */
  zone?: boolean;
  /** Hidden state a block takes on when it is dragged in from the paired zone. */
  dropHidden?: boolean;
  emptyText?: string;
}

interface IEmits {
  (event: "reorder", ids: string[]): void;
  (event: "setHidden", id: string, hidden: boolean, index?: number): void;
  (event: "announce", signal: KeyboardSortSignalType): void;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();
const { t } = useI18n();
const container = useTemplateRef<HTMLElement>("container");

/**
 * Put SortableJS's DOM edit back before state drives the re-render. Detaching the node instead
 * (`item.remove()`) breaks Vue's keyed diff: it anchors moves against the elements it treats as
 * stable, and for a move of one slot forward that is the dragged element itself — so Vue anchors
 * against a node no longer in the document, throws `NotFoundError`, and the block disappears.
 *
 * Remove first, then read the child index: computing the reference node before removal shifts it by
 * one when the block moves backwards within its own list. `oldIndex`, not `oldDraggableIndex` — this
 * addresses `children`, which counts every element; the handlers below address `props.entries`.
 */
function restore(event: Sortable.SortableEvent): void {
  event.item.parentNode?.removeChild(event.item);
  event.from.insertBefore(event.item, event.from.children[event.oldIndex ?? 0] ?? null);
}

const titleOf = (id: string) => {
  const block = getBlock(props.scope, id);
  return block ? t(block.titleKey) : id;
};

// A region's axis is structural: the stat row is always horizontal, a widget column always vertical.
// eslint-disable-next-line vue/no-setup-props-reactivity-loss -- structural, read once by design
const axis = props.orientation;

const { isGrabbed, onKeydown, onBlur, release } = useKeyboardSort({
  orientation: axis,
  items: () => [...props.entries],
  // Every block in a zone shares the zone's hidden state, which is what `dropHidden` describes.
  hidden: () => Boolean(props.dropHidden),
  onReorder: (id, index) => {
    const ids = props.entries.filter((candidate) => candidate !== id);
    ids.splice(index, 0, id);
    emit("reorder", ids);
  },
  // Only the stat row can park a block with the arrow keys; widget columns hide via the ✕ button.
  onToggleHidden: axis === "horizontal" ? (id, hidden) => emit("setHidden", id, hidden) : undefined,
  onSignal: (signal) => emit("announce", signal),
});

/**
 * Every move is handled explicitly, and `props.entries` stays the only source of truth.
 *
 * An earlier version let `useSortable` keep its own mirror of the list and watched it back. That mirror
 * was the bug: after a cross-zone drop it could still hold the moved block and emit a stale `reorder`,
 * which the page merged with the freshly-hidden entry — the same block twice, once per half. Sortable
 * is constructed directly so there is no mirror to disagree with state.
 */
let sortable: Sortable | undefined;

// Built at mount, not at setup: every option below reads a prop, and reading them here means there is
// no gap between what the instance is told and what the component currently is.
onMounted(() => {
  if (!container.value) {
    return;
  }

  sortable = new Sortable(container.value, {
    group: props.group,
    // Stat cards drag by the whole card. Widgets drag by their entire header — the design's affordance —
    // with the handle button listed too, since it is overlaid on the header rather than inside it and so
    // would not otherwise match `closest()`.
    handle: props.dragWhole ? undefined : ".vc-widget__header-container, .layout-block__handle",
    // Without this every child counts as an item, including the empty-zone hint paragraph — and the
    // indices below would then not line up with `props.entries`.
    draggable: ".layout-block",
    animation: 150,
    ghostClass: "sortable-ghost",
    dragClass: "sortable-drag",
    disabled: !props.editing,

    // A keyboard grab must not stay live through a pointer drag: Sortable captures its indices at
    // choose time, and a grab cancelled mid-drag reshuffles `entries` under them, dropping the wrong
    // block. `release`, not `cancel` — restoring the position is the reshuffle to avoid.
    onChoose: () => release(),

    // Reorder inside one list, deriving the new order from `props.entries` rather than reading the DOM.
    // The draggable-only indices are the ones that match `props.entries`; `oldIndex`/`newIndex` count
    // every element child, so a non-block child rendered above the blocks would shift them all by one.
    onUpdate: (event: Sortable.SortableEvent) => {
      restore(event);

      const ids = [...props.entries];
      const [moved] = ids.splice(event.oldDraggableIndex ?? 0, 1);
      ids.splice(event.newDraggableIndex ?? 0, 0, moved);
      emit("reorder", ids);
    },

    // A drag that ended in a different list — the stat row's visible/hidden pair. `onEnd` fires once
    // per drag, so this cannot double-apply the way separate onAdd/onRemove handlers did.
    onEnd: (event: Sortable.SortableEvent) => {
      if (event.from === event.to) {
        return; // same-list move, already handled by onUpdate
      }

      // Back into the source list, not the target — state is what moves the block across.
      restore(event);

      const id = event.item.dataset.blockId;
      if (id) {
        // `newDraggableIndex`, not `newIndex`: an empty target zone also renders its hint paragraph.
        emit("setHidden", id, event.to.dataset.dropHidden === "true", event.newDraggableIndex ?? undefined);
      }
    },
  });
});

onUnmounted(() => {
  sortable?.destroy();
  sortable = undefined;
});

// Toggled rather than torn down and rebuilt whenever edit mode flips. No `immediate` — the constructor
// seeds the initial value, and an immediate run would fire before the instance exists.
watch(
  () => props.editing,
  (editing) => {
    sortable?.option("disabled", !editing);
    if (!editing) {
      release();
    }
  },
);
</script>

<style lang="scss">
.layout-region {
  &--vertical {
    @apply flex flex-col gap-5;
  }

  // Flex rather than grid, deliberately. A grid needs its track count up front, which can only come
  // from state — but mid-drag SortableJS has already put the incoming card in the container while
  // state still says otherwise, so the row would keep its old column count and the two cards would
  // stack. Sharing the row between actual children means the preview matches the drop: drag a second
  // card in and the first halves to make room, exactly as it will look once released.
  &--horizontal {
    @apply flex flex-wrap gap-4;

    > * {
      @apply min-w-0 basis-full;
    }

    @media (min-width: theme("screens.sm")) {
      > * {
        // Two per row; the gap is shared between them, hence half of it per card.
        @apply basis-[calc(50%-0.5rem)];
      }
    }

    @media (min-width: theme("screens.xl")) {
      > * {
        // One row, equal shares — hiding a card widens the rest instead of leaving a hole.
        @apply basis-0 grow;
      }
    }
  }

  // Extra room for the chrome, which would otherwise overlap a widget's own header controls.
  &--editing {
    @apply pt-1;
  }

  &--zone {
    @apply rounded-md border border-dashed border-neutral-300 bg-neutral-50 p-3;
  }

  &__empty {
    @apply m-0 flex min-h-24 basis-full items-center justify-center text-center text-sm text-neutral-400;
  }

  // The hint is driven by state, but mid-drag SortableJS has already parked the dragged node in this
  // container while the zone is still empty as far as state is concerned — so "drag a stat here"
  // would sit above the card you are dropping. Hide it the moment the container actually holds one.
  &:has(.layout-block) &__empty {
    @apply hidden;
  }
}
</style>

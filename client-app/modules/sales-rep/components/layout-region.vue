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
import { WIDGET_DRAG_HANDLE_SELECTOR } from "../constants";
import { getBlock } from "../layout/registry";
import LayoutBlock from "./layout-block.vue";
import type { KeyboardSortOrientationType, KeyboardSortSignalType, SalesRepLayoutScopeType } from "../types/layout";

interface IProps {
  scope: SalesRepLayoutScopeType;
  /** Ids of the blocks this half holds, in render order. */
  entries: readonly string[];
  orientation: KeyboardSortOrientationType;
  editing?: boolean;
  /** Shared name = cross-zone drags allowed. The two widget columns get distinct names on purpose. */
  group: string;
  /** Element to render as — `aside` for the customer profile's rail, `div` everywhere else. */
  tag?: string;
  /** Whole-card drag, no hide button — the stat row. Widgets use a handle instead. */
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
 * Undo SortableJS's DOM edit so state drives the re-render. Detaching instead (`item.remove()`) makes
 * Vue anchor a move against a node no longer in the document — `NotFoundError`, block gone.
 *
 * Remove before reading the child index, or a backwards move is off by one. `oldIndex` addresses
 * `children`; the handlers below address `props.entries`.
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

// Constructed directly rather than via `useSortable`: its internal mirror of the list could emit a
// stale `reorder` after a cross-zone drop, landing the same block in both halves.
let sortable: Sortable | undefined;

// At mount, not setup: every option below reads a prop.
onMounted(() => {
  if (!container.value) {
    return;
  }

  sortable = new Sortable(container.value, {
    group: props.group,
    // The handle button is listed too: it is overlaid on the header, not inside it, so it would not
    // otherwise match `closest()`.
    handle: props.dragWhole ? undefined : WIDGET_DRAG_HANDLE_SELECTOR,
    // Otherwise the empty-zone hint counts as an item and the indices stop matching `props.entries`.
    draggable: ".layout-block",
    animation: 150,
    ghostClass: "sortable-ghost",
    dragClass: "sortable-drag",
    disabled: !props.editing,

    // SortableJS defaults to `delay: 0` and preventDefaults every touchmove once a tap registers, so
    // a swipe starting on a card drags instead of scrolling. `delayOnTouchOnly` exempts the mouse.
    delay: 200,
    delayOnTouchOnly: true,
    touchStartThreshold: 5,

    // Sortable captures indices at choose time, so a grab cancelled mid-drag reshuffles `entries`
    // under them and drops the wrong block. `release`, not `cancel` — the restore is the reshuffle.
    onChoose: () => release(),

    // Derived from `props.entries`, not the DOM. The draggable-only indices are the ones that match it.
    onUpdate: (event: Sortable.SortableEvent) => {
      restore(event);

      const ids = [...props.entries];
      const [moved] = ids.splice(event.oldDraggableIndex ?? 0, 1);
      ids.splice(event.newDraggableIndex ?? 0, 0, moved);
      emit("reorder", ids);
    },

    // Cross-zone. `onEnd` fires once per drag, unlike separate onAdd/onRemove which double-applied.
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

// Toggled rather than rebuilt. No `immediate` — the constructor seeds it, and an immediate run would
// fire before the instance exists.
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

  // Flex, not grid: a grid's track count comes from state, which lags the card SortableJS has already
  // put in the container mid-drag — so the preview would not match the drop.
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

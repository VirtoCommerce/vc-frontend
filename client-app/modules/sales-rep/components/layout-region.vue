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
      v-for="entry in entries"
      :key="entry.id"
      :block-id="entry.id"
      :title="titleOf(entry.id)"
      :editing="editing"
      :grabbed="isGrabbed(entry.id)"
      :drag-whole="dragWhole"
      @hide="$emit('setHidden', entry.id, !entry.hidden)"
      @handle-keydown="onKeydown($event, entry.id)"
      @handle-blur="onBlur(entry.id)"
    >
      <slot :entry="entry" />
    </LayoutBlock>

    <p v-if="editing && zone && !entries.length" class="layout-region__empty">{{ emptyText }}</p>
  </component>
</template>

<script setup lang="ts">
import { insertNodeAt, removeNode, useSortable } from "@vueuse/integrations/useSortable";
import { computed, ref, useTemplateRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useKeyboardSort } from "../composables/useKeyboardSort";
import { getBlock } from "../layout/registry";
import LayoutBlock from "./layout-block.vue";
import type {
  KeyboardSortOrientationType,
  KeyboardSortSignalType,
  SalesRepLayoutEntryType,
  SalesRepLayoutScopeType,
} from "../types/layout";
import type Sortable from "sortablejs";

interface IProps {
  scope: SalesRepLayoutScopeType;
  entries: SalesRepLayoutEntryType[];
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
 * `oldIndex` here, not `oldDraggableIndex`: this addresses the DOM, and `insertNodeAt` indexes
 * `children`, which counts every element. The handlers below address `props.entries` and so need the
 * draggable-only indices instead.
 */
function restore(event: Sortable.SortableEvent): void {
  removeNode(event.item);
  insertNodeAt(event.from, event.item, event.oldIndex ?? 0);
}

const titleOf = (id: string) => {
  const block = getBlock(props.scope, id);
  return block ? t(block.titleKey) : id;
};

/**
 * Every move is handled explicitly, and `props.entries` stays the only source of truth.
 *
 * The earlier version kept a local mirror of the list for useSortable to mutate and watched it back.
 * That mirror was the bug: after a cross-zone drop it could still hold the moved block and emit a
 * stale `reorder`, which the page then merged with the freshly-hidden entry — putting the same block
 * in the region twice, once visible and once hidden. (It was also watched without `deep`, while
 * useSortable splices in place, so same-list reorders could go unnoticed entirely.)
 *
 * So `onUpdate` is overridden rather than left to useSortable, and the throwaway list below is never
 * read or written. Both handlers put SortableJS's DOM edit back and let state drive the re-render.
 */

// Only here to satisfy useSortable's signature; overriding `onUpdate` means it is never touched.
const unusedSortableList = ref<SalesRepLayoutEntryType[]>([]);

// A region never changes which Sortable group it belongs to, and Sortable reads it once anyway.
// eslint-disable-next-line vue/no-setup-props-reactivity-loss -- structural, read once by design
const sortableGroup = props.group;

// Stat cards drag by the whole card. Widgets drag by their entire header — the design's affordance —
// with the handle button listed too, since it is overlaid on the header rather than inside it and so
// would not otherwise match `closest()`.
// eslint-disable-next-line vue/no-setup-props-reactivity-loss -- structural, read once by design
const dragHandle = props.dragWhole ? undefined : ".vc-widget__header-container, .layout-block__handle";

// Seeded from the current mode, NOT hard-coded true: the hidden zone is mounted by `v-if` when
// editing is already on, and useSortable only builds its instance on mount — so the watch below has
// nothing to talk to on its first run and would leave that zone disabled forever. The watch below
// tracks every later change.
const initiallyDisabled = !props.editing;

const { option } = useSortable(container, unusedSortableList, {
  group: sortableGroup,
  handle: dragHandle,
  // Without this every child counts as an item, including the empty-zone hint paragraph — and the
  // indices below would then not line up with `props.entries`.
  draggable: ".layout-block",
  animation: 150,
  ghostClass: "sortable-ghost",
  dragClass: "sortable-drag",
  disabled: initiallyDisabled,

  // Reorder inside one list, deriving the new order from `props.entries` rather than reading the DOM.
  // The draggable-only indices are the ones that match `props.entries`; `oldIndex`/`newIndex` count
  // every element child, so a non-block child rendered above the blocks would shift them all by one.
  onUpdate: (event: Sortable.SortableEvent) => {
    restore(event);

    const ids = props.entries.map((entry) => entry.id);
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

// A region's axis is structural: the stat row is always horizontal, a widget column always vertical.
// eslint-disable-next-line vue/no-setup-props-reactivity-loss -- structural, read once by design
const axis = props.orientation;

const { isGrabbed, onKeydown, onBlur, release } = useKeyboardSort({
  orientation: axis,
  items: () => props.entries.map((entry) => entry.id),
  // Every block in a zone shares the zone's hidden state, which is what `dropHidden` describes.
  hidden: () => Boolean(props.dropHidden),
  onReorder: (id, index) => {
    const ids = props.entries.map((entry) => entry.id).filter((candidate) => candidate !== id);
    ids.splice(index, 0, id);
    emit("reorder", ids);
  },
  // Only the stat row can park a block with the arrow keys; widget columns hide via the ✕ button.
  onToggleHidden: axis === "horizontal" ? (id, hidden) => emit("setHidden", id, hidden) : undefined,
  onSignal: (signal) => emit("announce", signal),
});

// Sortable is created once and toggled, rather than torn down and rebuilt whenever edit mode flips.
// No `immediate` — the constructor seeds the initial value, and an immediate run would fire before
// the instance exists.
watch(
  () => props.editing,
  (editing) => {
    option("disabled", !editing);
    if (!editing) {
      release();
    }
  },
);

const emptyText = computed(() => props.emptyText ?? "");
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

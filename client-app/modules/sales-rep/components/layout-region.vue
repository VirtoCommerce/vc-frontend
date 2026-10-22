<template>
  <VcSortable
    :model-value="[...entries]"
    :tag="tag ?? 'div'"
    :class="['layout-region', `layout-region--${orientation}`, { 'layout-region--zone': editing && zone }]"
    :name="zoneName"
    :group="group"
    :list-order="listOrder"
    :orientation="orientation"
    :disabled="!editing"
    :with-live-region="false"
    drop-on-list-change
    :handle="dragWhole ? undefined : WIDGET_DRAG_HANDLE_SELECTOR"
    :filter="dragWhole ? undefined : WIDGET_DRAG_FILTER_SELECTOR"
    @update:model-value="$emit('reorder', $event)"
    @move="onMove"
    @announce="onAnnounce"
    @release="onRelease"
  >
    <template #item="{ item: id, attrs }">
      <LayoutBlock
        v-bind="attrs"
        :block-id="id"
        :title="titleOf(id)"
        :editing="editing"
        :drag-whole="dragWhole"
        @hide="$emit('setHidden', id, !dropHidden)"
      >
        <slot :id="id" :title="titleOf(id)" />
      </LayoutBlock>
    </template>

    <!-- Always rendered while the zone is live; CSS hides it whenever the container holds a card. State
         only changes on drop, so gating on `entries` left the zone blank until then. -->
    <template #after>
      <div v-if="editing && zone" class="layout-region__empty">{{ emptyText }}</div>
    </template>
  </VcSortable>
</template>

<script setup lang="ts">
import { computed } from "vue";
// Imported, not global: this module's specs mount it without the ui-kit plugin.
import { VcSortable } from "@/ui-kit/components";
import { useBlockTitle } from "../composables/useBlockTitle";
import { WIDGET_DRAG_FILTER_SELECTOR, WIDGET_DRAG_HANDLE_SELECTOR } from "../constants";
import LayoutBlock from "./layout-block.vue";
import type { KeyboardSortOrientationType, KeyboardSortSignalType, SalesRepLayoutScopeType } from "../types/layout";
import type { SortableMovePayloadType, SortableReleasePayloadType, SortableSignalType } from "@/ui-kit/composables";

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
  /** A card of this half is keyboard-held, or no longer is. A pointer drag does not count. */
  (event: "heldChange", held: boolean): void;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();
const { titleOf } = useBlockTitle(() => props.scope);

// Named by the half of the region it holds: that is all a cross-zone move changes.
const VISIBLE_ZONE = "visible";
const HIDDEN_ZONE = "hidden";

// Set by the keyboard grab only: `announce` reports keyboard steps, while `grab` fires for a pointer drag too.
let heldId: string | undefined;

const zoneName = computed(() => (props.dropHidden ? HIDDEN_ZONE : VISIBLE_ZONE));

// Only the stat row can park a block with the arrow keys; widget columns hide via the ✕ button.
const listOrder = computed(() => (props.orientation === "horizontal" ? [VISIBLE_ZONE, HIDDEN_ZONE] : undefined));

function onMove({ id, to, index }: SortableMovePayloadType): void {
  emit("setHidden", id, to === HIDDEN_ZONE, index);
}

function onRelease({ id }: SortableReleasePayloadType): void {
  if (id === heldId) {
    heldId = undefined;
    emit("heldChange", false);
  }
}

function onAnnounce(signal: SortableSignalType): void {
  switch (signal.kind) {
    case "grabbed":
      heldId = signal.id;
      emit("heldChange", true);
      emit("announce", {
        kind: "grabbed",
        id: signal.id,
        index: signal.index,
        total: signal.total,
        parkable: signal.canChangeList,
      });
      break;
    case "movedList":
      emit("announce", { kind: signal.to === HIDDEN_ZONE ? "parked" : "restored", id: signal.id });
      break;
    // A park key pointing at the zone the card is already in does nothing, and says nothing.
    case "noTarget":
      break;
    default:
      emit("announce", signal);
  }
}
</script>

<style lang="scss">
.layout-region {
  &--vertical {
    @apply flex flex-col gap-5;
  }

  // Flex, not grid: a grid's track count comes from state, which lags the card SortableJS has already
  // put in the container mid-drag. `grow basis-44` is the flex equivalent of the fixed row's
  // `repeat(auto-fit, minmax(11rem, 1fr))`, so wrapping stays count-agnostic.
  &--horizontal {
    @apply flex flex-wrap gap-4;

    > * {
      @apply min-w-0 grow basis-44;
    }
  }

  // The band is padding, so a release on it hits the zone: one outside every list is reverted. The
  // negative margin gives it back — the row would otherwise narrow by 24px on entering edit mode, which
  // is enough to wrap the sixth stat card (six need 1136px, five 944px) and shift the rest. A consumer's
  // background image starts at the content box, and the inset shadow paints the band over it, so a
  // hatched zone looks as it did with the band outside.
  &--zone {
    --layout-zone-band: theme("padding.3");

    @apply m-[calc(-1*var(--layout-zone-band))] p-[--layout-zone-band] rounded-[calc(var(--vc-radius)+var(--layout-zone-band))] bg-neutral-50 outline-dashed outline-1 outline-neutral-300;

    background-origin: content-box;
    box-shadow: inset 0 0 0 var(--layout-zone-band) var(--color-neutral-50);
  }

  &__empty {
    @apply flex min-h-24 basis-full items-center justify-center text-center text-sm text-neutral-400;
  }

  // Not a `v-if`: Sortable moves a card in mid-drag, so `entries` only changes on drop.
  &__empty:not(:only-child) {
    @apply hidden;
  }
}
</style>

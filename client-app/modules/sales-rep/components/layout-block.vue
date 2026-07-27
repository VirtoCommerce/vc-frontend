<template>
  <!-- `data-block-id` lets a cross-zone drop identify the block from the raw DOM node SortableJS
       hands back, without keeping a parallel element-to-id map. -->
  <div
    :data-block-id="blockId"
    :class="[
      'layout-block',
      { 'layout-block--editing': editing, 'layout-block--grabbed': grabbed, 'layout-block--whole': dragWhole },
    ]"
    v-bind="wholeHandleAttrs"
  >
    <!--
      Widgets: the chrome is laid over the widget's own header — handle at the start, hide at the end
      — because those headers belong to components the layout does not own and cannot be slotted into
      from here. Stat cards take the whole-block treatment instead: per the design they are dragged by
      the card itself and cannot be hidden with a ✕, only parked in the unused zone.
    -->
    <div v-if="editing && !dragWhole" class="layout-block__chrome">
      <button
        type="button"
        class="layout-block__handle"
        :aria-label="t('sales_rep.hub.layout.a11y.reorder', { title })"
        :aria-pressed="grabbed"
        @keydown="$emit('handleKeydown', $event)"
        @blur="$emit('handleBlur')"
      >
        <VcIcon name="switch-vertical" :size="16" />
      </button>

      <button
        type="button"
        class="layout-block__hide"
        :aria-label="t('sales_rep.hub.layout.a11y.hide', { title })"
        @click="$emit('hide')"
      >
        <VcIcon name="x" :size="16" />
      </button>
    </div>

    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

interface IProps {
  blockId: string;
  /** Localized block name — used in the handle and hide button labels. */
  title: string;
  editing?: boolean;
  /** Held by the keyboard sorter; renders the same treatment as a pointer drag. */
  grabbed?: boolean;
  /**
   * The whole block is the drag handle and it carries no chrome (stat cards). Since there is no
   * handle button to focus, the block itself becomes the keyboard control while editing.
   */
  dragWhole?: boolean;
}

interface IEmits {
  (event: "hide"): void;
  (event: "handleKeydown", payload: KeyboardEvent): void;
  (event: "handleBlur"): void;
}

const emit = defineEmits<IEmits>();
const props = defineProps<IProps>();
const { t } = useI18n();

// With no handle button to focus, the card itself has to be the control — but only while editing,
// so it stays out of the tab order on a normal page view. Role, tabindex and the listeners are bound
// together rather than as separate template attributes, so the element is never interactive without
// also being announced as a control.
const wholeHandleAttrs = computed(() =>
  props.dragWhole && props.editing
    ? {
        tabindex: 0,
        role: "button",
        "aria-label": t("sales_rep.hub.layout.a11y.reorder", { title: props.title }),
        "aria-pressed": props.grabbed,
        onKeydown: (event: KeyboardEvent) => emit("handleKeydown", event),
        onBlur: () => emit("handleBlur"),
      }
    : {},
);
</script>

<style lang="scss">
// `@apply` keeps the module self-contained as an MF remote (no global utility layer). See PORT_TO_MF.md.
.layout-block {
  @apply relative;

  // Dashed outline rather than a border so the block's own box model is untouched in edit mode.
  // The radius matters: an outline only follows rounded corners if the element itself is rounded,
  // and this wrapper is otherwise square — without it the outline boxes a rounded card in sharp
  // corners. `--vc-radius` is what the card and VcWidget use, so the two stay concentric.
  &--editing {
    @apply rounded-[--vc-radius] outline-dashed outline-1 outline-offset-2 outline-neutral-300 transition-opacity;
  }

  // Stat cards: the card is the handle, so the grab cursor and the selection guard go on the block
  // itself rather than on a chrome button.
  &--whole#{&}--editing {
    @apply cursor-grab select-none;

    &:active {
      @apply cursor-grabbing;
    }

    &:focus-visible {
      @apply outline-2 outline-primary-500;
    }

    &[aria-pressed="true"] {
      @apply outline-2 outline-primary-500 ring-2 ring-primary-200;
    }
  }

  // Matches the pointer-drag treatment; also applied while a keyboard sort holds the block.
  &--grabbed {
    @apply opacity-45 outline-primary-500;

    box-shadow: 0 12px 28px -8px rgb(0 0 0 / 0.3);
  }

  // Widget chrome sits over the widget's own header rather than floating in the corner: handle at
  // the start, hide at the end, matching the design. VcWidget's `--header-min-h` / `--p-x` live on
  // `.vc-widget` itself, so they cannot be inherited from this parent — the md values are mirrored
  // here instead, which is safe because every registered widget renders at `size="md"`.
  &__chrome {
    @apply pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between;

    height: 3.125rem; // VcWidget --header-min-h, size md
    padding-inline: theme("padding.4"); // VcWidget --p-x, size md

    @media (min-width: theme("screens.sm")) {
      padding-inline: theme("padding.6");
    }

    // The bar itself must not swallow drags aimed at the header underneath it.
    > * {
      @apply pointer-events-auto;
    }
  }

  // The whole header is the drag surface, so the title has to step aside for the two controls.
  &--editing:not(#{&}--whole) {
    .vc-widget__header-container {
      @apply cursor-grab select-none;

      &:active {
        @apply cursor-grabbing;
      }
    }

    .vc-widget__header {
      @apply ps-12 pe-12 sm:ps-14 sm:pe-14;
    }
  }

  &__handle,
  &__hide {
    @apply flex size-7 items-center justify-center rounded transition-colors;
  }

  &__handle {
    @apply cursor-grab text-secondary-500;

    &:hover {
      @apply bg-neutral-100;
    }

    &:active {
      @apply cursor-grabbing;
    }

    // The keyboard-grabbed state has no prototype equivalent — a persistent ring stands in for the
    // "I am holding this" feedback a pointer user gets from the cursor.
    &[aria-pressed="true"] {
      @apply text-primary-500 ring-2 ring-primary-200;
    }
  }

  &__hide {
    @apply text-neutral-500;

    &:hover {
      @apply bg-danger-50 text-danger-500;
    }
  }
}

// SortableJS states. The prototype faded the source element because native HTML5 drag gives no
// placeholder; with a real one, the gap carries the affordance and the clone stays solid.
.layout-block.sortable-ghost {
  @apply rounded-[--vc-radius] bg-primary-50 opacity-100 outline-dashed outline-1 outline-offset-2 outline-primary-500;

  > *:not(.layout-block__chrome) {
    @apply invisible;
  }
}

.layout-block.sortable-drag {
  @apply opacity-100;
}
</style>

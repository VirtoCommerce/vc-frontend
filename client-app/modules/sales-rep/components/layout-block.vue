<template>
  <div
    :data-block-id="blockId"
    :class="[
      'layout-block',
      { 'layout-block--editing': editing, 'layout-block--grabbed': grabbed, 'layout-block--whole': dragWhole },
    ]"
    v-bind="wholeHandleAttrs"
  >
    <!-- Keep one root node: a root sibling makes this a fragment, and SortableJS moves only the
         element, so Vue loses track of it and leaves a duplicate behind. Stat cards get no chrome —
         they drag by the card and park in the paired zone rather than hiding with a ✕. -->
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
  /** Whole block is the handle (stat cards), so the block itself is the keyboard control. */
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

// Bound as one object so the card is never focusable without also being announced as a button, and
// only while editing — otherwise it sits in the tab order on an ordinary page view.
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
.layout-block {
  // VcWidget declares `--header-min-h` / `--p-x` on itself, so the chrome — its sibling — cannot
  // inherit them. Mirrored here for size md, which every registered widget uses.
  --layout-block-header-h: 3.125rem;
  --layout-block-header-p: theme("padding.4");
  --layout-block-control: theme("spacing.7");
  // The header's own text has to clear one control on each side.
  --layout-block-header-inset: calc(var(--layout-block-header-p) + var(--layout-block-control) + theme("spacing.1"));

  @apply relative;

  @media (min-width: theme("screens.sm")) {
    --layout-block-header-p: theme("padding.6");
  }

  // Outline, not border, so the box model is untouched. Rounded because an outline only follows
  // corners the element itself has.
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

  // Overlaid on the widget's own header: handle at the start, hide at the end.
  &__chrome {
    @apply pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between;

    height: var(--layout-block-header-h);
    padding-inline: var(--layout-block-header-p);

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
      padding-inline: var(--layout-block-header-inset);
    }
  }

  &__handle,
  &__hide {
    @apply flex items-center justify-center rounded transition-colors;

    width: var(--layout-block-control);
    height: var(--layout-block-control);
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

// `sortable-ghost` lands on the dragged element, which Sortable moves to the insertion point — so it
// previews what will land there. Faded, not an empty slot, matching `--grabbed`.
.layout-block.sortable-ghost {
  @apply rounded-[--vc-radius] opacity-45 outline-dashed outline-1 outline-offset-2 outline-primary-500;
}

// The clone under the pointer stays solid, so the card being carried reads as the real one.
.layout-block.sortable-drag {
  @apply opacity-100;
}
</style>

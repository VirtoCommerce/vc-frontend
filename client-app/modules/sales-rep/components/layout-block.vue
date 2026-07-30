<template>
  <div
    :data-block-id="blockId"
    :class="[
      'layout-block',
      { 'layout-block--editing': editing, 'layout-block--grabbed': grabbed, 'layout-block--whole': dragWhole },
    ]"
    v-bind="wholeHandleAttrs"
  >
    <!-- Keep one root node, comments included: a root sibling makes this a fragment, and SortableJS
         moves only the element, so Vue loses track of it and leaves a duplicate behind. -->
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { provideBlockChrome } from "../composables/useBlockChrome";

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

// One object, so the card is never focusable without also being announced as a button — and only while
// editing, or it sits in the tab order on an ordinary page view.
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

// Offered to whatever the slot renders; `layout-widget.vue` picks it up. Stat cards drag whole and park
// in the paired zone, so they take neither control.
provideBlockChrome({
  draggable: computed(() => Boolean(props.editing) && !props.dragWhole),
  grabbed: computed(() => Boolean(props.grabbed)),
  title: computed(() => props.title),
  hide: () => emit("hide"),
  handleKeydown: (event: KeyboardEvent) => emit("handleKeydown", event),
  handleBlur: () => emit("handleBlur"),
});
</script>

<style lang="scss">
.layout-block {
  $self: &;

  @apply relative;

  // Outline, not border, so the box model is untouched.
  &--editing {
    @apply rounded-[--vc-radius] outline-dashed outline-1 outline-offset-2 outline-neutral-300 transition-opacity;
  }

  // Stat cards: the card itself is the handle.
  &--whole#{$self}--editing {
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

  // `shadow-xl`, not a literal: the theme's shadows are built on `--color-additional-950`, near-white in
  // dark mode, so a hardcoded black one would be the only shadow not inverting.
  &--grabbed {
    @apply opacity-45 shadow-xl outline-primary-500;
  }

  // Sortable moves the dragged element to the insertion point, so this previews what will land there.
  &.sortable-ghost {
    @apply rounded-[--vc-radius] opacity-45 outline-dashed outline-1 outline-offset-2 outline-primary-500;
  }

  // The clone under the pointer stays solid, so what is carried reads as the real card.
  &.sortable-drag {
    @apply opacity-100;
  }
}
</style>

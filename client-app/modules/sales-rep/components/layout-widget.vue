<template>
  <VcWidget :class="['layout-widget', { 'layout-widget--draggable': draggable }]" :title="heading" :size="size">
    <!-- Through VcWidget's own header slots, so placement comes from its padding instead of metrics
         mirrored outside it. -->
    <template v-if="draggable" #prepend>
      <button
        type="button"
        class="layout-widget__handle"
        :aria-label="t('sales_rep.hub.layout.a11y.reorder', { title: chrome?.title.value })"
        :aria-pressed="chrome?.grabbed.value"
        @keydown="chrome?.handleKeydown($event)"
        @blur="chrome?.handleBlur()"
      >
        <VcIcon name="switch-vertical" :size="16" />
      </button>
    </template>

    <!-- Composed, not replaced: a widget's own header content (the orders "View all" link) stays put. -->
    <template v-if="draggable || $slots.append" #append>
      <slot name="append" />

      <button
        v-if="draggable"
        type="button"
        class="layout-widget__hide"
        :aria-label="t('sales_rep.hub.layout.a11y.hide', { title: chrome?.title.value })"
        @click="chrome?.hide()"
      >
        <VcIcon name="x" :size="16" />
      </button>
    </template>

    <template v-if="$slots['default-container']" #default-container>
      <slot name="default-container" />
    </template>

    <template v-if="$slots.default" #default>
      <slot />
    </template>
  </VcWidget>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { stopBlockChrome, useBlockChrome } from "../composables/useBlockChrome";

interface IProps {
  title?: string;
  /** Mirrors VcWidget's own union — its props are not exported. */
  size?: "xs" | "sm" | "md" | "lg";
}

// `collapsible` is deliberately not forwarded: VcWidget then renders its header container as a
// `<button>`, and the controls above would nest buttons inside it.
const props = withDefaults(defineProps<IProps>(), {
  title: undefined,
  size: "md",
});

const { t } = useI18n();

// Absent outside a layout region — then this is a plain VcWidget.
const chrome = useBlockChrome();
const draggable = computed(() => chrome?.draggable.value ?? false);

stopBlockChrome();

// VcWidget renders no header without a title, and the controls live in that header — so a widget that
// set none of its own would be silently undraggable and unhideable.
const heading = computed(() => props.title ?? chrome?.title.value);
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.layout-widget {
  --layout-widget-control: theme("spacing.7");

  // On the root, so it covers the header without a rule aimed at a VcWidget class.
  &--draggable {
    @apply select-none;
  }

  &__handle {
    @apply flex cursor-grab items-center justify-center rounded-[--vc-radius] text-secondary-500 transition-colors;

    width: var(--layout-widget-control);
    height: var(--layout-widget-control);

    &:hover {
      @apply bg-neutral-100;
    }

    &:active {
      @apply cursor-grabbing;
    }

    // The only keyboard route into reordering, so focus has to be legible and distinct from grabbed.
    &:focus-visible {
      @apply outline-2 outline-offset-1 outline-primary-500;
    }

    // Stands in for the "I am holding this" feedback a pointer user gets from the cursor.
    &[aria-pressed="true"] {
      @apply text-primary-500 ring-2 ring-primary-200;
    }
  }

  &__hide {
    @apply flex items-center justify-center rounded-[--vc-radius] text-neutral-500 transition-colors;

    width: var(--layout-widget-control);
    height: var(--layout-widget-control);

    &:hover {
      @apply bg-danger-50 text-danger-500;
    }
  }
}
</style>

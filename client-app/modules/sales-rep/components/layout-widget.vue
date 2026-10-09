<template>
  <VcWidget :class="['layout-widget', { 'layout-widget--draggable': draggable }]" :title="heading" :size="size">
    <!-- Through VcWidget's own header slots, so placement comes from its padding instead of metrics
         mirrored outside it. -->
    <template v-if="draggable" #prepend>
      <VcButton
        class="layout-widget__handle"
        :aria-label="t('sales_rep.hub.layout.a11y.reorder', { title: chrome?.title.value })"
        :aria-pressed="chrome?.grabbed.value"
        icon="switch-vertical"
        icon-size="1rem"
        size="xs"
        color="secondary"
        variant="ghost"
        @keydown="chrome?.handleKeydown($event)"
        @blur="chrome?.handleBlur()"
      />
    </template>

    <!-- Composed, not replaced: a widget's own header content (the orders "View all" link) stays put —
         except where the rows field takes its place, which is the only combination that overflows a
         narrow header. -->
    <template v-if="draggable || $slots.append" #append>
      <slot v-if="!rowsSetting" name="append" />

      <!-- Generic: any block whose registry entry declares a row cap gets this, no per-widget code.
           `.layout-widget__rows` is in the drag filter, or a mousedown here would start a drag. -->
      <LayoutRowsInput
        v-if="rowsSetting && chrome"
        class="layout-widget__rows"
        :model-value="chrome.settings.value.maxRows ?? rowsSetting.default"
        :setting="rowsSetting"
        :title="chrome.title.value"
        @update:model-value="chrome.updateSettings({ maxRows: $event })"
      />

      <VcButton
        v-if="draggable"
        class="layout-widget__hide"
        :aria-label="t('sales_rep.hub.layout.a11y.hide', { title: chrome?.title.value })"
        icon="x"
        icon-size="1rem"
        size="xs"
        color="neutral"
        variant="ghost"
        @click="chrome?.hide()"
      />
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
import LayoutRowsInput from "./layout-rows-input.vue";

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

// Only while editing: outside it the header is the widget's own, and a row cap is not something to
// change in passing.
const rowsSetting = computed(() => (chrome?.editing.value ? chrome.maxRows.value : undefined));

stopBlockChrome();

// VcWidget renders no header without a title, and the controls live in that header — so a widget that
// set none of its own would be silently undraggable and unhideable.
const heading = computed(() => props.title ?? chrome?.title.value);
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
// Both controls are VcButtons, so box, colors and focus ring come from the kit. What is left here is
// only what a button has no prop for: the grab cursor, the grabbed state, and the hide button's intent.
.layout-widget {
  // On the root, so it covers the header without a rule aimed at a VcWidget class.
  &--draggable {
    @apply select-none;
  }

  &__handle {
    @apply cursor-grab;

    &:active {
      @apply cursor-grabbing;
    }

    // Stands in for the "I am holding this" feedback a pointer user gets from the cursor.
    &[aria-pressed="true"] {
      --vc-icon-color: var(--color-primary-500);

      @apply ring-2 ring-primary-200;
    }
  }

  // Reversible — the widget comes back from the tray — so danger reads on hover only.
  &__hide:hover {
    --vc-icon-color: var(--color-danger-500);
  }
}
</style>

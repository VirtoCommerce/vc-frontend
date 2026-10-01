<template>
  <VcWidget class="layout-widget" :title="heading" :size="size">
    <!-- Through VcWidget's own header slots, so placement comes from its padding instead of metrics
         mirrored outside it. -->
    <template v-if="handleAttrs" #prepend>
      <VcButton
        v-bind="handleAttrs"
        class="layout-widget__handle"
        :aria-label="t('sales_rep.hub.layout.a11y.reorder', { title: block?.title.value })"
        icon="switch-vertical"
        icon-size="1rem"
        size="xs"
        color="secondary"
        variant="ghost"
      />
    </template>

    <!-- Composed, not replaced: a widget's own header content (the orders "View all" link) stays put —
         except where the rows field takes its place, which is the only combination that overflows a
         narrow header. -->
    <template v-if="handleAttrs || $slots.append" #append>
      <slot v-if="!rowsSetting" name="append" />

      <!-- Generic: any block whose registry entry declares a row cap gets this, no per-widget code.
           `.layout-widget__rows` is in the drag filter, or a mousedown here would start a drag. -->
      <LayoutRowsInput
        v-if="rowsSetting && settings"
        class="layout-widget__rows"
        :model-value="settings.settings.value.maxRows ?? rowsSetting.default"
        :setting="rowsSetting"
        :title="block?.title.value ?? ''"
        @update:model-value="settings.updateSettings({ maxRows: $event })"
      />

      <VcButton
        v-if="handleAttrs"
        class="layout-widget__hide"
        :aria-label="t('sales_rep.hub.layout.a11y.hide', { title: block?.title.value })"
        icon="x"
        icon-size="1rem"
        size="xs"
        color="neutral"
        variant="ghost"
        @click="block?.hide()"
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
import { useSortableItem } from "@/ui-kit/composables";
import { provideBlockSettings, useBlockSettings } from "../composables/useBlockSettings";
import { useLayoutBlock } from "../composables/useLayoutBlock";
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

// Absent outside a layout region — then this is a plain VcWidget. Consumed, so a widget nested inside
// this one's slot finds none and renders no second set of controls.
const item = useSortableItem();
const block = item ? useLayoutBlock() : undefined;
const settings = item ? useBlockSettings() : undefined;

// The whole block is this widget's now, so a content widget nested in its slot reads no block settings.
provideBlockSettings(undefined);

// Null outside edit mode, and for stat cards, which drag whole.
const handleAttrs = computed(() => item?.handleAttrs.value ?? null);

// Only while editing: outside it the header is the widget's own, and a row cap is not something to
// change in passing.
const rowsSetting = computed(() => (settings?.editing.value ? settings.maxRows.value : undefined));

// VcWidget renders no header without a title, and the controls live in that header — so a widget that
// set none of its own would be silently undraggable and unhideable.
const heading = computed(() => props.title ?? block?.title.value);
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
// Both controls are VcButtons and the drag states come from VcSortable; what is left here is the icon inks,
// set through VcButton's own variables.
.layout-widget {
  // Held: the icon takes the drag accent, as a pointer user's grabbing cursor would. The key follows the
  // handle's `variant="ghost"` + `color="secondary"`.
  &__handle[aria-pressed="true"] {
    --vc-button-ghost-secondary-icon: var(--vc-sortable-accent-color);
  }

  // Reversible — the widget comes back from the tray — so danger reads on hover only.
  &__hide:hover {
    --vc-icon-color: var(--color-danger-500);
  }
}
</style>

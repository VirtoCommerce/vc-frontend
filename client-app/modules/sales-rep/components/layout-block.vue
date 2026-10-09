<template>
  <div
    :data-block-id="blockId"
    :class="['layout-block', { 'layout-block--editing': editing }]"
    :aria-label="dragWhole && editing ? t('sales_rep.hub.layout.a11y.reorder', { title }) : undefined"
  >
    <!-- Keep one root node, comments included: a root sibling makes this a fragment, and SortableJS
         moves only the element, so Vue loses track of it and leaves a duplicate behind. -->
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { provideBlockSettings } from "../composables/useBlockSettings";
import { provideLayoutBlock } from "../composables/useLayoutBlock";
import { useLayoutSettings } from "../composables/useLayoutSettings";
import type { SalesRepBlockSettingsType } from "../types/layout";

// The drag attributes arrive from the region's VcSortable slot and fall through onto the root.
interface IProps {
  blockId: string;
  /** Localized block name — used in the handle and hide button labels. */
  title: string;
  editing?: boolean;
  /** Whole block is the handle (stat cards), so the block itself is the keyboard control. */
  dragWhole?: boolean;
}

interface IEmits {
  (event: "hide"): void;
}

const emit = defineEmits<IEmits>();

const props = defineProps<IProps>();

const NO_SETTINGS: SalesRepBlockSettingsType = { hiddenTabs: [] };

const { t } = useI18n();

// The surface owns the draft and the registry; this block only knows its own id, so its slice of both
// is resolved here.
const layoutSettings = useLayoutSettings();

// Offered to whatever the slot renders; stat cards take neither.
provideLayoutBlock({
  title: computed(() => props.title),
  hide: () => emit("hide"),
});

provideBlockSettings({
  editing: computed(() => Boolean(props.editing)),
  settings: computed(() => layoutSettings?.valuesOf(props.blockId) ?? NO_SETTINGS),
  savedSettings: computed(() => layoutSettings?.savedValuesOf(props.blockId) ?? NO_SETTINGS),
  maxRows: computed(() => layoutSettings?.maxRowsOf(props.blockId)),
  updateSettings: (patch) => layoutSettings?.update(props.blockId, patch),
});
</script>

<style lang="scss">
.layout-block {
  @apply relative;

  // Outline, not border, so the box model is untouched. The drag states recolour it from the ui-kit.
  &--editing {
    @apply rounded-[--vc-radius] outline-dashed outline-1 outline-offset-2 outline-neutral-300 transition-opacity;
  }
}
</style>

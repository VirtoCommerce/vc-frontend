<template>
  <!-- The class sits on an element this component owns: VcTooltip forwards attributes to VcPopover,
       which does not always render a single root to receive them. -->
  <span class="tracked-metric-hint">
    <VcTooltip placement="top">
      <template #trigger>
        <VcIcon name="hourglass" :size="14" :label="t('sales_rep.activity.tracked_hint')" />
      </template>

      <template #content>
        {{ t("sales_rep.activity.tracked_hint") }}
      </template>
    </VcTooltip>
  </span>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

// Marks a figure that comes from tracked storefront activity rather than from the platform's own data:
// it appears late (Google processes events for up to 48 hours) and it loads slowly (every uncached view
// is a request to Google). Both are properties of the source, not faults, so they are said once, here,
// wherever such a figure is shown.
const { t } = useI18n();
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.tracked-metric-hint {
  @apply inline-flex shrink-0 items-center align-middle text-neutral-400;
}
</style>

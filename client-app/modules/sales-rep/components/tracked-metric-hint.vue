<template>
  <!-- Own element for the class: VcTooltip forwards attributes to VcPopover, which may have no single root. -->
  <span class="tracked-metric-hint">
    <!-- lazy: otherwise the popover mounts at once and floating-ui's autoUpdate measures the trigger every
         frame, once per hint. -->
    <VcTooltip lazy placement="top">
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

// Marks a tracked (GA) figure with the one thing a reader can act on: it can take up to 48 hours to appear.
const { t } = useI18n();
</script>

<style lang="scss">
// @apply: module is self-contained as an MF remote (no global utility layer).
.tracked-metric-hint {
  @apply inline-flex shrink-0 items-center self-center text-neutral-400;

  // The tooltip's block wrappers leave VcIcon (inline-block, align-top) on the line box; flex them to centre it.
  .vc-popover,
  .vc-popover__trigger {
    @apply flex items-center;
  }

  .vc-icon {
    @apply block;
  }
}
</style>
